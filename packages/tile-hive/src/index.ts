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
 * Preact layouts and containers.
 *
 * Provides the element a page is rendered into, so an app hands its screen a root without arranging for one of its
 * own. The layouts and containers themselves come from their own modules, leaving a screen with the ones it renders
 * and nothing else.
 *
 * @module index
 */


/**
 * Settles the custom element a page is rendered into.
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
