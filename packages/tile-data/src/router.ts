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
 * Routes are carried by the location path, as root-relative paths such as `/users/123`, so the site serving the page
 * falls back to the app page for every path it routes.
 *
 * # Route Tables
 *
 * {@link Routes} selects the view through a table mapping route patterns to views or redirections:
 *
 * ```tsx
 * <Routes>{{
 *     "/": <Home/>,
 *     "/users/": <Users/>,
 *     "/people/:id": "/users/:id",
 *     "*": <NotFound/>
 * }}</Routes>
 * ```
 *
 * A route is handled by the first pattern it matches, in table order, so specific patterns go before the general ones
 * they overlap. The query and the hash of a route never take part in matching, and a route matching no pattern is
 * rejected, unless an enclosing table declares a catch-all the table inherits, as described under *Sections*.
 *
 * # Route Patterns
 *
 * A pattern other than the catch-all starts with `/`, and every pattern is matched against the whole route:
 *
 * | Pattern                | Kind      | Matches                      | Section sees |
 * |------------------------|-----------|------------------------------|--------------|
 * | `/`                    | root      | `/` alone                    | `/`          |
 * | `/collection/resource` | exact     | `/collection/resource` alone | `/`          |
 * | `/collection/:slug`    | exact     | `/collection/{slug}`         | `/`          |
 * | `/collection/`         | subtree   | `/collection/`               | `/`          |
 * |                        |           | `/collection/{path}`         | `/{path}`    |
 * | `*`                    | catch-all | any route                    | the route    |
 *
 * - **Named steps**: `:slug` standing for a whole path step matches any non-empty step, where `slug` is a sequence of
 *   word characters: `/users/:id` matches `/users/123`, but neither `/users/` nor `/users/123/posts`
 * - **Subtrees**: a pattern ending with `/`, except the root pattern `/`, matches the route up to it along with every
 *   route below it
 * - **Catch-all**: `*` matches any route; placed last, it handles the routes the patterns before it leave unhandled,
 *   as a not-found view shown within the layout of the section or as a redirection; `*` is rejected within any other
 *   pattern, so `/users/*` and `/*` are not glob patterns but invalid ones
 *
 * A view needing the matched steps reads the route with {@link useRoute}.
 *
 * # Redirections
 *
 * A pattern mapped to a route rather than a view moves the location to that route, replacing the current history
 * entry, so going back never lands on the route redirected from. In the target, `:slug` is replaced with the matched
 * step, and a trailing `/` from a subtree pattern carries the route below the subtree along:
 *
 * | Pattern       | Target       | Route         | Moves to     |
 * |---------------|--------------|---------------|--------------|
 * | `/people/:id` | `/users/:id` | `/people/123` | `/users/123` |
 * | `/old/`       | `/new/`      | `/old/a/b`    | `/new/a/b`   |
 * | `*`           | `/`          | `/missing`    | `/`          |
 *
 * Redirections are followed until a view is reached, and rejected if they lead back to a route already visited.
 *
 * # Sections
 *
 * A view may render a nested {@link Routes}, routing what its pattern leaves over as a section of its own, as listed
 * under *Section sees* above: a section declares its sub-routes where it is implemented rather than in the table at
 * the top of the app, and keeps working wherever that table mounts it. Sections nest to any depth, and a view mapped
 * to a subtree handles every route below it, whether or not it renders a nested {@link Routes}.
 *
 * Patterns and redirections within a section are relative to it, starting at its root `/`: under `/users/`, the
 * pattern `/:id` matches `/users/123`, the redirection `/all` moves the location to `/users/all`, and a catch-all
 * redirection to `/` moves it to `/users/`. Components below still read the full route with {@link useRoute} and
 * navigate with {@link useRouter}, so links and navigators keep working unchanged wherever a section is mounted.
 *
 * A section declaring no catch-all inherits the one of the nearest enclosing table declaring one, as if declared
 * there, so a single `*` in the table at the top of the app handles the unknown routes of every section, a view
 * being shown in place of the section, within the layout of the views enclosing it.
 *
 * > [!WARNING]
 * >
 * > An inherited catch-all is resolved **within the section it handles**, not within the table declaring it: a
 * > redirection is relative to the section, like any other redirection declared there. With `"*": "/"` at the top of
 * > the app, an unknown route below `/users/`, such as `/users/123/posts`, moves the location to `/users/`, the root
 * > of the section, and **not** to the home page `/`.
 * >
 * > A section whose unknown routes are to go elsewhere declares a `*` of its own, which takes precedence over the
 * > inherited one; a catch-all redirection to a route the section leaves unhandled is rejected as a redirection loop.
 *
 * @module
 */

import { isDefined, isNull, isString, opt, Optional } from "@metreeca/core";
import { unique } from "@metreeca/core/arrays";
import { tidy } from "@metreeca/core/strings";
import { type ComponentChildren, createContext, createElement, type VNode } from "preact";
import { useCallback, useContext, useEffect, useLayoutEffect, useState } from "preact/hooks";
import { app } from "./index.js";


const Wildcard = "*";

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
	 * The navigator, as returned by {@link useRouter}.
	 */
	navigate: Router

}>>({

	route: "",

	navigate: () => {}

});

/**
 * The section opened by the enclosing {@link Routes}.
 */
const RoutesContext = createContext<Readonly<{

	/**
	 * The part of the route already matched by the patterns of the enclosing tables, `/` at the top level:
	 *
	 * - under a subtree pattern, it ends with `/`, and a nested table sees what follows it: under `/users/`, the
	 *   path is `/users/` and a nested table sees `/all` for the route `/users/all`
	 * - under any other pattern, it is the whole route, and a nested table sees `/`: under `/users/:id`, the path is
	 *   `/users/123` for the route `/users/123`
	 * - under the catch-all pattern `*`, it is the path of the enclosing table, and a nested table sees what that
	 *   one sees
	 */
	path: string

	/**
	 * The catch-all of the nearest enclosing table declaring one, handling the routes a nested table declaring none
	 * leaves unhandled, as if declared there; undefined if no enclosing table declares one.
	 */
	wild: Optional<string | VNode>

}>>({

	path: "/",
	wild: undefined

});


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
	 * @param route The route to navigate to, or the details of the navigation; a route relative to the current one,
	 *     such as `../posts`, is resolved as a link would
	 */
	(route: string | {

		/**
		 * The route to navigate to; the current route if omitted.
		 */
		route?: string

		/**
		 * The document title; the current title if omitted.
		 */
		title?: string

		/**
		 * The history state; the current state if omitted, cleared if `null`.
		 */
		state?: unknown

		/**
		 * True if the current history entry is to be replaced rather than followed by a new one; false otherwise.
		 * Navigating to the current route always replaces it.
		 *
		 * @defaultValue false
		 */
		replace?: boolean

	}): void;

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

	children

}: {

	/**
	 * The content rendered within the router, nesting the {@link Routes} that select the views for the current route.
	 */
	children?: ComponentChildren

}) {

	const [route, setRoute] = useState(() => location.pathname);

	const sync = () => setRoute(location.pathname); // renders again only if the route actually changed


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

						history.pushState(undefined, document.title, route);

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


		sync(); // catches up with a location changed before the listeners were in place

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

	}, []);


	const navigate = useCallback<Router>(entry => {

		const { route, title, state, replace } = isString(entry)
			? { route: entry, title: undefined, state: undefined, replace: false }
			: entry;

		const $route = opt(route,
			route => new URL(route, location.href).href,
			() => location.href
		);

		const $title = opt(title,
			title => unique([tidy(title), app.name]).filter(Boolean).join(" | "),
			() => document.title
		);

		const $state = state === undefined
			? history.state
			: state;

		document.title = $title;

		try {

			history[replace || $route === location.href ? "replaceState" : "pushState"]($state, $title, $route);

		} finally {

			sync();

		}

	}, []);


	return createElement(RouterContext.Provider, { value: { route, navigate } }, children);

}


/**
 * Renders the view for the current route.
 *
 * Selects the view through a table of route patterns, moving the location along any redirection on the way, and
 * renders it wherever the page layout places it; within a view, a nested table routes what the view pattern leaves
 * over as a section of its own. Patterns, redirections and sections are described in the module overview.
 *
 * Renders below a {@link Router}, which keeps sole charge of the location, the history and the page clicks.
 *
 * Renders nothing while moving the location along a redirection, so no view ever shows for a route on its way out and
 * the nested {@link Routes} only ever see the route the location carries.
 *
 * @param options The routes configuration
 *
 * @returns The view for the current route
 *
 * @throws {@link !Error Error} If the table holds a pattern other than the catch-all pattern `*` that does not start
 *     with `/` or that holds `*`, whatever the current route
 * @throws {@link !Error Error} If the current route, or a route it redirects to, matches no table pattern and no
 *     enclosing table declares a catch-all
 * @throws {@link !Error Error} If redirections lead back to a route already visited
 */
export function Routes({

	children

}: {

	/**
	 * The views for the routes, as a table mapping route patterns to views, rendered as they are, or to redirections,
	 * as routes to move to instead; a route is handled by the first pattern it matches, in table order.
	 */
	children: { readonly [pattern: string]: string | VNode }

}): ComponentChildren {

	const { route, navigate } = useContext(RouterContext);
	const { path, wild } = useContext(RoutesContext);

	const table = isDefined(children[Wildcard]) || !isDefined(wild)
		? children
		: { ...children, [Wildcard]: wild }; // the inherited catch-all goes last, as if declared here

	const invalid = Object.keys(table).find(glob =>
		glob !== Wildcard && (!glob.startsWith("/") || glob.includes("*"))
	);

	if ( isDefined(invalid) ) {
		throw new Error(`invalid route pattern <${invalid}>`);
	}

	const section = path.endsWith("/") ? route.slice(path.length-1) : "/"; // the route as the table sees it
	const settled = settle(section);

	const target = settled === section ? undefined
		: settled === "/" ? path
			: `${path.replace(/\/$/, "")}${settled}`;

	const hit = lookup(section);


	useLayoutEffect(() => { // moves the location before the blank render paints; the router renders again on its own

		if ( isDefined(target) ) {

			navigate({ route: target, replace: true }); // replacing the entry moved from, so going back never lands on it

		} else {

			// the location already carries the route on show

		}

	}, [target, navigate]);


	if ( isDefined(target) ) {

		return null;

	} else if ( isDefined(hit) ) {

		const tail = hit.steps.groups?.$;

		const opened = isDefined(tail) ? route.slice(0, route.length-tail.length+1) // up to the route below the subtree
			: hit.glob === Wildcard ? path
				: route;

		return createElement(RoutesContext.Provider, { value: { path: opened, wild: table[Wildcard] } }, hit.entry);

	} else {

		throw new Error(`unhandled route ${section}`);

	}


	/**
	 * Follows the redirections of the table from a section route.
	 *
	 * @returns The route the redirections lead to, the section route itself if it is not redirected
	 */
	function settle(section: string): string {

		const trail = [section]; // the routes visited so far, grown as each redirection is followed

		for (let route = redirect(section); isDefined(route); route = redirect(route)) {

			if ( trail.includes(route) ) {
				throw new Error(`redirection loop <${trail.join(",")}>`);
			}

			trail.push(route);

		}

		return trail.at(-1) ?? section;

	}

	/**
	 * Resolves the redirection the table defines for a section route.
	 *
	 * @returns The route the section route is redirected to, or undefined if it is not redirected
	 */
	function redirect(route: string): undefined | string {

		const hit = lookup(route);

		if ( isDefined(hit) && isString(hit.entry) ) {

			const { entry, steps } = hit;
			const tail = steps.groups?.$;

			const filled = entry.replace(/(?<=\/):(\w+)(?=[/?#]|$)/g, (_, step) => steps.groups?.[step] ?? "");

			return isDefined(tail) && filled.endsWith("/") ? `${filled.slice(0, -1)}${tail}` : filled;

		} else {

			return undefined;

		}

	}

	/**
	 * Looks up the first pattern of the table matching a section route, in table order.
	 *
	 * @returns The matching pattern, its entry and the steps it captured, or undefined if no pattern matches
	 */
	function lookup(route: string) {

		return Object.entries(table).flatMap(([glob, entry]) => {

			const steps = pattern(glob).exec(route);

			return isNull(steps) ? [] : [{ glob, entry, steps }];

		}).at(0);


		/**
		 * Compiles a route pattern, capturing named steps under their name and the route below a subtree under `$`.
		 */
		function pattern(glob: string): RegExp {

			const subtree = glob.length > 1 && glob.endsWith("/");
			const steps = subtree ? glob.slice(0, -1) : glob;

			return glob === Wildcard ? /^.*$/ : new RegExp(`^${steps

				.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // escape regex metacharacters
				.replace(/(?<=\/):(\w+)(?=\/|$)/g, "(?<$1>[^/]+)") // named steps

			}${subtree ? "(?<$>/.*)" : "(?:[?#].*)?"}$`); // the route below a subtree, or the ignored query and hash

		}

	}

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Retrieves the route navigator.
 *
 * The navigator stays the same for as long as the {@link Router} providing it is mounted, so a component reading it
 * renders again only as its own state requires, and a handler may keep it across navigations.
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
 * @returns The current route, as carried by the location path; an empty string outside any router
 */
export function useRoute(): string {
	return useContext(RouterContext).route;
}
