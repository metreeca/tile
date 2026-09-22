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
 * Preact widgets and controls.
 *
 * Provides the pieces a widget declares its props out of, the defaults its controls observe, and the attribute values
 * and event handlers it builds out of state, so a control offers the surface the platform already carries without
 * restating it. The widgets themselves come from their own modules, leaving a screen with the ones it renders and
 * nothing else.
 *
 * @module index
 */

import { type Optional } from "@metreeca/core";
import { type JSX } from "preact";


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
 * Native event handlers.
 *
 * Collects every event handler prop an element accepts, so a gesture a widget doesn't itself interpret is wired
 * straight on the control it renders rather than around the widget.
 *
 * @typeParam T The tag of the element whose handlers are taken
 */
export type Handlers<T extends keyof JSX.IntrinsicElements> =
	Pick<JSX.IntrinsicElements[T],
		Extract<keyof JSX.IntrinsicElements[T], `on${string}`>
	>


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
