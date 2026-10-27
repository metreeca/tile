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
 * Collection members.
 *
 * Binds a list or a table to the members of a shared collection, so that it retrieves them batch by batch as the
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
import { createMembers, type Ordering } from "./members.core.js";

export type { Ordering } from "./members.core.js";



/**
 * Collection members cases.
 *
 * @typeParam S The shape describing the resource holding the collection
 * @typeParam P The property of the resource collecting the items
 * @typeParam T The template or projection stating the values wanted from each item
 */
export type MembersCases<S extends Lazy<ResourceShape>, P extends Collections<S>, T> = {

	/**
	 * The first batch is being retrieved.
	 */
	readonly blank: void

	/**
	 * The members are retrieved; they stay on show while the next ones are on their way.
	 */
	readonly ready: {

		/**
		 * The first items of the collection, narrowed to the values the model asks for.
		 */
		readonly state: Items<S, { readonly [K in P]: T }>


		/**
		 * Sorts the items again, starting over the first batch.
		 *
		 * @param order The sort order replacing the current one
		 */
		sort(order: Ordering): void

		/**
		 * Retrieves one more batch; offered while the collection may hold more items, so that a view closes the
		 * list with a trigger handed `load` for as long as it is offered; a call while a batch is on its way is
		 * ignored, so that a trigger left in view never asks twice for the same batch:
		 *
		 * ```tsx
		 * {members({ ready: ({ load }) => load && <More onLoad={load}/> })}
		 * ```
		 */
		load?(): void

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
		 * Retrieves the members again.
		 *
		 * @returns A promise resolving once the members are retrieved; rejects with the {@link Problem} describing the
		 *     failure, if the retrieval fails again, the binding then staying in `error` with it
		 */
		reload(): Promise<void>

	}

}


//// !!! ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Checks an item model against the shape of the collection items.
 *
 * Resolves to `unknown`, which constrains nothing, where the model asks for values the items hold; to `never`
 * otherwise, so that the model fails to compile.
 */
export type Admitted<S extends Lazy<ResourceShape>, P extends Collections<S>, T> =
	{ readonly [K in P]: T } extends Slice<S, { readonly [K in P]: T }> ? unknown : never


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Binds a component to the members of a shared collection.
 *
 * Retrieves from the store offered by the innermost enclosing {@link "store"!Store Store} context the first items of
 * the collection, narrowed by the collection criteria, one more batch each time the view asks for more. The members
 * start over the first batch, and again whenever the collection criteria, the model or the sort order change; the
 * model and the sort order are compared by content, so they may be written inline.
 *
 * @typeParam S The shape describing the resource holding the collection
 * @typeParam P The property of the resource collecting the items
 * @typeParam T The template or projection stating the values wanted from each item
 *
 * @param collection The collection whose members are retrieved
 * @param options The values wanted from each item, the sort order the items start in, and the number of items
 *     retrieved in each batch, the first one included
 *
 * @returns A {@link Relay} over the {@link MembersCases} of the binding
 *
 * @throws {@link !Error Error} If called outside any {@link "store"!Store Store} context
 * @throws {@link !TypeError TypeError} If `batch` isn't a positive integer
 */
export function useMembers<S extends Lazy<ResourceShape>, P extends Collections<S>, T extends object>(
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
): Relay<MembersCases<S, P, T>> {

	const store = useStore();

	const { target: { entry, shape, field }, criteria } = collection;

	const members = useModel(() => createMembers({ order, batch }), [entry, field, criteria, model, order, batch]);

	const holder: Lazy<ResourceShape> = shape; // the generic shape accepts any model: the items are typed by the
											   // signature

	const slice: Template = {
		[field]: {
			...model,
			...criteria,
			...ranks(members.order),
			"#": members.limit
		}
	};

	const binding = createRelay(useEntry({

		store,
		entry,
		model: slice,

		lookup: () => store.lookup({ entry, shape: holder, model: slice })
			.then(match => opt(match, match => items(match, slice))),

		modify: () => ({ limit: members.limit }) // the limit this render asks for, as the items it retrieves answer it

	}));

	return createRelay(binding<Option<MembersCases<S, P, T>>>({

		blank: () => ({ blank: undefined }),

		ready: ({ state, limit }) => immutable({
			ready: {

				state: state as Items<S, { readonly [K in P]: T }>, // ;(cast) retrieved under the model typing T

				...(state.length < limit ? {} : {
					load: () => limit === members.limit ? void members.load() : undefined
				}),
				sort: (order: Ordering) => void members.sort(order)

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
