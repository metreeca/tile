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
 * Incremental collection paging.
 *
 * Holds the window a view reads a collection through, growing it a batch at a time, so that a list, a table or a
 * picker fetches a long collection as it is read rather than all at once.
 *
 * The window rides on the collection model itself, as the limit criterion the store takes, so a view hands
 * {@link Paging.model} to the store binding and nothing else: the model keeps its identity until the window grows,
 * which is what a binding comparing models by reference needs.
 *
 * Adopt it with `useModel`, listing the consumer's model as a dependency, so that a new query starts again from the
 * first batch:
 *
 * ```tsx
 * const { model: paged, limit, asked, next } = useModel(() => Paging({ model }), [model]);
 * ```
 *
 * @module
 */

import { createState } from "@metreeca/core/state";
import type { Optional } from "@metreeca/core";
import type { Template } from "@metreeca/qest/model";


/**
 * Incremental collection paging.
 */
export interface Paging {

	/**
	 * The consumer's model with its criteria asking for one item more than {@link limit}, which tells whether the
	 * collection holds more; any limit the consumer's model states is overridden, and nothing else is changed.
	 */
	readonly model: Template;

	/**
	 * The number of items on show.
	 */
	readonly limit: number;

	/**
	 * The items on show when the next batch was last asked for, if it ever was: while a view still holds these very
	 * items, the batch is on its way and only the items before it are on show.
	 */
	readonly asked: Optional<readonly unknown[]>;


	/**
	 * Asks for the next batch.
	 *
	 * @param items The items on show, as the store binding handed them over: immutable, so that they keep their
	 *     identity once remembered as {@link asked}
	 *
	 * @returns The paging grown by a batch, or the same paging if the batch asked over `items` is still on its way
	 */
	next(items: readonly unknown[]): this;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates an incremental collection paging.
 *
 * @param options The model the paging is applied to, and the number of items in each batch
 *
 * @returns A paging showing the first batch of `model`
 */
export function Paging({

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

	return createState<Paging>({

		model: page(model, batch),
		limit: batch,
		asked: undefined,

		next(items: readonly unknown[]) {
			return items === this.asked ? {} : {
				model: page(model, this.limit + batch),
				limit: this.limit + batch,
				asked: items
			};
		}

	});

}


/**
 * Limits a collection model to the items on show and the one telling whether there are more.
 *
 * @param model The model naming the property collecting the items, with the criteria on them
 * @param limit The number of items on show
 *
 * @returns A copy of `model` whose criteria ask for `limit + 1` items, overriding any limit it states
 */
function page(model: Template, limit: number): Template {
	return Object.fromEntries(Object.entries(model).map(([property, selection]) =>
		[property, { ...selection, "#": limit + 1 }]
	));
}
