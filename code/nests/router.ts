/*
 * Copyright © 2020-2021 Metreeca srl
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

import { createContext, createElement, FunctionalComponent, FunctionComponent, VNode } from "preact";
import { useContext, useEffect, useMemo } from "preact/hooks";
import { label, string } from "../graphs";
import { useUpdate } from "../hooks/update";

const active="active";
const native="native";

const RouterContext=createContext<Router>(router({ store: path(), update: () => {} }));


window.addEventListener("error", e => {
	window.alert(`;-( Internal error… please let us know about the issue. Thanks!\n\n${e.message}`);
});


window.addEventListener("unhandledrejection", e => {
	window.alert(`;-( Internal error… please let us know about the issue. Thanks!\n\n${e.reason}`);
});


(function (route, index) { // ;( dev server fallback

	if ( route.endsWith(index) ) {
		history.replaceState(history.state, document.title, route.substr(0, route.length-index.length+1));
	}

})(location.pathname, "/index.html");


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Absolute root URL with trailing slash.
 */
export const root=new URL("/", location.href).href;

/**
 * Absolute base URL with trailing slash.
 */
export const base=new URL(".", new URL(document.querySelector("base")?.href || "", location.href)).href;

export const name=document.title;
export const icon=(document.querySelector("link[rel=icon]") as HTMLLinkElement)?.href || ""; // !!! fallback
export const copy=(document.querySelector("meta[name=copyright]") as HTMLMetaElement)?.content || "";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
	(route: string): VNode | string

}

/**
 * Routing table.
 */
export interface Table {

	/**
	 * Maps glob patterns either to components or redirection patterns.
	 *
	 * Patterns may include the following wildcards, where `id` is a sequence of word chars:
	 *
	 * - `{id}` matches a non empty named path step
	 * - `{}` matches a non-empty anonymous path step
	 * - `/*` matches a trailing path
	 *
	 * Redirection patterns may refer to wildcards in the matched route pattern as:
	 *
	 * - `{id}` replaced with the matched non empty named path step
	 * - `{}` replaced with the whole matched route
	 * - `/*` replaced with the matched trailing path
	 *
	 * Named path step in the matched route pattern are also included in the `props` argument of the component as:
	 *
	 * - `id` the matched non empty named path step
	 * - `$` the matched trailing path
	 */
	readonly [pattern: string]: FunctionComponent<any> | string

}

/**
 * Routing store.
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
	 * @returns a location-relative string representing `route`
	 */
	(route: string): string;

}


export interface Router {

	name(label?: string): string


	active(route: string): { href: string, [active]?: "" }

	native(route: string): { href: string, [native]?: "" }


	push(route: string, state?: any): void

	swap(route: string, state?: any): void


	open(url: string, target?: string): void

	back(): void

}


//// Stores ////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a path {@link Store route store}
 *
 * @return a function managing routes as relative-relative paths including search and hash
 */
export function path(): Store {
	return (route?: string) => route === undefined
		? location.href.startsWith(base) ? location.href.substr(base.length-1) : location.href
		: route ? `${base}${route.startsWith("/") ? route.substr(1) : route}` : location.href;
}

/**
 * Creates a hash {@link Store route store}
 *
 * @return a function managing routes as hashes
 */
export function hash(): Store {
	return (route?: string) => route === undefined
		? location.hash.substring(1)
		: route ? route.startsWith("#") ? route : `#${route}` : location.hash;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function useRouter(): Router {
	return useContext(RouterContext);
}

export function Router({

	store=path(),

	routes

}: {

	routes: Table | Switch

	/**
	 * The route store
	 *
	 * @default {@link path()}
	 */
	store?: Store

}) {

	const update=useUpdate();

	const selector=useMemo(() => routes instanceof Function ? routes : compile(routes), []);


	useEffect(() => {

		window.addEventListener("popstate", update);
		window.addEventListener("click", click);

		return () => {
			window.removeEventListener("popstate", update);
			window.removeEventListener("click", click);
		};

	}, []);


	function click(e: MouseEvent) {
		if ( !(e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.defaultPrevented) ) { // only plain events

			const anchor=(e.target as Element).closest("a");

			if ( anchor && anchor.getAttribute(native) === null ) { // only non-native anchors

				const href=anchor.href;

				const route=href.startsWith(base) ? href.substr(base.length-1)
					: href.startsWith(root) ? href.substr(root.length-1)
						: "";

				if ( route ) { // only internal routes

					history.pushState(history.state, document.title, store(route));

					update();

					e.preventDefault();

				}
			}
		}
	}


	let route=store();

	const redirects=new Set([route]);

	while ( true ) {

		const selection=selector(route);

		if ( typeof selection === "string" ) {

			if ( redirects.has(selection) ) {
				throw new Error(`cyclic redirection <${Array.from(redirects)}>`);
			}

			redirects.add(route=selection);

		} else { // ;( no useEffect() / history must be updated before component is rendered

			history.replaceState(history.state, document.title, store(route)); // possibly altered by redirections

			document.title=join(label(route), name); // !!! update history

			return createElement(RouterContext.Provider, {

				value: router({ store, update }),

				children: selection

			});

		}

	}

}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function join(label: string, title: string, separator: string=" | "): string {
	return `${label}${label && title ? separator : ""}${title}`;
}

function compile(table: Table): Switch {

	function pattern(glob: string): string { // convert a glob pattern to a regular expression
		return glob === "*" ? "^.*$" : `^${glob

			.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") // escape special regex characters
			.replace(/\\{(\w+)\\}/g, "(?<$1>[^/]+)") // convert glob named parameters
			.replace(/\\{\\}/g, "(?:[^/]+)") // convert glob anonymous parameters
			.replace(/\/\\\*$/, "(?<$>/.*)") // convert glob trailing path

		}([?#].*)?$`; // ignore trailing query/hash
	}

	const patterns: { [pattern: string]: FunctionComponent | string }={};

	for (const glob of Object.keys(table)) {
		patterns[pattern(glob)]=table[glob];
	}

	return route => {

		const entries: [string, FunctionalComponent | string][]=Object
			.entries(patterns);

		const matches: [RegExpExecArray | null, FunctionalComponent | string][]=entries
			.map(([pattern, component]) => [new RegExp(pattern).exec(route), component]);

		const [match, delegate]: [RegExpExecArray | null, FunctionalComponent | string]=matches
			.find(([match]) => match !== null) || [null, () => null];

		if ( typeof delegate === "string" ) {

			return delegate.replace(/{(\w*)}|\/\*$/g, ($0, $1) => // replace wildcard references
				$0 === "/*" ? match?.groups?.$ || ""
					: $1 ? match?.groups?.[$1] || ""
					: route
			);

		} else {

			return createElement(delegate, { ...match?.groups });

		}

	};

}

function router({ store, update }: { store: Store, update: () => void }): Router {
	return {

		name(label?: string): string {
			return label === undefined ? name : (document.title=join(label, name)); // !!! update history
		},


		active(route: string): { href: string, [active]?: "" } {

			const wild=route.endsWith("*");

			const href=wild ? route.substr(0, route.length-1) : route;

			function matches(target: string, current: string) {
				return wild ? current.startsWith(target) : current === target;
			}

			return { href: href, [active]: matches(href, store()) ? "" : undefined };

		},

		native(route: string): { href: string, [native]?: "" } {
			return { href: route, [native]: "" };
		},


		push(route: string, state?: any): void {
			try { history.pushState(state, document.title, store(route)); } finally { update(); }
		},

		swap(route: string, state?: any): void {
			try { history.replaceState(state, document.title, store(route)); } finally { update(); }
		},


		open(url: string, target: string=""): void {
			window.open(url, target);
		},

		back(): void {
			history.back();
		}

	};
}
