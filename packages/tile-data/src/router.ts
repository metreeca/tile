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
 * being handed either, and links mark themselves as active when they point at the current route.
 *
 * Routes are drawn from the location by a {@link Store}, so the same routing works over the location path or the
 * location hash.
 *
 * @module
 */

import { isDefined, isFunction, isNull, isString, Optional } from "@metreeca/core";
import { tidy } from "@metreeca/core/strings";
import { type ComponentChildren, createContext, createElement, type FunctionComponent, type VNode } from "preact";
import { useCallback, useContext, useEffect, useMemo, useReducer } from "preact/hooks";
import { app } from "./index.js";


const ActiveAttribute="active";
const NativeAttribute="native";
const TargetAttribute="target";

const RouteContext=createContext<string>("");
const RouterContext=createContext<Router>(() => {});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Route store.
 *
 * Decides which part of the browser location carries the route, translating in both directions between the location
 * and the routes a {@link Router} matches and navigates to. {@link path} and {@link hash} cover the common layouts.
 */
export interface Store {

	/**
	 * Reads the current route.
	 *
	 * @returns The route carried by the current browser location
	 */
	(): string;

	/**
	 * Converts a route to a browser location.
	 *
	 * @param route The route to be converted
	 *
	 * @returns The location, relative to the current one, that carries `route`
	 */
	(route: string): string;

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
	 * @returns The view rendering `route`; another route to redirect to; `undefined` if `route` is not handled, which
	 *     {@link Router} rejects
	 */
	(route: string): undefined | string | ComponentChildren;

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
	 * - a **redirection**: a route to render instead, where `{step}` is replaced with the matched named step, `{}` with
	 *   the whole matched route and a trailing `/*` with the matched trailing path
	 * - a **component**: rendered with the matched named steps as props, under their own names, and the matched
	 *   trailing path as `$`
	 * - an **element**: rendered as it is, without the matched steps; map the pattern to a component where the view
	 *   needs them
	 */
	readonly [pattern: string]: string | FunctionComponent | VNode;

}


/**
 * Route navigator.
 *
 * Moves the page to another route, updating the browser location, the document title and the history state together.
 */
export interface Router {

	/**
	 * Navigates to a route.
	 *
	 * The document title is set as {@link title} sets it. The enclosing {@link Router} renders again only if the route
	 * or the history state actually changes.
	 *
	 * @param route The route to navigate to, or the route, document title and history state to navigate to; an omitted
	 *     field keeps the current value, and a `null` state clears it
	 * @param replace True if the current history entry is to be replaced rather than followed by a new one; navigating
	 *     to the current route always replaces it
	 */
	(route: string | { route?: string, title?: string, state?: unknown }, replace?: boolean): void;

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
 *   page, targets another browsing context or is marked with {@link native}
 * - a link to another site opens in a new browsing context
 * - an image toggles its `active` attribute, so a stylesheet can enlarge it
 *
 * A page mounts a single router, as each one takes over the clicks of the whole page.
 *
 * @param options The router configuration
 *
 * @returns The view for the current route
 *
 * @throws {@link !Error Error} If the current route is not handled, or if its redirections loop
 */
export function Router({

	store=path,
	routes

}: {

	/**
	 * The store drawing routes from the browser location.
	 *
	 * @defaultValue {@link path}
	 */
	store?: Store

	/**
	 * The views for the routes, as a table or a switch.
	 *
	 * A table is prepared once for as long as the same object is passed: declare it outside the rendering component, so
	 * a new one is not prepared on every render.
	 */
	routes: Table | Switch

}) {

	const select=useMemo(() => isFunction(routes) ? routes : compile(routes), [routes]);


	const update=useReducer<number, void | Event>(v => v + 1, 0)[1]; // dispatched bare or as a popstate listener

	const click=useCallback((event: MouseEvent) => {

		const plain=!(event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.defaultPrevented);

		const origin=event.target instanceof Element ? event.target : undefined;

		const anchor=origin?.closest("a");
		const image=origin?.closest("img");

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


		function follow(href: string): void {

			const file="file:///";

			const route=href.startsWith(app.root) ? href.substring(app.root.length - 1)
				: href.startsWith(file) ? href.substring(file.length - 1)
					: "";

			if ( route ) {

				try {

					history.pushState(undefined, document.title, store(route));

				} finally {

					update();

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

	}, [store]);


	useEffect(() => {

		window.addEventListener("popstate", update);
		window.addEventListener("click", click);

		return () => {
			window.removeEventListener("popstate", update);
			window.removeEventListener("click", click);
		};

	}, [update, click]);


	const router=useCallback<Router>((entry, replace) => {

		const { route, title, state }=isString(entry)
			? { route: entry, title: undefined, state: undefined }
			: entry;

		const $route=isDefined(route) ? store(route) : location.href;
		const $title=normalizeTitle(title);
		const $state=!isDefined(state) ? history.state : isNull(state) ? undefined : state;

		const modified=$route !== location.href || $state !== history.state;

		document.title=$title;

		try {

			history[replace || $route === location.href ? "replaceState" : "pushState"]($state, $title, $route);

		} finally {

			if ( modified ) {

				update();

			} else {

				// nothing changed: skip rendering

			}

		}

	}, [store]);


	const route=store();

	return createElement(RouterContext.Provider, { value: router },
		createElement(RouteContext.Provider, { value: route }, lookup(route, select))
	);

}


/**
 * Retrieves the current route.
 *
 * Renders the component again whenever the route changes, whether through navigation or browser history.
 *
 * @returns The current route, as drawn by the store of the innermost enclosing {@link Router}; an empty string outside
 *     any router
 */
export function useRoute(): string {
	return useContext(RouteContext);
}

/**
 * Retrieves the route navigator.
 *
 * The navigator stays the same for as long as the {@link Router} providing it keeps its store, so a component reading
 * it renders again only as its own state requires, and a handler may keep it across navigations.
 *
 * @returns The navigator provided by the innermost enclosing {@link Router}; a no-op outside any router
 */
export function useRouter(): Router {
	return useContext(RouterContext);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Carries routes in the location path.
 *
 * The {@link Store route store} for sites served with a fallback to the app page, so every path reaches it: routes
 * are read as root-relative paths such as `/users/123`, and a navigator also accepts routes relative to the current
 * one, such as `../posts`.
 *
 * @param route The route to be converted to a location; the current route is read if omitted
 *
 * @returns The current location path, without query and hash, if `route` is omitted; the location carrying `route`
 *     otherwise, a relative route resolving against the current location as a link would
 */
export function path(route?: string): string {
	return !isDefined(route) ? location.pathname : route;
}

/**
 * Carries routes in the location hash.
 *
 * The {@link Store route store} for sites serving the app page at a single location: routes live in the fragment,
 * so navigation never reaches the server.
 *
 * @param route The route to be converted to a location; the current route is read if omitted
 *
 * @returns The current location hash, without the leading `#`, if `route` is omitted; the fragment carrying `route`
 *     otherwise, so that reading the route back from it yields `route`
 */
export function hash(route?: string): string {
	return !isDefined(route) ? location.hash.substring(1) : `#${route}`;
}


/**
 * Links to a route, marking the link while the route is current.
 *
 * Spread over an anchor, so navigation menus and tabs can style the entry for the current route through its `active`
 * attribute. Reads the current route as {@link useRoute} does, so it is subject to the same rules as a hook: call it
 * while rendering, below the {@link Router}.
 *
 * @param route The route to link to; a trailing `*` marks the link for every route nested under it as well, so
 *     `/users/*` links to `/users/` and is marked for `/users/123`, though not for `/users`
 *
 * @returns An attribute spread linking to `route`, with an empty `active` attribute if the link is marked
 */
export function active(route: string): { href: string, [ActiveAttribute]?: "" } {

	const wild=route.endsWith("*");

	const href=wild ? route.substring(0, route.length - 1) : route;

	const current=useContext(RouteContext);

	return { href, [ActiveAttribute]: (wild ? current.startsWith(href) : current === href) ? "" : undefined };

}

/**
 * Links to a location, leaving the link to the browser.
 *
 * Spread over an anchor whose clicks the {@link Router} is not to take over, such as a link to a page of the same
 * site served outside the app or to a download.
 *
 * @param route The location to link to
 *
 * @returns An attribute spread linking to `route`, with an empty `native` attribute
 */
export function native(route: string): { href: string, [NativeAttribute]?: "" } {
	return { href: route, [NativeAttribute]: "" };
}


/**
 * Sets the document title.
 *
 * Tidies whitespace and qualifies the title with the {@link app} name, as `Title | App`, so every page names the app
 * alongside itself; an empty title, or one equal to the app name, leaves the app name alone.
 *
 * @param title The title of the current page
 */
export function title(title: string): void {
	document.title=normalizeTitle(title);
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
				: isFunction(entry) ? createElement(entry, { ...match.groups })
					: entry;
	}


	const rules=Object.entries(table).map(([glob, entry]) => ({ pattern: pattern(glob), entry }));

	return route => rules.reduce<ReturnType<Switch>>((view, { pattern, entry }) =>
		view ?? resolve(route, pattern.exec(route), entry), undefined
	);

}

function lookup(route: string, select: Switch): ComponentChildren {

	function follow(current: string, trail: readonly string[]): ComponentChildren {

		const view=select(current);

		if ( !isDefined(view) ) {

			throw new Error(`unhandled route ${route}`);

		} else if ( !isString(view) ) {

			return view;

		} else if ( trail.includes(view) ) {

			throw new Error(`redirection loop <${trail.join(",")}>`);

		} else {

			return follow(view, [...trail, view]);

		}

	}

	return follow(route, [route]);

}


function normalizeTitle(title: Optional<string>): string {
	return tidy(!isDefined(title) ? document.title
		: title === app.name ? app.name
			: title && app.name ? `${title} | ${app.name}`
				: title ? title
					: app.name ?? ""
	);
}
