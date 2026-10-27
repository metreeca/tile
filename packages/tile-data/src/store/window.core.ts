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
 * Sliding collection window state.
 *
 * Holds where a list or a table stands in a long collection and the order it shows the items in, so that the view
 * reads a long collection without retrieving it all at once.
 *
 * @module
 */

import { assert, type Optional } from "@metreeca/core";
import { createState } from "@metreeca/core/state";
import { equals } from "@metreeca/core/values";
import type { Expression, Order } from "@metreeca/qest/model";


/**
 * Sliding collection window.
 */
export interface Window {

	/**
	 * The sort order the items are shown in.
	 */
	readonly order: Ordering


	/**
	 * The index of the first item in the window.
	 */
	readonly lower: number

	/**
	 * The index past the last item in the window; the collection may end before it.
	 */
	readonly upper: number


	/**
	 * Brings the window over the items in view, with one more batch on either side.
	 *
	 * @param first The index of the first item in view
	 * @param last The index of the last item in view
	 *
	 * @returns The window over the items in view, or the same window if it is unchanged
	 *
	 * @throws {@link !TypeError TypeError} If `first` or `last` isn't a non-negative integer, or if `last` precedes
	 *     `first`
	 */
	move(first: number, last: number): this

	/**
	 * Sorts the items again, starting over the first ones.
	 *
	 * @param order The sort order replacing the current one
	 *
	 * @returns The window over the first items in the new order, or the same window if the order is unchanged
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
 * Creates a sliding collection window over the first batch and the one after it.
 *
 * @param options The sort order the items start in and the number of items in each batch
 *
 * @returns A window over the first items
 *
 * @throws {@link !TypeError TypeError} If `batch` isn't a positive integer
 */
export function createWindow({

	order = {},
	batch = 100

}: {

	readonly order?: Optional<Ordering>
	readonly batch?: Optional<number>

} = {}): Window {

	const $batch = assert(batch, batch => Number.isInteger(batch) && batch > 0, `illegal batch size <${batch}>`);

	return createState<Window>({

		order,

		lower: 0,
		upper: 2*$batch,

		move(first: number, last: number) {

			const [$first, $last] = assert([first, last], ([first, last]) =>
					Number.isInteger(first) && Number.isInteger(last) && 0 <= first && first <= last,
				`illegal window range <${first}, ${last}>`
			);

			const lower = Math.max(0, Math.floor($first/$batch)-1)*$batch;
			const upper = (Math.floor($last/$batch)+2)*$batch;

			return lower === this.lower && upper === this.upper ? {} : { lower, upper };

		},

		sort(order: Ordering) {
			return equals(order, this.order) ? {} : { order, lower: 0, upper: 2*$batch };
		}

	});

}
