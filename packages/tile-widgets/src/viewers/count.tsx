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
 * Collection counter.
 *
 * Offers the counter telling a reader how many items a collection holds, or how many of them match the criteria
 * narrowing it, keeping in step with every other lens showing and narrowing the same collection.
 *
 * @module
 */

import type { ResourceShape } from "@metreeca/blue/resource";
import type { Lazy } from "@metreeca/core";
import type { Relay } from "@metreeca/core/relay";
import type { Collection, Collections } from "@metreeca/tile/collection";
import type { CountCases } from "@metreeca/tile/count";
import { createElement } from "preact";
import "./count.css";


/**
 * The default English wording of a count, given in lowercase for the counter to set in title case.
 */
const Labels = {

	item: "item",
	items: "items",
	empty: "no items",

	match: "match",
	matches: "matches",
	unmatched: "no matches",

};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a collection counter.
 *
 * Tells how many items the collection holds, as `12 Items`, or, once the reader filters it, how many of them match,
 * as `3 Matches`, grouping digits as the reader's locale does. The counter stays blank while the items are counted
 * for the first time or the count fails, and keeps the last count on show while the items are counted again.
 *
 * The counter is a status region, so assistive technology announces each new count without moving focus to it.
 *
 * ```tsx
 * const collection = useCollection({ entry: "/courses/", shape: Course });
 *
 * <Count collection={collection} count={useCount(collection)}/>
 * ```
 *
 * @typeParam S The shape describing the resource holding the collection
 * @typeParam P The property of the resource collecting the items
 *
 * @param options The widget configuration
 *
 * @returns The counter
 *
 * @see {@link https://www.w3.org/WAI/WCAG22/Understanding/status-messages WCAG 2.2: Status Messages}
 */
export function Count<S extends Lazy<ResourceShape>, P extends Collections<S>>({

	count,
	labels = Labels

}: {

	/**
	 * The collection counted, as handed by {@link @metreeca/tile!collection.useCollection useCollection}.
	 */
	collection: Collection<S, P>

	/**
	 * The count of the collection, as handed by {@link @metreeca/tile!count.useCount useCount}.
	 *
	 * The counter speaks of matches for a filtered count and of items otherwise. The wording follows the count on
	 * show, so it always agrees with the number, even while the items are counted again under new filters.
	 */
	count: Relay<CountCases>

	/**
	 * The wording of the count; English if omitted.
	 *
	 * An unfiltered count reads `empty` if the collection holds no items, otherwise the number followed by `item` or
	 * `items`. A filtered count reads `unmatched` if no item matches, otherwise the number followed by `match` or
	 * `matches`. The empty phrases are given whole, so each language can word them in its own way. All the wording is
	 * given in lowercase, and the counter sets it in title case, just as it does with the English default.
	 */
	labels?: Readonly<Record<"empty" | "item" | "items" | "unmatched" | "match" | "matches", string>>

}) {

	return createElement("tile-count", { role: "status" }, count({

		ready: ({ state, filtered }) => {

			const none = filtered ? labels.unmatched : labels.empty;
			const one = filtered ? labels.match : labels.item;
			const many = filtered ? labels.matches : labels.items;

			return state === 0 ? none
				: state === 1 ? `1 ${one}`
					: `${state.toLocaleString()} ${many}`;

		}

	}));

}
