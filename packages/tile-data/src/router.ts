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
 * Client-side routing.
 *
 * Maps the browser location to the view a page renders, keeping the two in step: {@link Router} renders the view for
 * the current route and renders it again as the route changes, whether a component navigates, a local link is
 * followed or the browser moves through its history. Components below it read the current route and navigate without
 * being handed either.
 *
 * Routes are carried by the location path or by the location hash, as the site serving the page requires, and the same
 * routing works over either.
 *
 * @module
 */

import { isDefined, isFunction, isNull, isString, Optional } from "@metreeca/core";
import { unique } from "@metreeca/core/arrays";
import { tidy } from "@metreeca/core/strings";
import { type ComponentChildren, createContext, createElement, type VNode } from "preact";
import { useCallback, useContext, useEffect, useState } from "preact/hooks";
import { app } from "./index.js";


const ActiveAttribute = "active";
const NativeAttribute = "native";
const TargetAttribute = "target";

const RouteContext = createContext<string>("");
const RouterContext = createContext<Router>(() => {});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Route navigator.
 *
 * Moves the page to another route, updating the browser location, the document title and the history state together.
 */
export interface Router {

	/**
	 * Navigates to a route.
	 *
	 * The document title is tidied and qualified with the {@link app} name, as `Title | App`, so every page names the
	 * app alongside itself; an empty title, or one equal to the app name, leaves the app name alone. Passing a title
	 * alone sets it without navigating. The enclosing {@link Router} renders again only if the route actually changes.
	 *
	 * @param route The route to navigate to, or the route, document title and history state to navigate to; an omitted
	 *     field keeps the current value, and a `null` state clears it
	 * @param replace True if the current history entry is to be replaced rather than followed by a new one; navigating
	 *     to the current route always replaces it
	 */
	(route: string | { route?: string, title?: string, state?: unknown }, replace?: boolean): void;

}


/**
 * Routing switch.
 *
 * Decides in code what a route renders, where a {@link Table} of patterns is not expressive enough.
 */
export interface Switch {

	/**
	 * Selects the view for a route.
	 *
	 * @param route The route to be rendered
	 *
	 * @returns The view rendering `route`; another route to redirect to, which the location is moved to as a
	 *     {@link Table} redirection moves it; `undefined` if `route` is not handled, which makes {@link Router} throw
	 */
	(route: string): string | ComponentChildren;

}

/**
 * Routing table.
 *
 * Declares what each route renders as a map from route patterns to views or redirections. A route is handled by the
 * first pattern it matches, in table order, so specific patterns go before the general ones they overlap; the query
 * and the hash of a route never take part in matching.
 */
export interface Table {

	/**
	 * The view or redirection for the routes matching a pattern.
	 *
	 * A pattern is matched against the whole route and may include the following wildcards, where `step` is a
	 * sequence of word characters; a lone `*` matches any route:
	 *
	 * - `{step}` matches a non-empty named path step
	 * - `{}` matches a non-empty anonymous path step
	 * - `/*` at the end matches a trailing path, possibly empty
	 *
	 * A pattern maps to one of:
	 *
	 * - a **redirection**: a route to move to instead, where `{step}` is replaced with the matched named step, `{}` with
	 *   the whole matched route and a trailing `/*` with the matched trailing path; the location is moved along,
	 *   replacing the current history entry, so going back never lands on the route redirected from
	 * - an **element**: the view, rendered as it is; a view needing the matched steps reads the route with
	 *   {@link useRoute}, or is selected by a {@link Switch}
	 */
	readonly [pattern: string]: string | VNode;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Renders the view for the current route.
 *
 * Provides the current route and a navigator to the components below it, through {@link useRoute} and
 * {@link useRouter}, and renders again whenever the route changes, whether through navigation or browser history.
 *
 * Takes over plain clicks anywhere in the page, leaving clicks with a modifier key or already handled to the browser:
 *
 * - a link to the same site is followed without reloading the page, unless it points at a fragment of the current
 *   page, targets another browsing context or carries a `native` attribute
 * - a link to another site opens in a new browsing context
 * - an image toggles its `active` attribute, which the `@metreeca/tile` stylesheet reads to show it over the whole
 *   viewport
 *
 * An enlarged image is restored by another click on it, by `Escape`, or as soon as the focus moves, so a keyboard user
 * never ends up on a control the image covers. Enlarging is a visual convenience over content the image already
 * carries, through its alternative text and the browser zoom, so images are not made reachable from the keyboard.
 *
 * A page mounts a single router, as each one takes over the clicks and keys of the whole page.
 *
 * @param options The router configuration
 *
 * @returns The view for the current route
 *
 * @throws {@link !Error Error} If the current route is not handled, or if its redirections loop
 */
export function Router({

	mode = "path",

	routes

}: {

	/**
	 * The part of the browser location carrying the route:
	 *
	 * - `path`, for sites served with a fallback to the app page, so every path reaches it: routes are read as
	 *   root-relative paths such as `/users/123`, and a navigator also accepts routes relative to the current one, such
	 *   as `../posts`, resolving them as a link would
	 * - `hash`, for sites serving the app page at a single location: routes live in the fragment, as in `#/users/123`,
	 *   so navigation never reaches the server
	 *
	 * @defaultValue `"path"`
	 */
	mode?: "path" | "hash"

	/**
	 * The views for the routes, as a table or a switch.
	 */
	routes: Table | Switch

}) {

	const select = isFunction(routes)
		? routes
		: compile(routes);

	const read = mode === "hash"
		? () => location.hash.substring(1)
		: () => location.pathname;

	const [route, setRoute] = useState(read);

	const sync = () => setRoute(read()); // renders again only if the route actually changed

	const [target, view] = lookup(route, select);


	useEffect(() => {

		if ( target !== route ) {

			// a redirection replaces the entry it came from, so going back never lands on it again

			history.replaceState(history.state, document.title, mode === "hash" ? `#${target}` : target);
			sync();

		} else {

			// the location already carries the route on show

		}

	}, [target, route, mode]);


	useEffect(() => {

		function click(event: MouseEvent): void {

			const plain = isPlain(event);
			const origin = event.target instanceof Element ? event.target : undefined;

			const anchor = origin?.closest("a");
			const image = origin?.closest("img");

			if ( plain && anchor
				&& !anchor.getAttribute("href")?.startsWith("#")
				&& !anchor.hasAttribute(NativeAttribute)
				&& (anchor.getAttribute(TargetAttribute) ?? "_self") === "_self"
			) {

				event.preventDefault();
				follow(anchor.href);

			} else if ( plain && image ) {

				toggle(image);

			} else {

				// modified, already handled and unrelated clicks keep their default behaviour

			}


			function isPlain(event: MouseEvent) {
				return !event.altKey
					&& !event.ctrlKey
					&& !event.metaKey
					&& !event.shiftKey
					&& !event.defaultPrevented;
			}

			function follow(href: string): void {

				const route = href.startsWith(app.root) ? href.substring(app.root.length-1) : "";

				if ( route ) {

					try {

						history.pushState(undefined, document.title, mode === "hash" ? `#${route}` : route);

					} finally {

						sync();

					}

				} else {

					window.open(href, "_blank");

				}

			}

			function toggle(image: HTMLImageElement): void {

				if ( image.getAttribute(ActiveAttribute) ) {

					image.removeAttribute(ActiveAttribute);

				} else {

					image.setAttribute(ActiveAttribute, "true");

				}

			}

		}

		function keydown(event: KeyboardEvent): void {

			const images = enlarged();

			if ( event.key === "Escape" && images.length > 0 ) {

				event.preventDefault();
				restore(images);

			} else {

				// keys the router has no use for keep their default behaviour

			}

		}

		function focusin(): void {
			restore(enlarged()); // the focus never lands on a control hidden behind an enlarged image
		}


		function enlarged(): NodeListOf<HTMLImageElement> {
			return document.querySelectorAll(`img[${ActiveAttribute}]`);
		}

		function restore(images: NodeListOf<HTMLImageElement>): void {
			images.forEach(image => image.removeAttribute(ActiveAttribute)); // DOM side effect, nothing to collect
		}


		sync(); // catches up with a location changed before the listeners were in place, or read in another mode

		window.addEventListener("popstate", sync);
		window.addEventListener("click", click);
		window.addEventListener("keydown", keydown);
		window.addEventListener("focusin", focusin);

		return () => {
			window.removeEventListener("popstate", sync);
			window.removeEventListener("click", click);
			window.removeEventListener("keydown", keydown);
			window.removeEventListener("focusin", focusin);
		};

	}, [mode]);


	const router = useCallback<Router>((entry, replace) => {

		const { route, title, state } = isString(entry)
			? { route: entry, title: undefined, state: undefined }
			: entry;

		const $route = !isDefined(route) ? location.href : mode === "hash" ? `#${route}` : route;
		const $title = normalizeTitle(title);
		const $state = !isDefined(state) ? history.state : isNull(state) ? undefined : state;

		document.title = $title;

		try {

			history[replace || $route === location.href ? "replaceState" : "pushState"]($state, $title, $route);

		} finally {

			sync();

		}

	}, [mode]);


	return createElement(RouterContext.Provider, { value: router },
		createElement(RouteContext.Provider, { value: target }, view)
	);

}


/**
 * Retrieves the route navigator.
 *
 * The navigator stays the same for as long as the {@link Router} providing it keeps its mode, so a component reading
 * it renders again only as its own state requires, and a handler may keep it across navigations.
 *
 * @returns The navigator provided by the innermost enclosing {@link Router}; a no-op outside any router
 */
export function useRouter(): Router {
	return useContext(RouterContext);
}

/**
 * Retrieves the current route.
 *
 * Renders the component again whenever the route changes, whether through navigation or browser history.
 *
 * @returns The current route, as carried by the location in the mode of the innermost enclosing {@link Router}; an
 *     empty string outside any router
 */
export function useRoute(): string {
	return useContext(RouteContext);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function compile(table: Table): Switch {

	function pattern(glob: string): RegExp {
		return new RegExp(glob === "*" ? "^.*$" : `^${glob

			.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") // escape special regex characters
			.replace(/\\{(\w+)\\}/g, "(?<$1>[^/]+)") // named steps
			.replace(/\\{\\}/g, "(?:[^/]+)") // anonymous steps
			.replace(/\/\\\*$/, "(?<$>/.*)") // trailing path

		}([?#].*)?$`); // ignore trailing query/hash
	}

	function resolve(
		route: string, match: null | RegExpExecArray, entry: Table[string]
	): ReturnType<Switch> {
		return isNull(match) ? undefined
			: isString(entry) ? entry.replace(/{(\w*)}|\/\*$/g, (reference, step) => reference === "/*"
					? match.groups?.$ || ""
					: step ? match.groups?.[step] || "" : route
				)
				: entry;
	}


	return route => Object.entries(table).reduce<ReturnType<Switch>>((view, [glob, entry]) =>
			view ?? resolve(route, pattern(glob).exec(route), entry), undefined // patterns past the first match are not
		// compiled
	);

}

function lookup(route: string, select: Switch): readonly [target: string, view: ComponentChildren] {

	function follow(current: string, trail: readonly string[]): readonly [target: string, view: ComponentChildren] {

		const view = select(current);

		if ( !isDefined(view) ) {

			throw new Error(`unhandled route ${route}`);

		} else if ( !isString(view) ) {

			return [current, view];

		} else if ( trail.includes(view) ) {

			throw new Error(`redirection loop <${trail.join(",")}>`);

		} else {

			return follow(view, [...trail, view]);

		}

	}

	return follow(route, [route]);

}


function normalizeTitle(title: Optional<string>): string {
	return tidy(isDefined(title) ? unique([title, app.name]).filter(Boolean).join(" | ") : document.title);
}
