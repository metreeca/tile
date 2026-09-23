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
 * Router context.

 * @module
 */

import { isString, Optional } from "@metreeca/core";
import { tidy } from "@metreeca/core/strings";
import { type ComponentChildren, createContext, createElement, type FunctionComponent } from "preact";
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
 */
export interface Store {

	/**
	 * Converts browser location to a route.
	 *
	 * @returns the current route as extracted from the current browser location
	 */
	(): string;

	/**
	 * Converts a route to a browser location.
	 *
	 * @param route the route to be converted
	 *
	 * @returns a root-relative string representing `route`
	 */
	(route: string): string;

}

/**
 * Routing switch.
 */
export interface Switch {

	/**
	 * Retrieves a component responsible for rendering a route.
	 *
	 * @param route the route to be rendered
	 *
	 * @returns a a rendering of `route` or a new route if a redirection is required
	 */
	(route: string): undefined | string | ComponentChildren;

}

/**
 * Routing table.
 */
export interface Table {

	/**
	 * Maps glob patterns either to components or redirection patterns.
	 *
	 * Patterns may include the following wildcards, where `step` is a sequence of word chars:
	 *
	 * - `{step}` matches a non empty named path step
	 * - `{}` matches a non-empty anonymous path step
	 * - `/*` matches a trailing path
	 *
	 * Redirection patterns may refer to wildcards in the matched route pattern as:
	 *
	 * - `{step}` replaced with the matched non empty named path step
	 * - `{}` replaced with the whole matched route
	 * - `/*` replaced with the matched trailing path
	 *
	 * Named path step in the matched route pattern are also included in the `props` argument of the component as:
	 *
	 * - `step` the matched non empty named path step
	 * - `$` the matched trailing path
	 */
	readonly [pattern: string]: string | FunctionComponent;

}


/**
 * Route navigator.
 */
export interface Router {

	/**
	 * Navigates to a route.
	 *
	 * @param route The route to navigate to, or the route, document title and history state to navigate to; an omitted
	 *     field keeps the current value
	 * @param replace true if the current history entry is to be replaced rather than followed by a new one
	 */
	(route: string | { route?: string, title?: string, state?: unknown }, replace?: boolean): void;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function Router({

	store=path,

	children

}: {

	/**
	 * The route store
	 *
	 * @default {@link path}
	 */
	store?: Store

	children: Table | Switch

}) {

	const select=useMemo(() => children instanceof Function ? children : compile(children), [children]);


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

		const $route=route === undefined ? location.href : store(route);
		const $title=normalizeTitle(title);
		const $state=state === undefined ? history.state : state === null ? undefined : state;

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
 * @returns The current route as extracted by the store of the innermost enclosing {@link Router} context; an empty
 *     string outside any such context
 */
export function useRoute(): string {
	return useContext(RouteContext);
}

/**
 * Retrieves the route navigator.
 *
 * The navigator stands for as long as the {@link Router} context offering it keeps its store, so a component
 * reading it renders again only as its own state requires, and a handler may keep it across navigations.
 *
 * @returns The navigator offered by the innermost enclosing {@link Router} context; a no-op outside any such
 *     context
 */
export function useRouter(): Router {
	return useContext(RouterContext);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * The path {@link Store route store}.
 *
 * @return a function managing routes as relative-relative paths including search and hash
 */
export function path(route?: string): string {
	return route === undefined ? location.pathname
		: route.startsWith("/") ? route
			: `${location.pathname}${location.search}${location.hash}`;
}

/**
 * The hash {@link Store route store}.
 *
 * @return a function managing routes as hashes
 */
export function hash(route?: string): string {
	return route === undefined ? location.hash.substring(1)
		: route.startsWith("#") ? route
			: `${location.search}${location.hash}`;
}


/**
 * Creates an attribute spread for active links.
 *
 * @param route the target link route; may include a trailing `*` to match nested routes
 *
 * @return an attribute spread including an `href` attribute for `route` and an optional `active` boolean
 * attribute if `route` matches the current route
 */
export function active(route: string): { href: string, [ActiveAttribute]?: "" } {

	const wild=route.endsWith("*");

	const href=wild ? route.substring(0, route.length - 1) : route;

	const current=useContext(RouteContext);

	return { href, [ActiveAttribute]: (wild ? current.startsWith(href) : current === href) ? "" : undefined };

}

/**
 * Creates an attribute spread for native links.
 *
 * @param route the target link route
 *
 * @return an attribute spread including an `href` attribute for `route` and an `native` boolean attribute
 */
export function native(route: string): { href: string, [NativeAttribute]?: "" } {
	return { href: route, [NativeAttribute]: "" };
}


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
		route: string, match: null | RegExpExecArray, entry: string | FunctionComponent
	): ReturnType<Switch> {
		return match === null ? undefined
			: isString(entry) ? entry.replace(/{(\w*)}|\/\*$/g, (reference, step) => reference === "/*"
				? match.groups?.$ || ""
				: step ? match.groups?.[step] || "" : route
			)
				: createElement(entry, { ...match.groups });
	}


	const rules=Object.entries(table).map(([glob, entry]) => ({ pattern: pattern(glob), entry }));

	return route => rules.reduce<ReturnType<Switch>>((view, { pattern, entry }) =>
		view ?? resolve(route, pattern.exec(route), entry), undefined
	);

}

function lookup(route: string, select: Switch): ComponentChildren {

	function follow(current: string, trail: readonly string[]): ComponentChildren {

		const view=select(current);

		if ( view === undefined ) {

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
	return tidy((title === undefined) ? document.title
		: title === app.name ? app.name
			: title && app.name ? `${title} | ${app.name}`
				: title ? title
					: app.name ?? ""
	);
}
