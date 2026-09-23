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
 * Link.
 *
 * Offers the control a reader moves to another route with, followed in place by the enclosing router or left to the
 * browser, and marked on request while the route it points at is current.
 *
 * @module
 */

import { useRoute } from "@metreeca/tile-data/router";
import { type ComponentChildren, createElement } from "preact";
import "./link.css";


/**
 * Creates a link.
 *
 * Shows its content on a native anchor, so the link role, the activation by `Enter`, the tab stop, the focus ring and
 * the browser's own handling of modified clicks come with it rather than having to be asked for. A plain click on a
 * route of the same site is followed by the enclosing {@link @metreeca/tile-data!router.Router Router} without
 * reloading the page, unless the link is `native`.
 *
 * An `active` link, while the route it points at is current, is set apart from its neighbours by a thick underline in
 * the accent colour, and is announced as the current page, or as the current entry of a section where `href` covers the
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
	native,

	look, // deliberately left undefaulted, so an unstated look falls through to the ambient `--tile--look`

	href,

	children

}: {

	/**
	 * Whether the link is marked while the route it points at is current; never marked if omitted.
	 */
	active?: boolean

	/**
	 * Whether the link is left to the browser rather than followed in place by the router, as for a page of the same
	 * site served outside the app or a download; followed in place if omitted.
	 */
	native?: boolean


	/**
	 * How loud the link appears: `subtle` reads as the text around it, told apart only by the link colour, `normal`
	 * adds an underline, and `strong` stands as a label of its own, smaller and heavier in the text colour with no
	 * underline, as a navigation entry does. However loud, a marked link is underlined thick in the accent colour.
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
	 * The content the link shows, naming it; a glyph standing alone carries a label of its own, so that the link has a
	 * name to be announced by.
	 */
	children?: ComponentChildren

}) {

	const route = useRoute();

	const wild = href.endsWith("/*");
	const head = wild ? href.slice(0, -1) : href;

	const current = active && (wild ? route.startsWith(head) : route === head);

	/*
	 * The `active` and `native` attributes are stated empty, as boolean attributes are: the former is what a
	 * stylesheet reads, the latter what the router reads to leave the link to the browser. Neither is an anchor
	 * attribute JSX knows of, so the anchor is created as the wrapper is.
	 *
	 * A look the consumer leaves out leaves the attribute off the wrapper as well, which is what lets the stylesheet
	 * tell a link asking for the ordinary step from one taking whatever the area around it is written in.
	 *
	 * A link covering nested routes stands for a section rather than for the page in view, so it is announced as the
	 * current entry of a set rather than as the current page.
	 */

	return createElement("tile-link", { look }, createElement("a", {

		href: head,

		active: current ? "" : undefined,
		native: native ? "" : undefined,

		"aria-current": !current ? undefined : wild ? "true" : "page"

	}, children));

}
