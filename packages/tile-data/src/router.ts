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
 * Maps the browser location to the view a page renders, keeping the two in step: {@link Router} tracks the current
 * route as it changes, whether a component navigates, a local link is followed or the browser moves through its
 * history, and {@link Routes} renders the view for it wherever the page layout places it. Components below the router
 * read the current route and navigate without being handed either.
 *
 * Routes are carried by the location path or by the location hash, as the site serving the page requires, and the same
 * routing works over either.
 *
 * @module
 */

import { isDefined, isNull, isString, Optional } from "@metreeca/core";
import { unique } from "@metreeca/core/arrays";
import { tidy } from "@metreeca/core/strings";
import { type ComponentChildren, createContext, createElement, type VNode } from "preact";
import { useCallback, useContext, useEffect, useLayoutEffect, useState } from "preact/hooks";
import { app } from "./index.js";


const ActiveAttribute = "active";
const TargetAttribute = "target";

/**
 * The routing provided by the enclosing {@link Router}.
 */
const RouterContext = createContext<Readonly<{

	/**
	 * The route in the browser address bar, as returned by {@link useRoute}.
	 */
	route: string

	/**
	 * The handler for the routes no {@link Routes} handles.
	 */
	fallback: Optional<string | VNode>

	/**
	 * The navigator, as returned by {@link useRouter}.
	 */
	navigate: Router

}>>({

	route: "",

	fallback: undefined,
	navigate: () => {}

});

/**
 * The part of the route already matched by the subtree patterns of the enclosing {@link Routes}, empty at the top
 * level: under the pattern `/users/`, the section is `/users` and a nested table sees `/all` for the route
 * `/users/all`.
 */
const SectionContext = createContext("");


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


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Tracks the current route.
 *
 * Provides the current route and a navigator to the components below it, through {@link useRoute} and
 * {@link useRouter}, and renders again whenever the route changes, whether through navigation or browser history.
 * The views for the current route are selected by the {@link Routes} nested below it.
 *
 * Takes over plain clicks anywhere in the page, leaving clicks with a modifier key or already handled to the browser:
 *
 * - a link to the same site is followed without reloading the page, unless it points at a fragment of the current
 *   page or targets another browsing context
 * - a link to another site opens in a new browsing context
 * - an image outside any link toggles its `active` attribute, which the `@metreeca/tile` stylesheet reads to show it
 *   over the whole viewport; an image inside a link is left to the link
 *
 * An enlarged image is restored by another click on it, by `Escape`, or as soon as the focus moves, so a keyboard user
 * never ends up on a control the image covers. Enlarging is a visual convenience over content the image already
 * carries, through its alternative text and the browser zoom, so images are not made reachable from the keyboard.
 *
 * A page mounts a single router, as each one takes over the clicks and keys of the whole page.
 *
 * @param options The router configuration
 *
 * @returns The rendered children
 */
export function Router({

	mode = "path",

	fallback,
	children

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
	 * The handler for routes no {@link Routes} below the router handles, as one of:
	 *
	 * - a **redirection**: an absolute route to move to instead, replacing the current history entry, such as `/`
	 *   to send unknown routes to the home page
	 * - an **element**: the view, rendered in place of the view of the {@link Routes} that handles nothing, so a
	 *   not-found page shows within the layout of the section the route falls in; the view reads the unhandled route
	 *   with {@link useRoute}
	 *
	 * Where omitted, an unhandled route is rejected.
	 */
	fallback?: string | VNode

	/**
	 * The content rendered within the router, nesting the {@link Routes} that select the views for the current route.
	 */
	children?: ComponentChildren

}) {

	const read = mode === "hash"
		? () => location.hash.substring(1)
		: () => location.pathname;

	const [route, setRoute] = useState(read);

	const sync = () => setRoute(read()); // renders again only if the route actually changed


	useEffect(() => {

		function click(event: MouseEvent): void {

			const plain = isPlain(event);
			const origin = event.target instanceof Element ? event.target : undefined;

			const anchor = origin?.closest("a");
			const image = origin?.closest("img");

			if ( plain && anchor
				&& !anchor.getAttribute("href")?.startsWith("#")
				&& (anchor.getAttribute(TargetAttribute) ?? "_self") === "_self"
			) {

				event.preventDefault();
				follow(anchor.href);

			} else if ( plain && image && !anchor ) {

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


	const navigate = useCallback<Router>((entry, replace) => {

		const { route, title, state } = isString(entry)
			? { route: entry, title: undefined, state: undefined }
			: entry;

		const $route = route === undefined
			? location.href
			: new URL(mode === "hash" ? `#${route}` : route, location.href).href;

		const $title = title === undefined
			? document.title
			: unique([tidy(title), app.name]).filter(Boolean).join(" | ");

		const $state = state === undefined
			? history.state
			: state;

		document.title = $title;

		try {

			history[replace || $route === location.href ? "replaceState" : "pushState"]($state, $title, $route);

		} finally {

			sync();

		}

	}, [mode]);


	return createElement(RouterContext.Provider, { value: { route, fallback, navigate } }, children);

}


/**
 * Renders the view for the current route.
 *
 * Selects the view through a table of route patterns, moving the location along any redirection on the way, and
 * renders it wherever the page layout places it.
 *
 * Within a view mapped to a subtree pattern, routes the routes below the subtree as a section of its own, so a section
 * declares its sub-routes where it is implemented rather than in the table at the top of the app, and keeps working
 * wherever that table mounts it. Sections nest to any depth, each one matching what the enclosing one left over. A
 * view mapped to a subtree handles every route below it, whether or not it renders a nested {@link Routes}.
 *
 * Patterns and redirections are relative to the section, starting at its root `/`: under `/users/`, the pattern
 * `/{id}` matches `/users/123`, and the redirection `/all` moves the location to `/users/all`. Components below still
 * read the full route with {@link useRoute} and navigate with {@link useRouter}, so links and navigators keep working
 * unchanged wherever a section is mounted.
 *
 * Renders below a {@link Router}, which keeps sole charge of the location, the history and the page clicks. Below a
 * view selected by a pattern other than a subtree, the section sees the whole route that view was selected for.
 *
 * Renders nothing while moving the location, along a redirection or to the fallback route, so no view ever shows for
 * a route on its way out and the nested {@link Routes} only ever see the route the location carries.
 *
 * @param options The routes configuration
 *
 * @returns The view for the current route
 *
 * Routes the table leaves unhandled go to the {@link Router} fallback.
 *
 * @throws {@link !Error Error} If the table holds a pattern that does not start with `/`, whatever the current route
 * @throws {@link !Error Error} If the current route, or a route it redirects to, matches no table pattern and the
 *     {@link Router} has no fallback, or its fallback route matches no table pattern either
 * @throws {@link !Error Error} If redirections lead back to a route already visited
 */
export function Routes({

	children

}: {

	/**
	 * The views for the routes, as a table mapping route patterns to views or redirections.
	 *
	 * A route is handled by the first pattern it matches, in table order, so specific patterns go before the general
	 * ones they overlap; the query and the hash of a route never take part in matching.
	 *
	 * A pattern is matched against the whole route and may include the following wildcards, where `step` is a
	 * sequence of word characters:
	 *
	 * - `{step}` matches a non-empty named path step
	 * - `{}` matches a non-empty anonymous path step
	 * - `/` at the end, except in the root pattern `/`, makes the pattern a **subtree**, matching the route up to it
	 *   along with every route below it
	 *
	 * A pattern maps to one of:
	 *
	 * - a **redirection**: a route to move to instead, where `{step}` is replaced with the matched named step; a
	 *   redirection ending with `/` from a subtree carries the route below the subtree along; the location is moved
	 *   along, replacing the current history entry, so going back never lands on the route redirected from
	 * - an **element**: the view, rendered as it is; a view needing the matched steps reads the route with
	 *   {@link useRoute}; a view mapped to a subtree handles every route below it, routing them with a nested
	 *   {@link Routes} where it needs to tell them apart
	 */
	children: { readonly [pattern: string]: string | VNode }

}): ComponentChildren {

	const { route, fallback, navigate } = useContext(RouterContext);
	const section = useContext(SectionContext);

	const resolution = resolve(children, route, section, fallback);
	const target = "move" in resolution ? resolution.move : undefined;


	useLayoutEffect(() => { // moves the location before the blank render paints; the router renders again on its own

		if ( isDefined(target) ) {

			navigate(target, true); // replacing the entry moved from, so going back never lands on it

		} else {

			// the location already carries the route on show

		}

	}, [target, navigate]);


	return "show" in resolution
		? createElement(SectionContext.Provider, { value: resolution.section }, resolution.show)
		: null;

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
	return useContext(RouterContext).navigate;
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
	return useContext(RouterContext).route;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

type Table = Parameters<typeof Routes>[0]["children"];

/**
 * What a {@link Routes} does for the current route: either move the location to another route, or show a view
 * handling the section below it.
 */
type Resolution = Readonly<{ move: string } | { show: VNode, section: string }>;

/**
 * What a table holds for a section route, after redirections: the route, the part of it matched by a subtree
 * pattern, empty otherwise, and the view for it, undefined if no pattern matches.
 */
type Match = Readonly<{ route: string, section: string, view: Optional<VNode> }>;


/**
 * Resolves the current route against a table, falling back to the {@link Router} fallback for routes the table
 * leaves unhandled.
 */
function resolve(table: Table, route: string, section: string, fallback: Optional<string | VNode>): Resolution {

	const invalid = Object.keys(table).find(glob => !glob.startsWith("/"));

	if ( isDefined(invalid) ) {

		throw new Error(`invalid route pattern <${invalid}>`);

	} else {

		const rest = route.slice(section.length);
		const matched = match(table, rest, [rest]);
		const current = `${section}${matched.route}`;

		if ( current !== route ) {

			return { move: current }; // redirected

		} else if ( isDefined(matched.view) ) {

			return { show: matched.view, section: `${section}${matched.section}` };

		} else if ( !isDefined(fallback) || fallback === current ) { // no fallback, or the fallback route itself unhandled

			throw new Error(`unhandled route ${rest}`);

		} else if ( isString(fallback) ) {

			return { move: fallback };

		} else {

			return { show: fallback, section };

		}

	}

}

/**
 * Matches a section route against a table, following redirections.
 */
function match(table: Table, route: string, trail: readonly string[]): Match {

	const hit = Object.entries(table).flatMap(([glob, entry]) => {

		const steps = pattern(glob).exec(route);

		return isNull(steps) ? [] : [{ entry, steps }];

	}).at(0); // the first pattern in table order

	const tail = hit?.steps.groups?.$; // the route below a subtree, undefined for other patterns

	if ( !isDefined(hit) ) {

		return { route, section: "", view: undefined };

	} else if ( !isString(hit.entry) ) {

		return { route, section: isDefined(tail) ? route.slice(0, -tail.length) : "", view: hit.entry };

	} else {

		const target = redirect(hit.entry, hit.steps, tail);

		if ( trail.includes(target) ) {

			throw new Error(`redirection loop <${trail.join(",")}>`);

		} else {

			return match(table, target, [...trail, target]);

		}

	}

}

/**
 * Fills a redirection with the matched named steps, carrying the route below a subtree along after a trailing `/`.
 */
function redirect(target: string, steps: RegExpExecArray, tail: Optional<string>): string {

	const filled = target.replace(/{(\w+)}/g, (_, step) => steps.groups?.[step] ?? "");

	return isDefined(tail) && filled.endsWith("/") ? `${filled.slice(0, -1)}${tail}` : filled;

}

/**
 * Compiles a route pattern, capturing named steps under their name and the route below a subtree under `$`.
 */
function pattern(glob: string): RegExp {

	const subtree = glob.length > 1 && glob.endsWith("/");
	const steps = subtree ? glob.slice(0, -1) : glob;

	return new RegExp(`^${steps

		.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // escape regex metacharacters
		.replace(/\\{(\w+)\\}/g, "(?<$1>[^/]+)") // named steps
		.replace(/\\{\\}/g, "[^/]+") // anonymous steps

	}${subtree ? "(?<$>/.*)" : "(?:[?#].*)?"}$`); // the route below a subtree, or the ignored query and hash

}
