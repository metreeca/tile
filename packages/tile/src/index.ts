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
 * Metadata and element wiring.
 *
 * Supplies what an interface needs wherever it is assembled and no single layer should own: what the app states about
 * itself, the defaults its controls observe, the element a page is rendered into, and the attribute values and event
 * handlers a component builds out of state. Nothing here renders or holds state, so reaching for it commits a consumer
 * neither to a rendering layer nor to a store.
 *
 * Importing this module reads the document, so it belongs to a browser: a consumer without one, a test or a server
 * render, has to supply a DOM before the import runs.
 *
 * @module index
 */

import { type Optional } from "@metreeca/core";
import { resolve } from "@metreeca/core/resource";
import { immutable } from "@metreeca/core/values";


/**
 * The delay a self-submitting control waits out before acting on what was typed (ms).
 */
export const AutoDelay = 500;

/**
 * The number of characters a self-submitting control waits for before acting on what was typed.
 */
export const AutoLength = 2;

/**
 * The number of entries a self-submitting control offers at a time.
 */
export const AutoSize = 10;


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * What the app says about itself, as its document states it.
 *
 * Read once as the module is imported and immutable thereafter: a consumer sees the same values for the lifetime of
 * the page, and a later edit to the document is not picked up.
 */
export const app = immutable({

	/**
	 * The absolute root URL of the site, with a trailing slash.
	 */
	root: resolve(location.href, "/"),

	/**
	 * The absolute base URL the app is published at, with a trailing slash, as the `<base>` tag states it, or the site
	 * root if the tag is missing.
	 */
	base: resolve(resolve(location.href, "/"),
		(document.querySelector<HTMLBaseElement>("base")?.href || "/").replace(/\/*$/, "/")
	),

	/**
	 * The app name, as the `<title>` tag states it, or `undefined` if the tag is missing or empty.
	 */
	name: document.title || undefined,

	/**
	 * The URL of the app icon, as the `<link rel="icon">` tag states it, or `undefined` if the tag is missing.
	 */
	icon: document.querySelector<HTMLLinkElement>("link[rel=icon]")?.href || undefined,

	/**
	 * The app description, as the `<meta name="description">` tag states it, or `undefined` if the tag is missing
	 * or empty.
	 */
	info: document.querySelector<HTMLMetaElement>("meta[name=description]")?.content || undefined,

	/**
	 * The app copyright, as the `<meta name="copyright">` tag states it, or `undefined` if the tag is missing or
	 * empty.
	 */
	copy: document.querySelector<HTMLMetaElement>("meta[name=copyright]")?.content || undefined

});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Supplies the custom element a page is rendered into.
 *
 * Hands out a stable root for a rendering call: the same element answers every call naming it, so that repeated
 * calls, as issued on hot reload, replace the page rather than adding another copy of it.
 *
 * @param name The name of the hosting custom element, hyphenated as the DOM requires
 *
 * @returns The element named `name`, appended to the document body if the document doesn't already carry one
 */
export function host(name: string): Element {

	return document.querySelector(name) ?? document.body.appendChild(document.createElement(name));

}

/**
 * Names the classes in force.
 *
 * Renders a conditional class list as the value a `class` attribute takes, so a component states which classes apply
 * rather than assembling the string that says so.
 *
 * @param classes The candidate class names, each against the state deciding whether it is in force
 *
 * @returns The names whose state holds, separated by spaces, or `undefined` if none does, so that the value is
 * assigned to a `class` attribute without leaving an empty one behind
 */
export function classes(classes: Readonly<{ [name: string]: Optional<boolean> }>): Optional<string> {

	return Object.entries(classes)
		.filter(([ , state ]) => state)
		.map(([ name ]) => name)
		.join(" ") || undefined;

}

/**
 * Maps keys to what they do.
 *
 * Declares keyboard behaviour as the actions a component offers rather than as the dispatch selecting among them, and
 * settles with the browser which keys the component has taken over.
 *
 * @param handlers The action taken for each key, named as `KeyboardEvent.key` reports it; a key whose browser default
 * is to survive is left out of the map, which a caller assembles as the state of the moment requires
 *
 * @returns A keyboard handler taking the key it is given an action for, and claiming it from the browser default
 */
export function keys(handlers: Readonly<{ [key: string]: (event: KeyboardEvent) => void }>) {

	return (event: KeyboardEvent) => {

		const handler = handlers[event.key];

		if ( handler !== undefined ) {

			handler(event);

			event.preventDefault();

		}

	};

}
