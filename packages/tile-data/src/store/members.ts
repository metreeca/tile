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
 * Shared collection members.
 *
 * Lets a component add items to a collection held by the {@link "store"!Store shared store}, while the lenses showing
 * the collection follow the change on their own, as the store signals it.
 *
 * @module
 */

import type { ResourceShape } from "@metreeca/blue/resource";
import { blueprint, type Draft } from "@metreeca/blue/value";
import type { Lazy, Optional } from "@metreeca/core";
import { some } from "@metreeca/core/arrays";
import { type IRI, resolve } from "@metreeca/core/resource";
import { immutable } from "@metreeca/core/values";
import { Conflict, NotFound } from "@metreeca/http";
import { type Problem, toProblem } from "@metreeca/http/success";
import type { Template } from "@metreeca/qest/model";
import type { Reference } from "@metreeca/qest/state";
import type { Collection, Collections } from "./collection.core.js";
import { useStore } from "./index.js";


/**
 * Binds a component to the members of a collection held by the shared store.
 *
 * @typeParam S The shape describing the resource holding the collection
 * @typeParam P The property of the resource collecting the items
 *
 * @param collection The collection whose members are bound, as handed by
 *     {@link "store/collection"!useCollection useCollection}
 *
 * @returns The operations on the members of `collection`, writing through the store offered by the innermost
 *     enclosing {@link "store"!Store Store} context
 *
 * @throws {@link !Error Error} If called outside any {@link "store"!Store Store} context
 */
export function useMembers<S extends Lazy<ResourceShape>, P extends Collections<S>>({

	target: { entry, shape, field }

}: Collection<S, P>): {

	/**
	 * Adds an item to the collection.
	 *
	 * @param state The new item, checked against the item shape; its identifier may be left for the store to assign
	 *
	 * @returns A promise resolving to the absolute identifier the store assigned to the new item, so that a view can
	 *     move there, every lens following the change as the store signals it; rejects with the {@link Problem}
	 *     describing the failure, if the item already exists or the creation fails
	 */
	create(state: Draft<S, { readonly [K in P]: {} }>): Promise<Reference>

	/**
	 * Removes items from the collection.
	 *
	 * Items are removed concurrently, each against the item shape: a failure rejects the whole removal, while the other
	 * items may already be gone, as the store signals to the lenses showing the collection.
	 *
	 * @param entries The identifiers of the items to be removed, absolute or relative to the resource holding the
	 *     collection, as `"2"` stands for `https://example.com/catalogue/2` in `https://example.com/catalogue/`
	 *
	 * @returns A promise resolving to the absolute identifiers of the removed items, in the order given, every lens
	 *     following the change as the store signals it; rejects with the {@link Problem} describing the first failure,
	 *     if an item is missing or its removal fails
	 *
	 * @throws {@link !RangeError RangeError} If an identifier is invalid
	 */
	delete(entries: IRI | readonly IRI[]): Promise<readonly Reference[]>

} {

	const store = useStore();

	// the generic shape and template accept any draft: Collections<S> already admits only properties drafting
	// resources, a guarantee the compiler can't prove for a generic P

	const holder: Lazy<ResourceShape> = shape;
	const model: Template = { [field]: {} };

	return immutable({

		create(state) {

			return settle(store.create({ entry, shape: holder, model, state }), Conflict);

		},

		delete(entries) {

			const item = blueprint(holder, model);

			return Promise.all(some(entries).map(relative =>
				settle(store.delete({ entry: resolve(entry, relative), shape: item }), NotFound)
			));

		}

	});


	/**
	 * Rejects with a problem if an exchange fails or yields nothing.
	 *
	 * @param outcome The pending exchange
	 * @param status The status of the problem an exchange yielding nothing is rejected with
	 */
	function settle(outcome: Promise<Optional<Reference>>, status: number): Promise<Reference> {
		return outcome
			.then(value => value ?? Promise.reject(toProblem({ status })))
			.catch(issue => Promise.reject(toProblem(issue)));
	}

}
