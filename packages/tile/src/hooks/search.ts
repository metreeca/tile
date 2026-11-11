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
 * Shared collection search.
 *
 * Binds a search box to a shared collection, so that the text it submits narrows what every lens over the collection
 * shows. The search box decides when to submit the text as the reader types, for instance on a pause or on `Enter`.
 *
 * @module search
 */

import type { ResourceShape } from "@metreeca/blue/resource";
import type { Lazy } from "@metreeca/core";
import { immutable } from "@metreeca/core/values";
import type { Criteria, Expression } from "@metreeca/qest/model";
import type { Collection, Collections } from "./collection.core.js";


/**
 * Shared collection search.
 *
 * Tells which text narrows a shared collection and replaces it with new text.
 */
export interface Search {

	/**
	 * The text narrowing the collection, empty if no text narrows it.
	 */
	readonly text: string


	/**
	 * Narrows the collection by new text at once.
	 *
	 * @param text The text replacing the current one, trimmed; blank text stops narrowing the collection
	 */
	submit(text: string): void

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Binds a component to the search narrowing a shared collection.
 *
 * Narrows the collection to the items whose `expression` contains the submitted text, trimmed. The text starts from
 * the one already narrowing the collection. It follows that text whenever another widget changes it or clears it, as
 * {@link "collection"!Collection.clear clear} does, so a search box always shows what narrows the collection.
 *
 * Every {@link Search.submit submit} trims the text, so `text` may differ from what the reader typed. A search box
 * keeps its own copy of the typed text, spaces between words included, and decides on its own when to submit it.
 *
 * @typeParam S The shape describing the resource holding the collection
 * @typeParam P The property of the resource collecting the items
 *
 * @param collection The collection narrowed, as handed by {@link "collection"!useCollection useCollection}
 * @param expression The expression the text is matched against, as a property path: `label`
 *
 * @returns The text narrowing `collection` and the transition submitting new text
 */
export function useSearch<S extends Lazy<ResourceShape>, P extends Collections<S>>(

	collection: Collection<S, P>,
	expression: Expression

): Search {

	const key: `~${Expression}` = `~${expression}`;

	return immutable({

		text: collection.query[key] ?? "",

		submit: (text: string) => collection.filter(
			{ [key]: text.trim() || undefined } as Partial<Criteria> // ;(cast) computed keys widen to string
		)

	});

}
