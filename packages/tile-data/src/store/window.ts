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
 * Binds a list or a table to a window over a shared collection, so that it retrieves only the items the reader can see
 * and the batches around them, while learning the room the whole collection takes.
 *
 * @module
 */

import type { ResourceShape } from "@metreeca/blue/resource";
import { type Items, items, type Slice } from "@metreeca/blue/value";
import { isNumber, isObject, type Lazy, opt, type Optional } from "@metreeca/core";
import { createRelay, type Option, type Relay } from "@metreeca/core/relay";
import { immutable } from "@metreeca/core/values";
import type { Problem } from "@metreeca/http/success";
import type { Criteria, Template } from "@metreeca/qest/model";
import { useModel } from "../model.js";
import type { Collection, Collections } from "./collection.core.js";
import { useEntry } from "./index.core.js";
import { useStore } from "./index.js";
import { createWindow, type Ordering } from "./window.core.js";

export type { Ordering } from "./window.core.js";


//// !!! ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Checks an item model against the shape of the collection items.
 *
 * Resolves to `unknown`, which constrains nothing, where the model asks for values the items hold; to `never`
 * otherwise, so that the model fails to compile.
 */
export type Admitted<S extends Lazy<ResourceShape>, P extends Collections<S>, T> =
	{ readonly [K in P]: T } extends Slice<S, { readonly [K in P]: T }> ? unknown : never


/**
 * Sliding collection window cases.
 *
 * @typeParam S The shape describing the resource holding the collection
 * @typeParam P The property of the resource collecting the items
 * @typeParam T The template or projection stating the values wanted from each item
 */
export type WindowCases<S extends Lazy<ResourceShape>, P extends Collections<S>, T> = {

	/**
	 * The first window is being retrieved.
	 */
	readonly blank: void

	/**
	 * The window is retrieved; it stays on show while the next one is on its way.
	 */
	readonly ready: {

		/**
		 * The items in the window, narrowed to the values the model asks for.
		 */
		readonly state: Items<S, { readonly [K in P]: T }>

		/**
		 * The index of the first item of `state` in the collection.
		 */
		readonly offset: number

		/**
		 * The number of items the collection criteria let through, once counted.
		 */
		readonly total: Optional<number>


		/**
		 * Brings the window over the items in view.
		 *
		 * @param first The index of the first item in view
		 * @param last The index of the last item in view
		 *
		 * @throws {@link !TypeError TypeError} If `first` or `last` isn't a non-negative integer, or if `last` precedes
		 *     `first`
		 */
		move(first: number, last: number): void

		/**
		 * Sorts the items again, starting over the first ones.
		 *
		 * @param order The sort order replacing the current one
		 */
		sort(order: Ordering): void

	}

	/**
	 * The last retrieval failed.
	 */
	readonly error: {

		/**
		 * The problem describing the failure.
		 */
		readonly state: Problem

		/**
		 * Retrieves the window again.
		 *
		 * @returns A promise resolving once the window is retrieved; rejects with the {@link Problem} describing the
		 *     failure, if the retrieval fails again
		 */
		reload(): Promise<void>

	}

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Binds a component to a sliding window over a shared collection.
 *
 * Retrieves from the store offered by the innermost enclosing {@link "store"!Store Store} context the items in view and
 * a batch on either side, narrowed by the collection criteria, and counts the items those criteria let through. The
 * window starts over the first items, and again whenever the collection criteria, the model or the sort order change;
 * the model and the sort order are compared by content, so they may be written inline.
 *
 * @typeParam S The shape describing the resource holding the collection
 * @typeParam P The property of the resource collecting the items
 * @typeParam T The template or projection stating the values wanted from each item
 *
 * @param collection The collection the window reads
 * @param options The values wanted from each item, the sort order the items start in, and the number of items in each
 *     batch
 *
 * @returns A {@link Relay} over the {@link WindowCases} of the binding
 *
 * @throws {@link !Error Error} If called outside any {@link "store"!Store Store} context
 * @throws {@link !TypeError TypeError} If `batch` isn't a positive integer
 */
export function useWindow<S extends Lazy<ResourceShape>, P extends Collections<S>, T extends object>(

	collection: Collection<S, P>,

	{

		model,
		order,
		batch

	}: {

		/**
		 * The template or projection stating the values wanted from each item, checked against the item shape:
		 * `{ label: {} }` lists the labels of the items.
		 */
		readonly model: T & Admitted<S, P, T>

		/**
		 * The sort order the items start in, as expressions mapped to their direction: `{ label: "asc" }`.
		 */
		readonly order?: Ordering

		/**
		 * The number of items in each batch.
		 *
		 * @defaultValue 100
		 */
		readonly batch?: number

	}

): Relay<WindowCases<S, P, T>> {

	const store = useStore();

	const { target: { entry, shape, field }, scope, sieve } = collection;

	const window = useModel(() => createWindow({ order, batch }), [entry, field, scope, sieve, model, order, batch]);

	const criteria: Criteria = { ...scope, ...sieve };

	const slice = useSlot({
		...model,
		...criteria,
		...ranks(window.order),
		"@": window.lower,
		"#": window.upper-window.lower
	}, { offset: window.lower }); // the offset of the slice this render asks for, as the items it retrieves answer it

	const count = useSlot({ ...criteria, "count=count:": {} }, {});

	return createRelay(slice<Option<WindowCases<S, P, T>>>({

		blank: () => ({ blank: undefined }),

		ready: ({ state, offset }) => immutable({
			ready: {

				state: state as Items<S, { readonly [K in P]: T }>, // ;(cast) retrieved under the model typing T
				offset,
				total: count({ ready: ({ state }) => size(state) }),

				move: (first: number, last: number) => void window.move(first, last),
				sort: (order: Ordering) => void window.sort(order)

			}
		}),

		error: error => ({ error })

	}));


	/**
	 * Binds the items of the collection a slot model asks for.
	 *
	 * The generic shape and template accept any model: the items are typed by the signature instead.
	 *
	 * @param slot The template or projection, with its criteria, retrieved from each item
	 * @param extras The values handed over along with the items once retrieved
	 */
	function useSlot<W extends object>(slot: object, extras: W) {

		const holder: Lazy<ResourceShape> = shape;
		const model: Template = { [field]: slot };

		return createRelay(useEntry({

			store,
			entry,
			model,

			lookup: () => store.lookup({ entry, shape: holder, model })
				.then(match => opt(match, match => items(match, model))),

			modify: () => extras

		}));

	}

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * States a sort order as collection criteria.
 *
 * @param order The expressions mapped to their direction
 *
 * @returns The `^` criteria stating `order`
 */
function ranks(order: Ordering): object {
	return Object.fromEntries(Object.entries(order).map(([expression, direction]) => [`^${expression}`, direction]));
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
