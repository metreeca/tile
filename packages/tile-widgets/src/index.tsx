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
 * Widget parts.
 *
 * Draws the parts the widgets share out of plain markup styled by `@metreeca/skin`, so a view, a facet or a form
 * marks loading, emptiness and failure alike, and opens, closes and grows alike, whichever widget it is.
 *
 * @module
 */

import { opt, type Optional } from "@metreeca/core";
import { ChevronDownIcon, ChevronRightIcon, CircleAlertIcon, RefreshCwIcon } from "lucide-preact";
import { type ComponentChildren, createElement } from "preact";
import { useEffect, useId } from "preact/hooks";
import "./index.css";


/**
 * The delay a self-submitting control waits out before acting on what was typed (ms).
 */
export const AutoDelay = 500;


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Names the classes in force.
 *
 * @param classes The candidate class names, each against the state deciding whether it is in force
 *
 * @returns The names whose state holds, separated by spaces, or `undefined` if none does, so that the value is
 *     assigned to a `class` attribute without leaving an empty attribute behind on the element it is assigned to
 */
export function classes(classes: Readonly<{ [name: string]: Optional<boolean> }>): Optional<string> {

	return Object.entries(classes)
		.filter(([, state]) => state)
		.map(([name]) => name)
		.join(" ") || undefined;

}

/**
 * Maps keys to what they do.
 *
 * @param handlers The action taken for each key, named as `KeyboardEvent.key` reports it; a key whose browser default
 *     is to survive is left out of the map, which a caller assembles as the state of the moment requires
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


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates the hint filling the area of a widget with nothing to show yet.
 *
 * @param options The part configuration
 *
 * @returns The placeholder glyph over the text saying why the area is empty
 */
export function Hint({

	placeholder,
	text

}: {

	/**
	 * The glyph standing for what the widget shows once there is something to show.
	 */
	placeholder: ComponentChildren

	/**
	 * Why the area is empty, as `Loading…` or `No Matches`.
	 */
	text: string

}) {

	return createElement("tile-hint", {}, placeholder, <span>{text}</span>);

}

/**
 * Creates the note standing in place of a widget whose content could not be retrieved.
 *
 * @returns A note announced to assistive technology as soon as it is shown
 */
export function Failure() {

	return createElement("tile-note", { role: "alert" }, <CircleAlertIcon/>, <span>Not Available</span>);

}

/**
 * Creates the trigger growing a list as it comes into view.
 *
 * @param options The part configuration
 *
 * @returns A spinning glyph, calling `onLoad` whenever the reader scrolls it into view
 */
export function More({

	onLoad

}: {

	/**
	 * Called whenever the trigger comes into view, so the list it closes fetches its next batch.
	 */
	onLoad: () => void

}) {

	const id = useId();

	// the trigger is watched as long as it is rendered, since whether it is in view is no state the render reads

	useEffect(() => opt(document.getElementById(id) ?? undefined, element => {

		const observer = new IntersectionObserver(entries => entries
			.filter(entry => entry.isIntersecting)
			.forEach(() => onLoad())
		);

		observer.observe(element);

		return () => observer.disconnect();

	}), [id, onLoad]);

	return createElement("tile-more", { id }, <RefreshCwIcon/>);

}

/**
 * Creates the disclosure of a compact facet.
 *
 * @param options The part configuration
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

	return <button type="button"

		aria-controls={controls}
		aria-expanded={open}
		title={open ? "Collapse" : "Expand"}

		onClick={onToggle}

	>{open ? <ChevronDownIcon/> : <ChevronRightIcon/>}</button>;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
