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
 * Draws the parts the widgets share out of plain markup styled by `@metreeca/skin`, so a lens, a facet or a field
 * marks loading, emptiness and failure alike, and opens, closes, grows and turns to its settings alike, whichever
 * widget it is, so a reader learns these gestures once for every widget the package offers.
 *
 * @module
 */

import { opt, type Optional } from "@metreeca/core";
import { CheckIcon, CircleAlertIcon, RefreshCwIcon } from "lucide-preact";
import { type ComponentChildren, createElement } from "preact";
import { useEffect, useId } from "preact/hooks";
import "./index.css";


/*
 * Whether the reader is pressing anywhere on the page: a press drops focus before it is released, so focus dropped
 * while no press is held was dropped by a redraw. Module state, as presses outside every facet have to be seen too;
 * clearing it on a timer would not do, as browsers may run a redraw dropping focus ahead of the timer.
 */

let pressing = false;

globalThis.document?.addEventListener("mousedown", () => { pressing = true; }, { capture: true });
globalThis.document?.addEventListener("mouseup", () => { pressing = false; }, { capture: true });


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
 * Creates the configure button of a facet.
 *
 * Leads the facet header, marked by the glyph of the facet while the facet shows what it offers and by a check mark
 * while it shows its settings, so the reader turns the facet to its settings and back again by the same button.
 *
 * @param options The part configuration
 *
 * @returns A button with a tooltip naming what pressing it does: `Configure` or `Done`
 */
export function Configure({

	configuring,

	glyph,

	onToggle

}: {

	/**
	 * Whether the facet shows its settings.
	 */
	configuring: boolean

	/**
	 * The glyph marking the facet.
	 */
	glyph: ComponentChildren

	/**
	 * Called when the reader presses the button.
	 */
	onToggle: () => void

}) {

	// Safari leaves buttons off the keyboard path unless the reader opts in, so the button states its place on it

	return <button type="button" tabIndex={0}

		title={configuring ? "Done" : "Configure"}

		onClick={onToggle}

	>{configuring ? <CheckIcon/> : glyph}</button>;

}

/**
 * Creates the settings of a facet.
 *
 * Lists each setting by its name beside the control changing it, starting with the `Collapse` checkbox stating
 * whether the facet closes as focus leaves it or stays open until the reader changes the setting again.
 *
 * @param options The part configuration
 *
 * @returns The settings, applied as the reader changes them
 */
export function Settings({

	collapsing,

	onCollapsing

}: {

	/**
	 * Whether the facet closes as focus leaves it.
	 */
	collapsing: boolean

	/**
	 * Called with the new setting when the reader ticks or unticks `Collapse`.
	 */
	onCollapsing: (collapsing: boolean) => void

}) {

	return createElement("tile-settings", {}, <label>

		{"Collapse"}

		<input type="checkbox" checked={collapsing}
			onChange={event => onCollapsing(event.currentTarget.checked)}
		/>

	</label>);

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
 * Closes a facet as focus leaves it.
 *
 * The facet closes when the reader tabs out of it, presses outside it, or switches to another window. Some browsers
 * also drop focus when a focused part is redrawn, for instance an option retrieved again or moved up the list as it
 * is ticked. The facet stays open in that case, and focus returns to the redrawn part, or to the facet itself if the
 * part is gone, so a later move out of the facet still closes it. A facet element must therefore be focusable, as by
 * a `tabIndex` of `-1`, or a redraw leaves it open and unfocused, and nothing then closes it.
 *
 * @param event The focus event leaving an element of the facet
 * @param collapse What closes the facet, called only once focus has moved out of the facet, possibly after the event
 */
export function leave(event: FocusEvent, collapse: () => void): void {

	const facet = event.currentTarget;
	const source = event.target;
	const target = event.relatedTarget;

	if ( facet instanceof HTMLElement && source instanceof HTMLElement && target === null ) {

		const pressed = pressing;

		queueMicrotask(() => pressed || document.activeElement === source ? collapse()
			: source.isConnected ? source.focus({ preventScroll: true })
				: facet.focus({ preventScroll: true })
		);

	} else if ( !(facet instanceof Node && target instanceof Node && facet.contains(target)) ) {

		collapse();

	}

}
