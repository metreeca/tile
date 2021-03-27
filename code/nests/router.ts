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

import { createElement, FunctionComponent, RenderableProps } from "preact";
import { useEffect, useMemo, useReducer } from "preact/hooks";
import { label } from "../graphs/index";

const Base=new URL((document.querySelector("base") as HTMLBaseElement)?.href || "/", location.href)
	.pathname.replace(/(^.*?)\/?$/, "$1/"); // make sure base has a trailing slash

const Title=document.title;


window.addEventListener("error", (e: ErrorEvent) => {
	window.alert(`;-( Internal error… please let us know about the issue. Thanks!\n\n${e.message}`);
});

window.addEventListener("unhandledrejection", (e: PromiseRejectionEvent) => {
	window.alert(`;-( Internal error… please let us know about the issue. Thanks!\n\n${e.reason}`);
});


/**
 * Converts a route to the root-relative form.
 */
function root(route: string): string {
	return route.startsWith(location.origin) ? root(route.substring(location.origin.length))
		: route.startsWith(Base) ? route
			: route.startsWith("/") ? Base+route.substring(1)
				: Base+route;
}

/**
 * Converts a route to the base-relative form.
 */
function base(route: string): string {
	return route.startsWith(location.origin) ? base(route.substring(location.origin.length))
		: route.startsWith(Base) ? route.substring(Base.length-1)
			: route.startsWith("/") ? route
				: "/"+route;
}


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
	 * @returns a component responsible for rendering `route` or a new route if a redirection is required
	 */
	(route: string): FunctionComponent<any> | string

}

/**
 * Routing table.
 */
export interface Table {

	/**
	 * Maps glob patterns either to components or redirection patterns
	 *
	 * Patterns may include the following wildcards:
	 *
	 * - `{id}` matches a non empty named path step
	 * - `{}` matches a non-empty anonymous path step
	 * - `/*` matches a trailing path
	 *
	 * Redirection patterns may refer to wildcards in the matched route pattern as:
	 *
	 * - `{id}` replaced with the matched non empty named path step
	 * - `{*}` replaced with the matched trailing path
	 * - `{}` replaced with the whole matched route
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


//// Stores ////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a path {@link Store route store}
 *
 * @return a function managing routes as root-relative paths including search and hash
 */
export function path(): Store {
	return (route?: string) => route ? root(route) : location.href.substring(location.origin.length);
}

/**
 * Creates a hash {@link Store route store}
 *
 * @return a function managing routes as hashes
 */
export function hash(): Store {
	return (route?: string) => route ? `#${route}` : location.hash.substring(1);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function title(title: string): void {

	document.title=`${title}${title && Title ? " | " : ""}${Title}`;

}

export function href(href: string, active: string, inactive?: string): {} {

	function matches(target: string, current: string) {
		return target.endsWith("/") ? current.startsWith(target) : current === target;
	}

	return {
		href: href,
		className: matches(root(href), location.pathname) ? active : inactive
	};
}


//// History ///////////////////////////////////////////////////////////////////////////////////////////////////////////

export function push(route: string, state?: any): void {

	const { origin, href }=new URL(root(route), location.href);

	if ( origin !== location.origin ) {

		window.open(href, "_blank");

	} else if ( href !== location.href || state !== history.state ) {

		history.pushState(state, document.title, href);

		window.dispatchEvent(new CustomEvent("update")); // listened to by Router()

	}

}

export function swap(route: string, state?: any): void {

	const { origin, href }=new URL(root(route), location.href);

	if ( origin !== location.origin ) {

		window.open(href, "_blank");

	} else if ( href !== location.href || state !== history.state ) {

		history.replaceState(state, document.title, href);

		window.dispatchEvent(new CustomEvent("update")); // listened to by Router()

	}

}

export function open(url: string, target: string=""): void {

	window.open(url, target);

}

export function back(): void {

	history.back(); // no update: will fire popstate event

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function Router({

	routes,

	store=path()

}: {

	routes: Table | Switch

	/**
	 * The route store
	 *
	 * @default {@link path()}
	 */
	store?: Store

}) {

	const [, update]=useReducer(v => v+1, 0);

	const selector=useMemo(() => routes instanceof Function ? routes : compile(routes), []);

	useEffect(() => {

		function click(e: MouseEvent) {
			if ( e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.defaultPrevented ) { return true; } else {

				for (let node: Node=e.target as Node; node.parentNode; node=node.parentNode) {
					if ( node.nodeName === "A" ) {

						e.preventDefault();

						return push((node as HTMLAnchorElement).href || "");

					}
				}

			}
		}

		window.addEventListener("popstate", update);
		window.addEventListener("update", update);
		window.addEventListener("click", click);

		return () => {
			window.removeEventListener("popstate", update);
			window.removeEventListener("update", update);
			window.removeEventListener("click", click);
		};

	}, []);


	let route=base(store());

	const redirects=new Set([route]);

	while ( true ) {

		const component=selector(route);

		if ( typeof component === "string" ) {

			if ( redirects.has(component) ) {
				throw new Error(`cyclic redirection <${Array.from(redirects)}>`);
			}

			redirects.add(route=component);

		} else { // ;( no useEffect() / history must be effectively updated before component is rendered

			history.replaceState(history.state, document.title, root(route)); // possibly altered by redirections

			title(label(location.pathname));

			return useMemo(() => createElement(component, {}), [route]);

		}

	}

}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function compile(table: Table): Switch {

	function pattern(glob: string): string { // convert a glob pattern to a regular expression
		return glob === "*" ? "^.*$" : `^${glob
			.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") // escape special regex characters
			.replace(/\\{(\w+)\\}/g, "(?<$1>[^/]+)") // convert glob named parameters
			.replace(/\\{\\}/g, "(?:[^/]+)") // convert glob anonymous parameters
			.replace(/\/\\\*$/, "(?<$>/.*)") // convert glob trailing path
		}(/(index)?)?(\.x?html)?([#?].*)?$`; // ignore trailing slash/index/extension/query/hash
	}

	const patterns: { [pattern: string]: FunctionComponent | string }={};

	for (const glob of Object.keys(table)) {
		patterns[pattern(glob)]=table[glob];
	}

	return route => {

		const entries: [string, FunctionComponent<any> | string][]=Object
			.entries(patterns);

		const matches: [RegExpExecArray | null, FunctionComponent<any> | string][]=entries
			.map(([pattern, component]) => [new RegExp(pattern).exec(route), component]);

		const [match, delegate]: [RegExpExecArray | null, FunctionComponent<any> | string]=matches
			.find(([match]) => match !== null) || [null, () => null];

		if ( typeof delegate === "string" ) {

			return delegate.replace(/{(\w*)}/g, ($0, $1) => // replace wildcard references
				$1 === "*" ? match?.groups?.$ || "" : $1 ? match?.groups?.[$1] || "" : root(match?.input || "")
			);

		} else {

			const parameters={ $: route, ...match?.groups };

			const component=(props: RenderableProps<any>, context?: any) => delegate({ ...parameters, ...props }, context);

			return Object.assign(component, delegate, {
				defaultProps: Object.assign({}, delegate.defaultProps, parameters)
			});

		}

	};

}
