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
 * Binds the lenses of a screen to one collection held by the {@link "store"!Store shared store}, so that a list, its
 * facets and its counters show the same items, and a facet narrowing the collection narrows what every other lens on
 * the screen shows, with no wiring between the lenses themselves beyond the collection they are handed.
 *
 * @module
 */

import type { ResourceShape } from "@metreeca/blue/resource";
import type { Draft, State } from "@metreeca/blue/value";
import type { Eager, Lazy } from "@metreeca/core";
import { type IRI, resolve } from "@metreeca/core/resource";
import { Conflict } from "@metreeca/http";
import { type Problem, toProblem } from "@metreeca/http/success";
import type { Criteria, Template } from "@metreeca/qest/model";
import type { Reference } from "@metreeca/qest/state";
import { useModel } from "../model.js";
import { type CollectionState, createCollectionState, type CriteriaDelta } from "./collection.core.js";
import { useStore } from "./index.js";


/**
 * Resolves the collections a resource holds.
 *
 * Yields the names of the multi-valued properties of the resource, declared or inherited, ranging over resources: the
 * properties a screen may list and add items to. The bare `ResourceShape` resolves to any name, so that any property
 * is accepted where only a generic shape is known, as in code generic over the shape it binds to.
 *
 * @typeParam S The shape describing the resource holding the collections, possibly deferred to break definition cycles
 */
export type Collections<S extends Lazy<ResourceShape>> = ResourceShape extends Eager<S> ? string : {
	readonly [P in keyof State<S> & string]: string extends P ? never // index signatures name no property
		: Exclude<State<S>[P], undefined> extends readonly unknown[]
			? [Draft<S, { readonly [K in P]: {} }>] extends [never] ? never : P
			: never
}[keyof State<S> & string]

/**
 * Resolves the collection a resource holds, where it holds exactly one.
 *
 * Yields the single name in {@link Collections}, or `never` where the resource holds no collection of resources or
 * several of them, so that the collecting property may be omitted only where the shape settles it.
 *
 * @typeParam S The shape describing the resource holding the collection, possibly deferred to break definition cycles
 */
export type Sole<S extends Lazy<ResourceShape>> = Extract<{
	readonly [P in Collections<S>]: [Exclude<Collections<S>, P>] extends [never] ? P : never
}[Collections<S>], Collections<S>>


/**
 * Shared collection.
 *
 * The collection the lenses of a screen are handed, so that they show the same items: the resource and the property
 * holding it, the criteria fixed by the screen and the ones the reader narrows it by, as the {@link CollectionState}
 * describes them, with the operations revising the reader's criteria and adding items.
 *
 * Revising the criteria renders again the component that created the collection, handing the lenses a new collection
 * narrowed accordingly; the collection a render was handed keeps the criteria it was created with.
 *
 * @typeParam S The shape describing the resource holding the collection
 * @typeParam P The property of the resource collecting the items
 */
export interface Collection<S extends Lazy<ResourceShape>, P extends Collections<S> = Collections<S>> {

	/**
	 * The absolute identifier of the resource holding the collection.
	 */
	readonly entry: Reference

	/**
	 * The shape describing the resource holding the collection.
	 */
	readonly shape: S

	/**
	 * The multi-valued property of the resource collecting the items.
	 */
	readonly property: P

	/**
	 * The criteria fixed by the screen, bounding every retrieval a lens makes.
	 */
	readonly scope: Criteria

	/**
	 * The criteria the reader narrows the collection by.
	 */
	readonly criteria: Criteria


	/**
	 * Revises the reader's criteria, as {@link CollectionState.filter} does.
	 *
	 * @param criteria The criteria to merge into the current ones, a key set to `undefined` removing that criterion
	 *
	 * @throws {@link !TypeError TypeError} If `criteria` states anything other than narrowing criteria
	 */
	filter(criteria: CriteriaDelta): void

	/**
	 * Removes every criterion the reader set, leaving the {@link scope} in place.
	 */
	clear(): void

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

}


/**
 * Binds a screen to a collection held by the shared store.
 *
 * Creates the {@link Collection} the lenses of a screen share, held for the lifetime of the component: the component
 * renders again after every revision that changes the reader's criteria, and the lenses handed the collection follow
 * along. The collection is created again, and the reader's criteria start over, whenever the resource, the shape, the
 * collecting property or the scope change, so a screen showing another collection never keeps stale criteria.
 *
 * The collecting property may be left for the shape to settle, as
 * {@link "store/collection.core"!createCollectionState createCollectionState} does, and is typed against the shape:
 * only a collection of resources the shape holds is accepted, and omitting it fails to compile unless the shape holds
 * exactly one, so that the error reaches the author before it reaches the reader.
 *
 * @typeParam S The shape describing the resource holding the collection
 * @typeParam P The property collecting the items, inferred from `property` or, where omitted, from the shape
 *
 * @param options The collection to be shown and the criteria it starts from; `criteria` is read as the component
 *     first renders and whenever the collection is created again
 *
 * @returns The shared collection, along with the operation adding an item to it
 *
 * @throws {@link !Error Error} If called outside any {@link "store"!Store Store} context
 * @throws {@link !RangeError RangeError} If `entry` is invalid, or relative while the location is not hierarchical
 * @throws {@link !TypeError TypeError} If `property` is omitted and the shape holds no collection of resources, or
 *     several of them, or if `scope` or `criteria` state anything other than narrowing criteria
 */
export function useCollection<S extends Lazy<ResourceShape>, P extends Collections<S> = Sole<S>>({

	entry,
	shape,
	property,

	scope,
	criteria

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
	 * The multi-valued property collecting the items; required where the shape holds no collection of resources, or
	 * where it holds several of them and the screen has to say which of them it shows to the reader.
	 */
	readonly property?: P

	/**
	 * The criteria fixed by the screen, bounding every retrieval a lens makes; compared by content, so that it may be
	 * written inline without the collection being created again, and its criteria reset, on every render.
	 */
	readonly scope?: Criteria

	/**
	 * The reader's criteria the collection starts from.
	 */
	readonly criteria?: Criteria

} & ([Sole<S>] extends [never] ? { readonly property: P } : unknown)): Collection<S, P> {

	const store = useStore();
	const absolute = resolve(location.href, entry);

	const state = useModel(() => createCollectionState({ entry: absolute, shape, property, scope, criteria }), [
		absolute, shape, property, scope
	]);

	return {

		entry: state.entry,
		shape,
		property: state.property as P, // ;(cast) the property is P as given, or Sole<S> as inferred from the shape

		scope: state.scope,
		criteria: state.criteria,

		filter: state.filter,
		clear: state.clear,

		// the generic shape and template accept any draft: Collections<S> already admits only properties drafting
		// resources, a guarantee the compiler can't prove for a generic P

		create: draft => store.create<Lazy<ResourceShape>, Template>({

			entry: state.entry,
			shape,
			model: { [state.property]: {} },
			state: draft

		})
			.then(created => created ?? Promise.reject(toProblem({ status: Conflict })))
			.catch(issue => Promise.reject(toProblem(issue)))

	};

}
