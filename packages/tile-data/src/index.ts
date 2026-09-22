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
 * Preact contexts and hooks.
 *
 * Provides what the app states about itself, so a component carries the app identity wherever it is assembled without
 * being handed it. The contexts and hooks themselves come from their own modules, leaving a component with the ones it
 * is wired to and nothing else.
 *
 * Importing this module reads the document, so it belongs to a browser: a consumer without one, a test or a server
 * render, has to supply a DOM before the import runs.
 *
 * @module index
 */

import { resolve } from "@metreeca/core/resource";
import { immutable } from "@metreeca/core/values";


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
		(document.querySelector("base")?.href || "/").replace(/\/*$/, "/")
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
