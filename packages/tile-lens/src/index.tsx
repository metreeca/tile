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
 * Facet parts.
 *
 * Draws the parts the facets share, so a compact facet opens and closes alike whichever facet it is.
 *
 * @module
 */

import { Button } from "@metreeca/clay-cell/button";
import { Icon } from "@metreeca/clay-cell/icon";


/**
 * Creates the disclosure of a compact facet.
 *
 * @param options The widget configuration
 *
 * @returns A button marked by the expand glyph while the facet is closed and by the collapse glyph while open,
 *     announcing to assistive technology whether the facet is expanded or collapsed
 */
export function Disclosure({

	open,

	controls,

	onToggle

}: {

	/**
	 * Whether the facet shows all it offers.
	 */
	open: boolean

	/**
	 * The id of the region the disclosure shows and hides, rendered whether shown or not.
	 */
	controls: string

	/**
	 * Called when the reader activates the disclosure.
	 */
	onToggle: () => void

}) {

	return <Button

		controls={controls}
		expanded={open}

		look={"subtle"}

		icon={open ? <Icon.Collapse/> : <Icon.Expand/>}
		title={open ? "Collapse" : "Expand"}

		onClick={onToggle}

	/>;

}

/**
 * Releases a pending timer.
 *
 * @param timer The timer to be released
 *
 * @returns The effect cleanup cancelling `timer`
 */
export function cancel(timer: ReturnType<typeof setTimeout>): () => void {
	return () => clearTimeout(timer);
}

/**
 * Closes a compact facet as focus leaves it.
 *
 * @param event The focus event leaving an element of the facet
 * @param collapse What closes the facet, called only if focus moves out of the facet rather than within it
 */
export function leave(event: FocusEvent, collapse: () => void): void {

	const facet = event.currentTarget;
	const target = event.relatedTarget;

	const within = facet instanceof Node && target instanceof Node && facet.contains(target);

	if ( !within ) {
		collapse();
	}

}
