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
 * Routes are root-relative location paths such as `/users/123`, so the site has to serve the app page for every one.
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
 * | `/collection/;view`    | annexed   | `/collection/;view` alone    | `/`          |
 * | `/collection/:slug;v`  | annexed   | `/collection/{slug};v` alone | `/`          |
 * | `*`                    | catch-all | any route                    | the route    |
 *
 * - **Named steps**: `:slug` standing for a whole path step matches any non-empty step, where `slug` is a sequence of
 *   word characters: `/users/:id` matches `/users/123`, but neither `/users/` nor `/users/123/posts`
 * - **Subtrees**: a pattern ending with `/`, except the root `/`, matches the route up to it and every route below it
 * - **Annexes**: a pattern ending with a non-empty annex, as `/;info`, `/resource;info` or `/collection/;info`, matches
 *   the route only while it carries exactly that annex, and never acts as a subtree; a pattern without annex matches
 *   whatever annex the route carries, so an annexed pattern goes before the plain pattern it refines
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
 * | `/;old`       | `/;new`      | `/;old`       | `/;new`      |
 * | `/;info`      | `/about;`    | `/;info`      | `/about`     |
 *
 * A redirection carries the annex of the route along, unless its target names an annex of its own, which takes its
 * place; a target ending with a bare `;` drops the annex, landing on the route alone.
 *
 * Redirections are followed until a view is reached, and rejected if they lead back to a route already visited.
 *
 * # Annexes
 *
 * A route may carry an annex, an opaque string attached to its last step after a `;`, as in `/courses/;grid` or
 * `/courses/123;lessons`. An annex keeps view state in the location, such as the presentation a view is switched to,
 * where the query is already taken by collection filters and the hash by heading anchors.
 *
 * The `;` separator follows the per-segment parameter practice noted in
 * [RFC 3986 §3.3](https://www.rfc-editor.org/rfc/rfc3986#section-3.3), which allows it unencoded within a path step
 * and leaves its meaning to the application; an encoded `%3B` is part of the step, as
 * [RFC 3986 §2.2](https://www.rfc-editor.org/rfc/rfc3986#section-2.2) tells reserved characters and their encodings
 * apart. The annex is confined to the last step, so that the route without it is the plain IRI of the resource on show.
 *
 * The annex takes part in matching only for patterns naming one, as described under *Route Patterns*:
 * {@link useRoute} returns the route without its annex, and {@link useAnnex} the annex alone. As with the query, the
 * view parses the annex itself; a bare `;` carries an empty annex, read as none.
 *
 * On a root or a collection the annex follows the trailing `/`: `/courses;grid` is the route `/courses`, matched as
 * such rather than as the collection `/courses/`, so a collection carries its annex as `/courses/;grid`.
 *
 * A change to the annex alone renders the components reading it again, without mounting the views afresh, so a view
 * switching presentation keeps the state it reached, unless it moves the route to a view of another pattern.
 *
 * A view moves to another annex through a route built from {@link useRoute}, as `${route};table`, rather than through
 * a relative `;table`: [RFC 3986 §5.2.3](https://www.rfc-editor.org/rfc/rfc3986#section-5.2.3) resolves a relative
 * path by replacing the last step of the base, so `;table` sets the annex of a root or a collection, but moves the
 * resource `/courses/123` to `/courses/;table`. The router resolves references as the RFC prescribes, like the
 * browser does, so a link lands on the same page whether followed by the router, opened in a new tab or copied. Being
 * a path, the annexed route leaves the query and the hash behind, so a view keeping its filters across a change of
 * annex restores them from its own state, such as the history state, rather than from the location.
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


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * The routing provided by the enclosing {@link Router}.
 */
const RouterContext = createContext<Readonly<{

	/**
	 * The route in the browser address bar without its annex, as returned by {@link useRoute}.
	 */
	route: string

	/**
	 * The annex of the route in the browser address bar, as returned by {@link useAnnex}.
	 */
	annex: string

	/**
	 * The route without its annex and the query the last navigation moved to, keying the views {@link Routes} renders:
	 * a navigation changing the query mounts them afresh, while a change of annex alone, or a query replaced outside
	 * the router through `history.replaceState`, leaves them mounted with the state they reached.
	 */
	place: string

	/**
	 * The navigator, as returned by {@link useRouter}.
	 */
	navigate: Router

}>>({

	route: "",
	annex: "",
	place: "",

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
	 * @param route The route or the navigation details; a route relative to the current one resolves as a link would
	 */
	(route: string | {

		/**
		 * True to replace the current history entry rather than add one; navigating to the current route always does.
		 *
		 * @defaultValue false
		 */
		replace?: boolean


		/**
		 * The route to navigate to, along with any annex it carries; the current route if omitted.
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

	}): void;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Tracks the current route.
 *
 * Provides the current route, its annex and a navigator to the components below it, through {@link useRoute},
 * {@link useAnnex} and {@link useRouter}, and renders again whenever the route or its annex changes, whether through
 * navigation or browser history. The views for the current route are selected by the {@link Routes} nested below it.
 *
 * Takes over plain clicks anywhere in the page, leaving clicks with a modifier key or already handled to the browser:
 *
 * - a link to the same site is followed without reloading the page, unless it points at a fragment of the current
 *   page or targets another browsing context through a `target` attribute other than `_self`
 * - a link to another site opens in a new browsing context
 * - an image outside any link toggles its `active` attribute, which the `@metreeca/skin` stylesheet reads to show it
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

	const [place, setPlace] = useState(here);

	const { route, annex } = split(place.replace(/\?.*$/, ""));
	const query = place.replace(/^[^?]*/, "");

	const sync = () => setPlace(here()); // renders again only if the place actually changed


	useEffect(() => {

		function click(event: MouseEvent): void {

			const plain = !event.altKey
				&& !event.ctrlKey
				&& !event.metaKey
				&& !event.shiftKey
				&& !event.defaultPrevented;

			const origin = event.target instanceof Element ? event.target : undefined;

			const anchor = origin?.closest("a");
			const image = origin?.closest("img");

			if ( plain && anchor
				&& !anchor.getAttribute("href")?.startsWith("#")
				&& (anchor.getAttribute("target") ?? "_self") === "_self"
			) {

				event.preventDefault();
				follow(anchor.href);

			} else if ( plain && image && !anchor ) {

				toggle(image);

			} else {

				// modified, already handled and unrelated clicks keep their default behaviour

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

		const moved = $route !== location.href;

		document.title = $title;

		try {

			history[replace || !moved ? "replaceState" : "pushState"]($state, $title, $route);

		} finally {

			if ( moved ) {
				sync();
			} else {
				// a title or a state alone leaves the place, as replaced outside the router, in place
			}

		}

	}, []);


	return createElement(RouterContext.Provider, {
		value: { route, annex, place: `${route}${query}`, navigate } // the annex alone leaves the views mounted
	}, children);


	/**
	 * Identifies the place the browser location stands at.
	 *
	 * @returns The location path and query, the hash left out as it never moves the page to another view
	 */
	function here(): string {
		return `${location.pathname}${location.search}`;
	}

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
 * Renders nothing during a redirection, so neither it nor a nested {@link Routes} shows a route on its way out.
 *
 * Mounts the view afresh whenever a navigation moves the location, the query included, so that a view reads the query
 * as it mounts: a link from `/courses/` to `/courses/?~label=art` mounts the catalogue again with the new criteria. A
 * query replaced through `history.replaceState` outside the router, as a view recording its own state in the location
 * does, leaves the view mounted with the state it reached, until the next navigation moves the location again. A
 * navigation changing the annex alone leaves the view mounted too, rendering again only what reads the annex.
 *
 * @param options The routes configuration
 *
 * @returns The view for the current route
 *
 * @throws {@link !Error Error} If a pattern other than `*` lacks a leading `/`, holds `*`, or holds `;` anywhere but
 * before a non-empty annex on its last step, as soon as the table renders, whatever the route
 * @throws {@link !Error Error} If the route, or one it redirects to, matches no pattern and no enclosing catch-all
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

	const { route, annex, place, navigate } = useContext(RouterContext);
	const { path, wild } = useContext(RoutesContext);

	const table = isDefined(children[Wildcard]) || !isDefined(wild)
		? children
		: { ...children, [Wildcard]: wild }; // the inherited catch-all goes last, as if declared here

	const invalid = Object.keys(table).find(glob =>
		glob !== Wildcard && !/^\/[^*;]*(?:;[^*/]+)?$/.test(glob) // rooted, no wildcard, an annex on the last step only
	);

	if ( isDefined(invalid) ) {
		throw new Error(`invalid route pattern <${invalid}>`);
	}

	const section = path.endsWith("/") ? route.slice(path.length-1) : "/"; // the route as the table sees it
	const origin = attach(section, annex);
	const settled = settle(origin);

	const target = settled === origin ? undefined : relocate(split(settled));

	const hit = lookup(origin);


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

		return createElement(RoutesContext.Provider, {
			key: place, // a navigation changing the query alone mounts the view afresh
			value: { path: opened, wild: table[Wildcard] }
		}, hit.entry);

	} else {

		throw new Error(`unhandled route ${section}`);

	}


	/**
	 * Locates a section route, along with the annex it carries, within the whole route.
	 *
	 * @returns The whole route the section route stands for, carrying its annex
	 */
	function relocate({ route, annex }: Readonly<{ route: string, annex: string }>): string {
		return attach(route === "/" ? path : `${path.replace(/\/$/, "")}${route}`, annex);
	}

	/**
	 * Attaches an annex to the last step of a route.
	 *
	 * @returns The route carrying the annex, or the route alone for an empty annex
	 */
	function attach(route: string, annex: string): string {
		return annex ? `${route};${annex}` : route;
	}

	/**
	 * Follows the redirections of the table from a section route carrying its annex.
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
	 * Resolves the redirection the table defines for a section route carrying its annex.
	 *
	 * @returns The route the section route is redirected to, carrying the annex the target names or else the one of
	 * the section route; undefined if the table maps the section route to a view or matches no pattern for it
	 */
	function redirect(section: string): undefined | string {

		const hit = lookup(section);

		if ( isDefined(hit) && isString(hit.entry) ) {

			const { entry, steps } = hit;
			const tail = steps.groups?.$;

			const filled = entry.replace(/(?<=\/):(\w+)(?=[/;?#]|$)/g, (_, step) => steps.groups?.[step] ?? "");
			const { route, annex } = split(filled);

			return attach(
				isDefined(tail) && route.endsWith("/") ? `${route.slice(0, -1)}${tail}` : route,
				route === filled ? split(section).annex : annex // a target naming no annex carries the current one along
			);

		} else {

			return undefined;

		}

	}

	/**
	 * Looks up the first pattern of the table matching a section route carrying its annex, in table order.
	 *
	 * @returns The matching pattern, its entry and the steps it captured, or undefined if no pattern matches
	 */
	function lookup(section: string) {

		const { route, annex } = split(section);

		return Object.entries(table).flatMap(([glob, entry]) => {

			const { route: stem, annex: label } = split(glob);
			const steps = label && label !== annex ? null : pattern(stem, !label).exec(route);

			return isNull(steps) ? [] : [{ glob, entry, steps }];

		}).at(0);


		/**
		 * Compiles a route pattern, capturing named steps under their name and the route below a subtree under `$`.
		 *
		 * @param glob The route pattern without its annex
		 * @param open True if a pattern ending with `/` is a subtree, false for a pattern naming an annex
		 */
		function pattern(glob: string, open: boolean): RegExp {

			const subtree = open && glob.length > 1 && glob.endsWith("/");
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
 * @returns The current route, as carried by the location path without its annex; an empty string outside any router
 */
export function useRoute(): string {
	return useContext(RouterContext).route;
}

/**
 * Retrieves the annex of the current route.
 *
 * Renders the component again whenever the annex changes, whether through navigation or browser history. The views
 * below the router stay mounted, so a view switching presentation keeps the state it reached.
 *
 * @returns The annex after the `;` on the last step of the current route, as it appears in the location path and left
 * to the caller to parse; an empty string if the route carries none, or outside any router
 */
export function useAnnex(): string {
	return useContext(RouterContext).annex;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Splits a route into its steps and the annex its last step carries.
 *
 * @returns The route without the annex, and the annex following the first `;` of the last step, empty if none
 */
function split(route: string): Readonly<{ route: string, annex: string }> {

	const [, steps = route, annex = ""] = /^(.*?\/[^/;]*)(?:;([^/]*))?$/.exec(route) ?? [];

	return { route: steps, annex };

}
