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
import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import { app } from "./index.js";


const ActiveAttribute = "active";
const TargetAttribute = "target";

const RouteContext = createContext<string>("");
const RouterContext = createContext<Router>(() => {});
const RoutesContext = createContext<Readonly<{
	origin: string, // the route the location carries, before any redirection
	base: string, // the route prefix consumed by the enclosing subtree matches
	claim: () => () => void // claims the rest of the route for a nested Routes, returning the release
}>>({

	origin: "",
	base: "",
	claim: () => () => {}

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
		createElement(RouteContext.Provider, { value: route },
			createElement(RoutesContext.Provider, {
				value: { origin: route, base: "", claim: () => () => {} }
			}, children)
		)
	);

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
 * view takes up its subtree only by rendering a nested {@link Routes} along with itself: where none renders, the
 * routes below the subtree fall through to the patterns following it in the enclosing table, such as a catch-all `*`.
 *
 * Patterns and redirections are relative to the section, starting at its root `/`: under `/users/`, the pattern
 * `/{id}` matches `/users/123`, and the redirection `/all` moves the location to `/users/all`. Components below still
 * read the full route with {@link useRoute} and navigate with {@link useRouter}, so links and navigators keep working
 * unchanged wherever a section is mounted.
 *
 * Renders below a {@link Router}, which keeps sole charge of the location, the history and the page clicks. Below a
 * view selected by a pattern other than a subtree, the section sees the whole route that view was selected for.
 *
 * @param options The routes configuration
 *
 * @returns The view for the current route
 *
 * @throws {@link !Error Error} If the table holds a pattern that is neither `*` nor starts with `/`, whatever the
 *     current route
 * @throws {@link !Error Error} If the current route, or a route it redirects to, matches no table pattern, or if
 *     redirections lead back to a route already visited
 */
export function Routes({

	children

}: {

	/**
	 * The views for the routes, as a table mapping route patterns to views or redirections.
	 *
	 * A route is
	 * handled by the first pattern it matches, in table order, so specific patterns go before the general ones they
	 * overlap; the query and the hash of a route never take part in matching.
	 *
	 * A pattern is matched against the whole route and may include the following wildcards, where `step` is a
	 * sequence of word characters:
	 *
	 * - `{step}` matches a non-empty named path step
	 * - `{}` matches a non-empty anonymous path step
	 * - `/` at the end, except in the root pattern `/`, makes the pattern a **subtree**, matching the route up to it
	 *   along with every route below it
	 *
	 * A lone `*` is a catch-all, matching any route: placed last, it handles whatever the patterns before it leave
	 * over, in the table at the top of the app and in any section below it alike.
	 *
	 * A pattern maps to one of:
	 *
	 * - a **redirection**: a route to move to instead, where `{step}` is replaced with the matched named step and `{}`
	 *   with the whole matched route; a redirection ending with `/` from a subtree carries the route below the subtree
	 *   along; the location is moved along, replacing the current history entry, so going back never lands on the
	 *   route redirected from
	 * - an **element**: the view, rendered as it is; a view needing the matched steps reads the route with
	 *   {@link useRoute}; a view mapped to a subtree routes the routes below it
	 *   with a nested {@link Routes}, and where it nests none they fall through to the patterns that follow
	 */
	children: { readonly [pattern: string]: string | VNode }

}): ComponentChildren {

	const { origin, base, claim } = useContext(RoutesContext);

	const rest = useRoute().slice(base.length);
	const router = useRouter();

	const [rejected, setRejected] = useState<Readonly<Record<string, readonly string[]>>>({});

	// a ref, not state, as claims land after render and only effects read them

	const claims = useRef(0);

	const { route: target, view, head, subtree } = match(children, rest, rejected);

	const register = useCallback(() => {

		claims.current += 1;

		return () => { claims.current -= 1; };

	}, []);


	useLayoutEffect(() => claim(), [claim]);

	useLayoutEffect(() => {

		if ( subtree && claims.current === 0 ) {

			setRejected(rejected => ({ [target]: [...(rejected[target] ?? []), subtree] }));

		} else {

			// no claim needed, or nested Routes claimed the rest of the route

		}

	}, [target, subtree, view]);


	useEffect(() => {

		if ( claims.current === 0 && `${base}${target}` !== origin ) {

			// the innermost Routes lands every enclosing redirection at once, replacing the entry it came from

			router(`${base}${target}`, true);

		} else {

			// the location already carries the route on show, or a nested Routes lands it

		}

	}, [origin, base, target, router]);


	return createElement(RouteContext.Provider, { value: `${base}${target}` },
		createElement(RoutesContext.Provider, {
			value: { origin, base: `${base}${head}`, claim: register }
		}, view)
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

/**
 * Resolves a route to its view, following redirections and passing over the rejected subtree patterns.
 */
function match(
	table: Parameters<typeof Routes>[0]["children"],
	route: string,
	rejected: Readonly<Record<string, readonly string[]>>
): Readonly<{ route: string, view: VNode, head: string, subtree: string }> {

	const invalid = Object.keys(table).find(glob => glob !== "*" && !glob.startsWith("/"));


	function follow(current: string, trail: readonly string[]): ReturnType<typeof match> {

		const skipped = rejected[current] ?? [];

		const selected = Object.entries(table).reduce<ReturnType<typeof select>>((selected, [glob, entry]) =>
				selected ?? (skipped.includes(glob) ? undefined : select(glob, entry, current)),
			undefined // patterns past the first match are not compiled
		);

		if ( !isDefined(selected) ) {

			throw new Error(`unhandled route ${route}`);

		} else if ( !isString(selected) ) {

			return selected;

		} else if ( trail.includes(selected) ) {

			throw new Error(`redirection loop <${trail.join(",")}>`);

		} else {

			return follow(selected, [...trail, selected]);

		}

	}

	function select(glob: string, entry: string | VNode, route: string): undefined | string | ReturnType<typeof match> {

		const steps = pattern(glob).exec(route);
		const tail = steps?.groups?.$; // the route below a subtree, undefined for other patterns

		return isNull(steps) ? undefined
			: isString(entry) ? redirect(entry, route, steps, tail)
				: {
					route,
					view: entry,
					head: isDefined(tail) ? route.slice(0, -tail.length) : "",
					subtree: isDefined(tail) && !/^\/(?:[?#]|$)/.test(tail) ? glob : "" // the subtree root needs no claim
				};

	}

	function redirect(entry: string, route: string, steps: RegExpExecArray, tail: Optional<string>): string {

		const target = entry.replace(/{(\w*)}/g, (_, step) => step ? steps.groups?.[step] || "" : route);

		return isDefined(tail) && target.endsWith("/") ? `${target.slice(0, -1)}${tail}` : target;

	}

	function pattern(glob: string): RegExp {

		const subtree = glob.length > 1 && glob.endsWith("/");
		const steps = subtree ? glob.slice(0, -1) : glob;

		return glob === "*" ? /^.*$/ : new RegExp(`^${steps

			.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // escape regex metacharacters
			.replace(/\\{(\w+)\\}/g, "(?<$1>[^/]+)") // named steps
			.replace(/\\{\\}/g, "[^/]+") // anonymous steps

		}${subtree ? "(?<$>/.*)" : "(?:[?#].*)?"}$`); // the route below a subtree, or the ignored query and hash

	}


	if ( isDefined(invalid) ) {

		throw new Error(`invalid route pattern <${invalid}>`);

	} else {

		return follow(route, [route]);

	}

}


function normalizeTitle(title: Optional<string>): string {
	return tidy(isDefined(title) ? unique([title, app.name]).filter(Boolean).join(" | ") : document.title);
}
