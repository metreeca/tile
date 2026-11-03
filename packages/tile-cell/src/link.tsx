/*
 * Copyright © 2023-2026 Metreeca srl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Route navigation control.
 *
 * Offers the control a reader moves to another route with, followed in place by the enclosing router or left to the
 * browser, and marked on request while the route it points at is current.
 *
 * @module
 */

import { useRoute } from "@metreeca/tile-data/router";
import { isString, type Scalar } from "@metreeca/core";
import {
	type ComponentChildren,
	createElement,
	isValidElement,
	type TargetedMouseEvent,
	toChildArray,
	type VNode
} from "preact";
import "./link.css";


/**
 * Creates a link.
 *
 * Shows its content on a native anchor, so the link role, the activation by `Enter`, the tab stop, the focus ring and
 * the browser's own handling of modified clicks come with it rather than having to be asked for. A plain click on a
 * route of the same site is followed by the enclosing {@link @metreeca/tile-data!router.Router Router} without
 * reloading the page.
 *
 * An `active` link, while the route it points at is current, is set apart from its neighbours by an underline in the
 * accent colour, and is announced as the current page, or as the current entry of a section where `href` covers the
 * routes nested under it, so a navigation menu tells the reader where they are whether or not they see it. The anchor
 * also carries an empty `active` attribute, for a stylesheet of the consumer's own to read.
 *
 * Reads the current route, so it renders below the {@link @metreeca/tile-data!router.Router Router}.
 *
 * @param options The widget configuration
 *
 * @returns The link
 *
 * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/link/ ARIA Authoring Practices: Link Pattern}
 */
export function Link({

	active,

	look, // deliberately left undefaulted, so an unstated look falls through to the ambient `--tile--look`

	href,
	query,
	title,

	onClick,

	children

}: {

	/**
	 * Whether the link is marked while the route it points at is current; never marked if omitted.
	 */
	active?: boolean


	/**
	 * How loud the link appears: `subtle` reads as the text around it, font and colour alike, `normal` adds the link
	 * colour and an underline, and `strong` is heavier in the link colour, underlined only under the pointer, as is
	 * `subtle`. Every look keeps the face and size of the text around it, turns to the hover colour under the pointer
	 * and holds it through the press. However loud, a marked link is underlined in the accent colour, thick except for
	 * `subtle`, where the mark is thinner and drawn closer to the text it sits under.
	 *
	 * A link stating nothing takes the look the area around it is written in, from the `--tile--look` token the
	 * design system carries, which is `normal` where nothing assigns it. Stating a look here answers to that alone.
	 */
	look?: "subtle" | "normal" | "strong"


	/**
	 * The route the link points at; a trailing `/*` extends the marking of an `active` link to every route nested under
	 * it, so `/users/*` links to `/users/` and is marked for `/users/123`, though not for `/users`.
	 */
	href: string

	/**
	 * The entries the link adds to the query of the route it points at, after any query `href` carries; none if omitted.
	 *
	 * The page reached reads them from its location, so a link hands over the criteria it is narrowed by, as a facet
	 * value linking to the catalogue filtered on it, and a link to the current route narrows the page in place with an
	 * entry in the history to go back by. The query never takes part in marking an `active` link.
	 */
	query?: { readonly [name: string]: Scalar }

	/**
	 * The hint the platform shows on resting the pointer on the link, such as where it leads; no hint if omitted.
	 *
	 * Beside content that names the link it names nothing. On a glyph standing alone with no label of its own it names
	 * the link, and is then spoken as a name rather than as an aside. Either way it reaches neither a reader who never
	 * rests the pointer nor one on a touch screen, so whatever a reader has to take in to follow the link belongs in
	 * its content rather than here.
	 */
	title?: string


	/**
	 * What activating the link is handed to, whether the activation comes from a pointer or from `Enter`; followed as a
	 * link if omitted. A link given a handler is never followed, by the enclosing router or by the browser, so the
	 * handler alone decides what the activation does, while `href` still states where the link points. The activation
	 * event is handed over as it stands, so a handler may read the modifier keys it carries.
	 *
	 * @param event The activation event
	 */
	onClick?: (event: TargetedMouseEvent<HTMLAnchorElement>) => void


	/**
	 * The content the link shows, naming it; a glyph standing alone carries a label of its own to be announced by.
	 *
	 * Wording running out of room is cut short with an ellipsis wherever the area around it keeps it to one line.
	 */
	children?: ComponentChildren

}) {

	const route = useRoute();

	const section = href.endsWith("/*");
	const target = section ? href.slice(0, -1) : href;

	const path = target.replace(/\?.*$/, ""); // the route carries no query, so marking compares the path alone

	const entries = Object.entries(query ?? {})
		.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`) // `+` would not read as a space
		.join("&");

	const marked = active && (section ? route.startsWith(path) : route === path);

	// `active` is no anchor attribute JSX knows of, so the anchor is created as the wrapper is

	return createElement("tile-link", { look }, createElement("a", {

		href: !entries ? target : `${target}${target.includes("?") ? "&" : "?"}${entries}`,
		title,

		active: marked ? "" : undefined,

		"aria-current": !marked ? undefined : section ? "true" : "page",

		// preventing the default action keeps the browser from following the link and the router from taking it over

		onClick: onClick && ((event: TargetedMouseEvent<HTMLAnchorElement>) => {
			event.preventDefault();
			onClick(event);
		})

	}, ...spans()));


	/**
	 * Sets each run of text in the content in a span of its own, leaving elements as they stand.
	 *
	 * Text left bare in the flex anchor would sit in an anonymous box that no rule can reach. The stylesheet could then
	 * neither shrink it nor end it in an ellipsis when the link runs out of room on a single line.
	 */
	function spans(): readonly VNode[] {

		return toChildArray(children)
			.map(child => isValidElement(child) ? child : `${child}`)
			.reduce(join, [])
			.map(item => isString(item) ? createElement("span", {}, item) : item);


		/**
		 * Returns the collected items with an item appended, merged into the last one if both are text.
		 */
		function join(items: readonly (VNode | string)[], item: VNode | string): readonly (VNode | string)[] {

			const last = items.at(-1);

			return isString(last) && isString(item) ? [...items.slice(0, -1), `${last}${item}`] : [...items, item];

		}

	}

}
