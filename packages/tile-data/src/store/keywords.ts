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
 * Binds a search box to a shared collection, so that the keywords a reader types narrow what every lens over the
 * collection shows, once the reader pauses or confirms them, rather than at every keystroke.
 *
 * @module
 */

import type { ResourceShape } from "@metreeca/blue/resource";
import type { Lazy } from "@metreeca/core";
import { immutable } from "@metreeca/core/values";
import type { Criteria, Expression } from "@metreeca/qest/model";
import { useEffect, useState } from "preact/hooks";
import type { Collection, Collections } from "./collection.core.js";


/**
 * Shared collection keywords.
 */
export interface Keywords {

	/**
	 * The keywords as the reader typed them, applied or not.
	 */
	readonly text: string


	/**
	 * Updates the keywords as the reader types them, applying them to the collection once the reader pauses.
	 *
	 * @param text The keywords replacing the current ones; blank keywords stop narrowing the collection
	 */
	search(text: string): void

	/**
	 * Applies the keywords to the collection at once, as when the reader confirms them.
	 */
	commit(): void

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Binds a component to the keywords narrowing a shared collection.
 *
 * Narrows the collection to the items whose `expression` contains the keywords, trimmed. The keywords start from those
 * already narrowing the collection, and follow them whenever they are changed or cleared elsewhere, as by
 * {@link "store/collection"!Collection.clear clear}, so that a search box always shows what narrows the list.
 *
 * @typeParam S The shape describing the resource holding the collection
 * @typeParam P The property of the resource collecting the items
 *
 * @param collection The collection narrowed, as handed by {@link "store/collection"!useCollection useCollection}
 * @param expression The expression the keywords are matched against, as a property path: `label`
 * @param options The pause in milliseconds after the last keystroke before the keywords are applied
 *
 * @returns The keywords narrowing `collection` and the transitions updating them
 */
export function useKeywords<S extends Lazy<ResourceShape>, P extends Collections<S>>(

	collection: Collection<S, P>,
	expression: Expression,

	{

		delay = 500

	}: {

		/**
		 * The pause in milliseconds after the last keystroke before the keywords are applied.
		 *
		 * @defaultValue 500
		 */
		readonly delay?: number

	} = {}

): Keywords {

	const key: `~${Expression}` = `~${expression}`;
	const applied = collection.criteria[key] ?? "";

	// the typed text is dropped as the keywords narrowing the collection change elsewhere

	const [typed, setTyped] = useState({ text: applied, from: applied });
	const text = typed.from === applied ? typed.text : applied;

	if ( typed.from !== applied ) {
		setTyped({ text, from: applied });
	}

	// the pause is timed by the browser alone, so a timer is held for as long as the typed text is not applied

	useEffect(() => text.trim() === applied ? undefined : cancel(setTimeout(commit, delay)), [text, collection]);

	return immutable({

		text,

		search: (text: string) => setTyped({ text, from: applied }),

		commit

	});


	function commit(): void {
		collection.filter({ [key]: text.trim() || undefined } as Partial<Criteria>); // ;(cast) computed keys widen to string
	}

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Releases a pending timer.
 *
 * @param timer The timer to be released
 *
 * @returns The effect cleanup cancelling `timer`
 */
function cancel(timer: ReturnType<typeof setTimeout>): () => void {
	return () => clearTimeout(timer);
}
