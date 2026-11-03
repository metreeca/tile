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
 * Collection members state.
 *
 * Holds how far a list or a table has read into a long collection and the order it shows the items in, so that the
 * view reads a long collection as the reader scrolls through it rather than retrieving it all at once.
 *
 * @module
 */

import { assert, type Optional } from "@metreeca/core";
import { createState } from "@metreeca/core/state";
import { equals } from "@metreeca/core/values";
import type { Expression, Order } from "@metreeca/qest/model";


/**
 * Collection members.
 */
export interface Members {

	/**
	 * The sort order the items are shown in.
	 */
	readonly order: Ordering


	/**
	 * The number of items requested so far from the start of the collection, which may hold fewer.
	 */
	readonly limit: number

	/**
	 * The number of items retrieved in each batch.
	 */
	readonly batch: number


	/**
	 * Retrieves one more batch.
	 *
	 * @returns The members over the items retrieved and the batch after them
	 */
	load(): this

	/**
	 * Sorts the items again, starting over the first batch.
	 *
	 * @param order The sort order replacing the current one
	 *
	 * @returns The members over the first batch in the new order, or the same members if the order is unchanged
	 */
	sort(order: Ordering): this

}

/**
 * View sort order.
 *
 * Maps the expressions the items are sorted on, property paths possibly behind a transform pipe, to their direction,
 * as the qest `Order` states it: `{ label: "asc" }` or `{ "year:released": "desc" }`.
 */
export type Ordering = {

	readonly [expression: Expression]: Order

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates collection members over the first batch.
 *
 * @param options The sort order the items start in and the number of items in each batch
 *
 * @returns The members over the first batch
 *
 * @throws {@link !TypeError TypeError} If `batch` isn't a positive integer
 */
export function createMembers({

	order = {},
	batch = 100

}: {

	readonly order?: Optional<Ordering>
	readonly batch?: Optional<number>

} = {}): Members {

	const $batch = assert(batch, batch => Number.isInteger(batch) && batch > 0, `illegal batch size <${batch}>`);

	return createState<Members>({

		order,

		batch: $batch,
		limit: $batch,

		load() {
			return { limit: this.limit+$batch };
		},

		sort(order: Ordering) {
			return equals(order, this.order) ? {} : { order, limit: $batch };
		}

	});

}
