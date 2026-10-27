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
 * Collection options state.
 *
 * Holds the keywords a reader narrows the options of a facet by and the page of options on show, so that a facet over
 * a long list of values shows only the ones the reader is looking for, a page at a time.
 *
 * @module
 */

import type { Optional } from "@metreeca/core";
import { createState } from "@metreeca/core/state";


/**
 * Collection options.
 */
export interface Options {

	/**
	 * The keywords the options on show are narrowed by.
	 */
	readonly keywords: string

	/**
	 * The index of the first option on show.
	 */
	readonly offset: number

	/**
	 * The number of options on show, or `0` to show them all.
	 */
	readonly limit: number


	/**
	 * Narrows the options on show by keywords.
	 *
	 * @param keywords The keywords replacing the current ones; empty keywords show the options from the first one again
	 *
	 * @returns The options narrowed by `keywords`
	 */
	search(keywords: string): this

	/**
	 * Moves the options on show.
	 *
	 * @param offset The index of the first option on show; a negative index stands for the first option
	 *
	 * @returns The options from `offset`
	 */
	seek(offset: number): this

	/**
	 * Resizes the options on show.
	 *
	 * @param limit The number of options on show, or `0` to show them all; a negative number stands for `0`
	 *
	 * @returns The options showing `limit` of them
	 */
	resize(limit: number): this

	/**
	 * Shows the options as they stood when created again.
	 *
	 * @returns The options with no keywords, from the first one, showing as many as they were created to show
	 */
	reset(): this

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates collection options.
 *
 * @param options The number of options on show
 *
 * @returns Options with no keywords, from the first one
 */
export function createOptions({

	size = 0

}: {

	/**
	 * The number of options on show, or `0` to show them all.
	 *
	 * @defaultValue 0
	 */
	readonly size?: Optional<number>

} = {}): Options {

	const initial = { keywords: "", offset: 0, limit: Math.max(0, size) };

	return createState<Options>({

		...initial,

		search(keywords: string) {
			return keywords === "" ? { keywords, offset: 0 } : { keywords };
		},

		seek(offset: number) {
			return { offset: Math.max(0, offset) };
		},

		resize(limit: number) {
			return { limit: Math.max(0, limit) };
		},

		reset() {
			return initial;
		}

	});

}
