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
 * Sliding collection window.
 *
 * Holds the window a view reads a collection through, an actual slice of the collection following the items in view,
 * so that a list, a table or a picker fetches only what the reader can see of a long collection and the batches around
 * it.
 *
 * The window rides on the collection model itself, as the offset and limit criteria the store takes, so a view hands
 * {@link Window.model} to the store binding and nothing else: the model keeps its identity until the window moves,
 * which is what a binding comparing models by reference needs. {@link tally} counts the whole collection under the
 * same filters, so that a view can reserve the room taken by the items outside the window.
 *
 * Adopt it with `useModel`, listing the consumer's model as a dependency, so that a new query starts again from the
 * first window:
 *
 * ```tsx
 * const { model: slice, lower, upper, stale, focus } = useModel(() => Window({ model }), [model]);
 * ```
 *
 * @module
 */

import { createState } from "@metreeca/core/state";
import type { Optional } from "@metreeca/core";
import type { Template } from "@metreeca/qest/model";


/**
 * Sliding collection window.
 */
export interface Window {

	/**
	 * The consumer's model with its criteria asking for the items from {@link lower} up to {@link upper}; any offset or
	 * limit the consumer's model states is overridden, and nothing else is changed.
	 */
	readonly model: Template;

	/**
	 * The index of the first item in the window, a multiple of the batch size.
	 */
	readonly lower: number;

	/**
	 * The index past the last item in the window, a multiple of the batch size; the collection may end before it.
	 */
	readonly upper: number;

	/**
	 * The items a view held when the window last moved, with the index of the first of them, if it ever moved: while a
	 * view still holds these very items, the new window is on its way and they stand where they were taken from.
	 */
	readonly stale: Optional<{

		readonly items: readonly unknown[]
		readonly lower: number

	}>;


	/**
	 * Brings the window over the items in view.
	 *
	 * The window spans the batches holding the items in view and one more batch on either side, so that a reader
	 * scrolling within it fetches nothing.
	 *
	 * @param first The index of the first item in view
	 * @param last The index of the last item in view
	 * @param items The items the view holds, as the store binding handed them over: immutable, so that they keep their
	 *     identity once remembered as {@link stale}
	 *
	 * @returns The window moved over the items in view, or the same window if it is unchanged
	 */
	focus(first: number, last: number, items: readonly unknown[]): this;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a sliding collection window.
 *
 * @param options The model the window is applied to, and the number of items in each batch
 *
 * @returns A window over the first batches of `model`, as if its first item were in view
 */
export function Window({

	model,
	batch = 25

}: {

	/**
	 * The model naming the property collecting the items, with the criteria filtering and sorting them.
	 */
	model: Template

	/**
	 * The number of items in each batch.
	 */
	batch?: number

}) {

	const initial = span(0, 0, batch);

	return createState<Window>({

		model: slice(model, initial.lower, initial.upper),

		lower: initial.lower,
		upper: initial.upper,
		stale: undefined,

		focus(first: number, last: number, items: readonly unknown[]) {

			const { lower, upper } = span(first, last, batch);

			return lower === this.lower && upper === this.upper ? {} : {
				model: slice(model, lower, upper),
				lower,
				upper,
				stale: items === this.stale?.items ? this.stale : { items, lower: this.lower }
			};

		}

	});

}

/**
 * Creates a model counting the items of a collection.
 *
 * @param model The model naming the property collecting the items, with the criteria filtering and sorting them
 *
 * @returns A model retrieving the number of items `model` lets through as a single `{ count }` item: projection, sort
 *     order, offset and limit are left out, as they leave the count unchanged
 */
export function tally(model: Template): Template {
	return Object.fromEntries(Object.entries(model).map(([property, selection]) =>
		[property, {
			...Object.fromEntries(Object.entries(selection).filter(([key]) => /^[<>~?!]/.test(key))),
			"count=count:": {}
		}]
	));
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Computes the window over a range of items in view.
 *
 * @param first The index of the first item in view
 * @param last The index of the last item in view
 * @param batch The number of items in each batch
 *
 * @returns The bounds of the batches holding the items from `first` to `last`, widened by a batch on either side and
 *     stopped at the first item
 */
function span(first: number, last: number, batch: number): { lower: number, upper: number } {
	return {
		lower: Math.max(0, Math.floor(first/batch)-1)*batch,
		upper: (Math.floor(last/batch)+2)*batch
	};
}

/**
 * Limits a collection model to a window.
 *
 * @param model The model naming the property collecting the items, with the criteria on them
 * @param lower The index of the first item in the window
 * @param upper The index past the last item in the window
 *
 * @returns A copy of `model` whose criteria ask for the items from `lower` up to `upper`, overriding any offset and
 *     limit it states
 */
function slice(model: Template, lower: number, upper: number): Template {
	return Object.fromEntries(Object.entries(model).map(([property, selection]) =>
		[property, { ...selection, "@": lower, "#": upper-lower }]
	));
}
