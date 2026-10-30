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
import type { Collection, Collections } from "@metreeca/tile-data/store/collection";
import type { CountCases } from "@metreeca/tile-data/store/count";
import { createElement } from "preact";


/**
 * Creates a collection counter.
 *
 * Tells how many items the collection holds, as `12 items`, or, while criteria narrow it, how many of them match,
 * as `3 matches`, grouping digits as the reader's locale does. The counter stays blank while the items are counted
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

	collection,
	count

}: {

	/**
	 * The collection counted, as handed by {@link @metreeca/tile-data!store/collection.useCollection useCollection},
	 * telling whether criteria narrow it and so whether the counter speaks of items or of matches.
	 */
	collection: Collection<S, P>

	/**
	 * The count of the collection, as handed by {@link @metreeca/tile-data!store/count.useCount useCount}.
	 */
	count: Relay<CountCases>

}) {

	const narrowed = Object.keys(collection.criteria).length > 0;

	return createElement("tile-count", { role: "status" }, count({

		ready: ({ state }) => state === 0 ? `no ${narrowed ? "matches" : "items"}`
			: state === 1 ? `1 ${narrowed ? "match" : "item"}`
				: `${state.toLocaleString()} ${narrowed ? "matches" : "items"}`

	}));

}
