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
 * Shared collection bindings.
 *
 * Binds a component to a collection held by the {@link "store"!Store shared store}, so that a view lists the items the
 * store holds and adds new ones without driving exchanges of its own.
 *
 * @module
 */

import type { ResourceShape } from "@metreeca/blue/resource";
import { type Draft, type Items, items, type Slice } from "@metreeca/blue/value";
import type { Lazy } from "@metreeca/core";
import { createRelay, type Relay } from "@metreeca/core/relay";
import { type IRI, resolve } from "@metreeca/core/resource";
import { Conflict } from "@metreeca/http";
import type { Problem } from "@metreeca/http/success";
import type { Reference } from "@metreeca/qest/state";
import { useEntry } from "./index.core.js";
import { useStore } from "./index.js";


/**
 * Binds a component to a collection held by the shared store.
 *
 * Retrieves the items a multi-valued property of a resource collects from the store offered by the innermost
 * enclosing {@link "store"!Store Store} context and keeps the component in step with them, so that a view lists what
 * the store holds and adds items without driving exchanges of its own: the collection is retrieved again whenever the
 * store signals a change to the resource holding it, whoever made it.
 *
 * A missing resource, a rejected creation and a failed exchange alike move the binding to its `error` state, as for
 * {@link "store/resource"!useResource useResource}; an operation the view called also rejects with the same
 * {@link Problem}, while a failed exchange no view called for is reported through the binding alone.
 *
 * The model is typed and held stable as for {@link "store/resource"!useResource useResource}, and may likewise be
 * fixed or replaced at runtime, a different one having the collection retrieved again.
 *
 * @typeParam S The shape describing the resource holding the collection
 * @typeParam T The model naming the property collecting the items and stating which values of each item are wanted
 *
 * @param options The resource holding the collection, the shape describing it and the model addressing the
 *     collection; read as the component first renders and whenever the store, the resource identifier or the model
 *     change
 *
 * @returns A {@link Relay} over the state of the binding, to be matched by a view with a handler for each: `blank`
 *     until the collection is first retrieved, `ready` with the items and the operation adding one, or `error` with
 *     the {@link Problem} that prevented either; a state is kept until the next one supersedes it, including while
 *     the collection is retrieved again after a change or on reload
 *
 * @throws {@link !Error Error} If called outside any {@link "store"!Store Store} context
 * @throws {@link !RangeError RangeError} If `entry` is invalid, or relative while the location is not hierarchical
 */
export function useCollection<S extends Lazy<ResourceShape>, T extends Slice<S, T>>({

	entry: relative,
	shape,
	model

}: {

	/**
	 * The identifier of the resource holding the collection, either absolute or relative to the current location.
	 */
	readonly entry: IRI

	/**
	 * The shape describing the resource holding the collection, possibly deferred to break definition cycles.
	 */
	readonly shape: S

	/**
	 * The model naming the multi-valued property collecting the items and stating, under that name, the template or
	 * projection narrowing each item to the values retrieved, and nothing wider: `{ members: { name: {} } }` lists
	 * the names of the items the `members` property collects.
	 *
	 * > [!WARNING]
	 * > Models are compared by reference: any new object, even with the same content, retrieves the collection
	 * > again. A model written inline, as in `useCollection({ …, model: { members: { name: {} } } })`, is a new
	 * > object on every render, and retrieves the collection on every render: declare it as a constant instead, or
	 * > keep it in state if it changes at runtime.
	 */
	readonly model: T


}): Relay<{

	/**
	 * The collection is being retrieved for the first time, with neither items nor an error to show.
	 */
	readonly blank: void

	/**
	 * The collection is retrieved, and stays on show while a change the store signals is retrieved again.
	 */
	readonly ready: {

		/**
		 * The items as the store currently holds them, narrowed to the values the model asks for.
		 */
		state: Items<S, T>

		/**
		 * Adds an item to the collection.
		 *
		 * @param state The new item, checked against the item shape; its identifier may be left for the store to assign
		 *
		 * @returns A promise resolving to the absolute identifier the store assigned to the new item, so that a view
		 *     can move there, the binding following the change as the store signals it; rejects with the
		 *     {@link Problem} the binding moves to `error` with, if the item already exists or the creation fails
		 */
		create(state: Draft<S, T>): Promise<Reference>

	}

	/**
	 * The last exchange with the store failed, whether retrieving the collection or adding an item to it.
	 */
	readonly error: {

		/**
		 * The problem describing the failure.
		 */
		readonly state: Problem

		/**
		 * Retrieves the collection again, the binding staying in `error` until the store answers.
		 *
		 * @returns A promise resolving once the collection is retrieved and the binding is `ready`; rejects with the
		 *     {@link Problem} the binding moves back to `error` with, if the resource is missing or the retrieval
		 *     fails
		 */
		reload(): Promise<void>

	}

}> {

	const store = useStore();
	const entry = resolve(location.href, relative);

	return createRelay(useEntry({

		store,
		entry,
		model,

		lookup: () => store.lookup({ entry, shape, model }).then(holder => holder && items(holder, model)),

		modify: settle => ({

			create: (state: Draft<S, T>) => settle(store.create({ entry, shape, model, state }), Conflict)

		})

	}));

}
