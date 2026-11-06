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
 * Shared collection keywords.
 *
 * Binds a search box to a shared collection, so that the keywords it hands over narrow what every lens over the
 * collection shows; pacing the keywords as the reader types is left to the search box.
 *
 * @module
 */

import type { ResourceShape } from "@metreeca/blue/resource";
import type { Lazy } from "@metreeca/core";
import { immutable } from "@metreeca/core/values";
import type { Criteria, Expression } from "@metreeca/qest/model";
import type { Collection, Collections } from "./collection.core.js";


/**
 * Shared collection keywords.
 */
export interface Keywords {

	/**
	 * The keywords narrowing the collection, empty where none do.
	 */
	readonly text: string


	/**
	 * Narrows the collection by new keywords at once.
	 *
	 * @param text The keywords replacing the current ones, trimmed; blank keywords stop narrowing the collection
	 */
	search(text: string): void

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Binds a component to the keywords narrowing a shared collection.
 *
 * Narrows the collection to the items whose `expression` contains the keywords, trimmed. The keywords start from those
 * already narrowing the collection, and follow them whenever they are changed or cleared elsewhere, as by
 * {@link "store/collection"!Collection.clear clear}, so that a search box always shows what narrows the list.
 *
 * The keywords are applied and handed back trimmed at every {@link Keywords.search search}, so the search box holds the
 * text as the reader types it, spaces between words included, and decides on its own when to hand it over.
 *
 * @typeParam S The shape describing the resource holding the collection
 * @typeParam P The property of the resource collecting the items
 *
 * @param collection The collection narrowed, as handed by {@link "store/collection"!useCollection useCollection}
 * @param expression The expression the keywords are matched against, as a property path: `label`
 *
 * @returns The keywords narrowing `collection` and the transition updating them
 */
export function useKeywords<S extends Lazy<ResourceShape>, P extends Collections<S>>(

	collection: Collection<S, P>,
	expression: Expression

): Keywords {

	const key: `~${Expression}` = `~${expression}`;

	return immutable({

		text: collection.query[key] ?? "",

		search: (text: string) => collection.filter(
			{ [key]: text.trim() || undefined } as Partial<Criteria> // ;(cast) computed keys widen to string
		)

	});

}
