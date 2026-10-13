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
 * Binds a component to a window over a collection held by the shared store, so that a list, a table or a picker
 * retrieves only what the reader can see of a long collection and the batches around it, while learning the room the
 * whole collection takes.
 *
 * @module
 */

import type { ResourceShape } from "@metreeca/blue/resource";
import type { Draft, Items, Slice } from "@metreeca/blue/value";
import { isNumber, isObject, type Lazy, opt, type Optional } from "@metreeca/core";
import { createRelay, type Option, type Relay } from "@metreeca/core/relay";
import type { IRI } from "@metreeca/core/resource";
import { createState } from "@metreeca/core/state";
import type { Problem } from "@metreeca/http/success";
import type { Reference } from "@metreeca/qest/state";
import { useModel } from "@metreeca/tile-data/model";
import { useCollection } from "@metreeca/tile-data/store";


/**
 * Binds a component to a sliding window over a collection held by the shared store.
 *
 * Retrieves from the store offered by the innermost enclosing {@link @metreeca/tile-data!store.Store Store} context
 * only the items in view and the batches around them, as
 * {@link @metreeca/tile-data!store.useCollection useCollection} retrieves a whole collection, and counts the
 * collection under the filters the model states, so that a view reserves the room of the items outside the window.
 * The window starts over the first items and follows the items in view as the view reports them, the items held
 * staying on show, where they were taken from, until the new window lands.
 *
 * The model is compared by content, so it may be written inline: a model stating something different, as when a
 * filter changes, starts the window again from the first items.
 *
 * @typeParam S The shape describing the resource holding the collection
 * @typeParam T The model naming the property collecting the items and stating which values of each item are wanted
 *
 * @param options The resource holding the collection, the shape describing it, the model addressing the collection
 *     and the number of items in each batch
 *
 * @returns A {@link Relay} over the state of the binding, to be matched by a view with a handler for each: `blank`
 *     until the first window is retrieved, `ready` with the items in the window, where it stands and the operations
 *     on the collection, or `error` with what prevented either
 *
 * @throws {@link !Error Error} If called outside any {@link @metreeca/tile-data!store.Store Store} context
 * @throws {@link !RangeError RangeError} If `entry` is invalid, or relative while the location is not hierarchical
 */
export function useWindow<S extends Lazy<ResourceShape>, T extends Slice<S, T>>({

	entry,
	shape,
	model,

	batch = 100

}: {

	/**
	 * The identifier of the resource holding the collection, either absolute or relative to the current location.
	 */
	readonly entry: IRI

	/**
	 * The shape describing the resource holding the collection, possibly deferred to break definition cycles.
	 */
	readonly shape: S

	/**
	 * The model naming the multi-valued property collecting the items, stating the values wanted from each item along
	 * with the criteria filtering and sorting them; any offset or limit it states is overridden.
	 */
	readonly model: T

	/**
	 * The number of items in each batch.
	 */
	readonly batch?: number

}): Relay<{

	/**
	 * The first window is being retrieved, with neither items nor an error to show.
	 */
	readonly blank: void

	/**
	 * The window is retrieved, and stays on show while a change the store signals is retrieved again or the window
	 * moves.
	 */
	readonly ready: {

		/**
		 * The items in the window as the store currently holds them, narrowed to the values the model asks for; the
		 * items of the previous window, while the new one is on its way.
		 */
		state: Items<S, T>

		/**
		 * The index of the first item of `state` in the collection.
		 */
		offset: number

		/**
		 * The number of items in the collection under the filters the model states, once counted.
		 */
		total: Optional<number>


		/**
		 * Brings the window over the items in view, the binding following the move as the store answers.
		 *
		 * @param first The index of the first item in view
		 * @param last The index of the last item in view
		 */
		focus(first: number, last: number): void

		/**
		 * Adds an item to the collection, as {@link @metreeca/tile-data!store.useCollection useCollection} does.
		 *
		 * @param state The new item, checked against the item shape; its identifier may be left for the store to assign
		 *
		 * @returns A promise resolving to the absolute identifier the store assigned to the new item, the binding
		 *     following the change as the store signals it; rejects with the {@link Problem} the binding moves to
		 *     `error` with, if the item already exists or the creation fails
		 */
		create(state: Draft<S, T>): Promise<Reference>

	}

	/**
	 * The last exchange with the store failed, whether retrieving the window, counting the collection or adding an
	 * item to it.
	 */
	readonly error: {

		/**
		 * The problem describing the failure.
		 */
		readonly state: Problem

		/**
		 * Retrieves the window again, the binding staying in `error` until the store answers.
		 *
		 * @returns A promise resolving once the window is retrieved and the binding is `ready`; rejects with the
		 *     {@link Problem} the binding moves back to `error` with, if the resource is missing or the retrieval
		 *     fails
		 */
		reload(): Promise<void>

	}

}> {

	// A new model, as when a filter changes, creates the window again from the first items; the models the window
	// hands to the bindings keep their identity until it moves, as bindings comparing models by reference need.

	const { slice, count, lower, stale, focus } = useModel(() => createState<Window>({

		slice: clip(model, 0, 2*batch),
		count: tally(model),

		lower: 0,
		upper: 2*batch,
		stale: undefined,

		focus(first: number, last: number, items: readonly unknown[]) {

			const lower = Math.max(0, Math.floor(first/batch)-1)*batch;
			const upper = (Math.floor(last/batch)+2)*batch;

			return lower === this.lower && upper === this.upper ? {} : {
				slice: clip(model, lower, upper),
				lower,
				upper,
				stale: items === this.stale?.items ? this.stale : { items, lower: this.lower }
			};

		}

	}), [model]);

	const items = useCollection({

		entry,
		shape,

		model: slice as T // ;(cast) offset and limit leave the items typed alike

	});

	const total = useCollection({

		entry,
		shape,

		model: count as T // ;(cast) size() reads the count off an untyped item

	});

	return createRelay(items<Option<Windowed<S, T>>>({

		blank: () => ({ blank: undefined }),

		ready: ready => ({

			ready: {

				...ready,

				offset: ready.state === stale?.items ? stale.lower : lower,
				total: total({ ready: ({ state }) => size(state) }),

				focus: (first, last) => focus(first, last, ready.state)

			}

		}),

		error: error => ({ error })

	}));

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * The states {@link useWindow} relays, as its signature declares them.
 */
type Windowed<S extends Lazy<ResourceShape>, T extends Slice<S, T>> =
	ReturnType<typeof useWindow<S, T>> extends Relay<infer O> ? O : never;

/**
 * Sliding collection window.
 */
interface Window {

	/**
	 * The consumer's model with its criteria asking for the items from {@link lower} up to {@link upper}; any offset or
	 * limit the consumer's model states is overridden, and nothing else is changed.
	 */
	readonly slice: object;

	/**
	 * The consumer's model with its criteria asking for the number of items they let through.
	 */
	readonly count: object;

	/**
	 * The index of the first item in the window, a multiple of the batch size.
	 */
	readonly lower: number;

	/**
	 * The index past the last item in the window, a multiple of the batch size; the collection may end before it.
	 */
	readonly upper: number;

	/**
	 * The items held when the window last moved, with the index of the first of them, if it ever moved: while these
	 * very items are still held, the new window is on its way and they stand where they were taken from.
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
	 * @param items The items held, as the store binding handed them over: immutable, so that they keep their identity
	 *     once remembered as {@link stale}
	 *
	 * @returns The window moved over the items in view, or the same window if it is unchanged
	 */
	focus(first: number, last: number, items: readonly unknown[]): this;

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
function clip(model: object, lower: number, upper: number): object {
	return Object.fromEntries(Object.entries(model).map(([property, selection]) =>
		[property, { ...selection, "@": lower, "#": upper-lower }]
	));
}

/**
 * Creates a model counting the items of a collection.
 *
 * @param model The model naming the property collecting the items, with the criteria filtering and sorting them
 *
 * @returns A model retrieving the number of items `model` lets through as a single `{ count }` item: projection, sort
 *     order, offset and limit are left out, as they leave the count unchanged
 */
function tally(model: object): object {
	return Object.fromEntries(Object.entries(model).map(([property, selection]) =>
		[property, {
			...Object.fromEntries(Object.entries(selection).filter(([key]) => /^[<>~?!]/.test(key))),
			"count=count:": {}
		}]
	));
}

/**
 * Reads the size of a collection off its count.
 *
 * @param items The items retrieved for the count of a collection
 *
 * @returns The count carried by the single item retrieved, if it carries one
 */
function size(items: readonly unknown[]): Optional<number> {
	return opt(items[0], item => isObject(item) && isNumber(item.count) ? item.count : undefined);
}
