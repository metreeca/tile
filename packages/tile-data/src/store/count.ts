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
 * Shared collection count.
 *
 * Binds a counter to a shared collection, so that it tells how many items the collection criteria let through and
 * follows every lens narrowing them, with no exchange of its own beyond the count.
 *
 * @module
 */

import type { ResourceShape } from "@metreeca/blue/resource";
import { items } from "@metreeca/blue/value";
import { isNumber, isObject, type Lazy, opt } from "@metreeca/core";
import { createRelay, type Relay } from "@metreeca/core/relay";
import type { Problem } from "@metreeca/http/success";
import type { Template } from "@metreeca/qest/model";
import type { Collection, Collections } from "./collection.core.js";
import { useEntry } from "./index.core.js";
import { useStore } from "./index.js";


/**
 * Shared collection count cases.
 */
export type CountCases = {

	/**
	 * The items are being counted for the first time.
	 */
	readonly blank: void

	/**
	 * The items are counted; the count stays on show while the items are counted again under new criteria.
	 */
	readonly ready: {

		/**
		 * The number of items the collection criteria let through.
		 */
		readonly state: number

	}

	/**
	 * The last count failed.
	 */
	readonly error: {

		/**
		 * The problem describing the failure.
		 */
		readonly state: Problem

		/**
		 * Counts the items again.
		 *
		 * @returns A promise resolving once the items are counted; rejects with the {@link Problem} describing the
		 *     failure, if the count fails again, the binding then staying in `error` with it
		 */
		reload(): Promise<void>

	}

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Binds a component to the count of a shared collection.
 *
 * Counts through the store offered by the innermost enclosing {@link "store"!Store Store} context the items the
 * reader's criteria let through. The items are counted again whenever the criteria change or the store signals a
 * change to the collection, whoever made it, so that a counter keeps in step with every list over it.
 *
 * @typeParam S The shape describing the resource holding the collection
 * @typeParam P The property of the resource collecting the items
 *
 * @param collection The collection whose items are counted under the reader's criteria, as handed by
 *     {@link "store/collection"!useCollection useCollection} to every lens over it
 *
 * @returns A {@link Relay} over the {@link CountCases} of the binding
 *
 * @throws {@link !Error Error} If called outside any {@link "store"!Store Store} context
 */
export function useCount<S extends Lazy<ResourceShape>, P extends Collections<S>>({

	target: { entry, shape, field },
	criteria

}: Collection<S, P>): Relay<CountCases> {

	const store = useStore();

	const holder: Lazy<ResourceShape> = shape; // the generic shape accepts any model: the count is typed by the signature
	const model: Template = { [field]: { ...criteria, "count=count:": {} } };

	return createRelay(useEntry({

		store,
		entry,
		model,

		lookup: () => store.lookup({ entry, shape: holder, model })
			.then(match => opt(match, match => size(items(match, model)))),

		modify: () => ({})

	}));

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Reads the size of a collection off its count.
 *
 * @param items The items retrieved for the count of a collection
 *
 * @returns The count carried by the single item retrieved, or `0` if the collection holds no items
 */
function size(items: readonly unknown[]): number {
	return opt(items[0], item => isObject(item) && isNumber(item.count) ? item.count : undefined) ?? 0;
}
