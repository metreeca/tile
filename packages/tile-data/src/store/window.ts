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
 * Growing collection window.
 *
 * Binds a list or a table to a window over a shared collection, so that it retrieves the items batch by batch as the
 * reader scrolls through them, rather than the whole collection at once, however long it grows.
 *
 * @module
 */

import type { ResourceShape } from "@metreeca/blue/resource";
import { type Items, items, type Slice } from "@metreeca/blue/value";
import { type Lazy, opt } from "@metreeca/core";
import { createRelay, type Option, type Relay } from "@metreeca/core/relay";
import { immutable } from "@metreeca/core/values";
import type { Problem } from "@metreeca/http/success";
import type { Template } from "@metreeca/qest/model";
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
 * Growing collection window cases.
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
		 * The first items of the collection, narrowed to the values the model asks for.
		 */
		readonly state: Items<S, { readonly [K in P]: T }>


		/**
		 * Grows the window by one batch; offered while the collection may hold more items, so that a view closes the
		 * list with a trigger handed `more` for as long as it is offered; a call while a batch is on its way is ignored:
		 *
		 * ```tsx
		 * {window({ ready: ({ more }) => more && <More onLoad={more}/> })}
		 * ```
		 */
		readonly more?: () => void

		/**
		 * Sorts the items again, starting over the first batch.
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
 * Binds a component to a growing window over a shared collection.
 *
 * Retrieves from the store offered by the innermost enclosing {@link "store"!Store Store} context the first items of
 * the collection, narrowed by the collection criteria, one more batch each time the view asks for more. The window
 * starts over the first batch, and again whenever the collection criteria, the model or the sort order change; the
 * model and the sort order are compared by content, so they may be written inline.
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

	const holder: Lazy<ResourceShape> = shape; // the generic shape accepts any model: the items are typed by the signature

	const slice: Template = {
		[field]: {
			...model,
			...scope,
			...sieve,
			...ranks(window.order),
			"#": window.limit
		}
	};

	const binding = createRelay(useEntry({

		store,
		entry,
		model: slice,

		lookup: () => store.lookup({ entry, shape: holder, model: slice })
			.then(match => opt(match, match => items(match, slice))),

		modify: () => ({ limit: window.limit }) // the limit this render asks for, as the items it retrieves answer it

	}));

	return createRelay(binding<Option<WindowCases<S, P, T>>>({

		blank: () => ({ blank: undefined }),

		ready: ({ state, limit }) => immutable({
			ready: {

				state: state as Items<S, { readonly [K in P]: T }>, // ;(cast) retrieved under the model typing T

				...(state.length < limit ? {} : { more: () => limit === window.limit ? void window.more() : undefined }),
				sort: (order: Ordering) => void window.sort(order)

			}
		}),

		error: error => ({ error })

	}));

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
