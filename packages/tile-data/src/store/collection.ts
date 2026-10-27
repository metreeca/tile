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
 * Binds a set of lenses to one collection held by the {@link "store"!Store shared store}, so that a list, its facets
 * and its counters show the same items, and a facet narrowing the collection narrows what every other lens shows,
 * with no wiring between the lenses themselves beyond the collection they are handed.
 *
 * @module
 */

import type { ResourceShape } from "@metreeca/blue/resource";
import type { Lazy } from "@metreeca/core";
import { type IRI, resolve } from "@metreeca/core/resource";
import type { Criteria } from "@metreeca/qest/model";
import { useModel } from "../model.js";
import { type Collection, type Collections, createCollection, type Sole } from "./collection.core.js";

export type { Collection, Collections, Sole } from "./collection.core.js";


/**
 * Binds a component to a collection held by the shared store.
 *
 * Creates the {@link Collection} the lenses rendered by the component share, held for the lifetime of the component:
 * the component renders again after every revision that changes the reader's criteria, and the lenses handed the
 * collection follow along. The collection is created again, and the reader's criteria start over, whenever the
 * resource, the shape, the collecting property or the scope change, so that a component moving on to another
 * collection never carries over the criteria the reader set on the previous one, which may not even apply to it.
 *
 * The collecting property may be left for the shape to settle, as
 * {@link "store/collection.core"!createCollection createCollection} does, and is typed against the shape: only a
 * collection of resources the shape holds is accepted, and omitting it fails to compile unless the shape holds exactly
 * one, so that the error reaches the author before it reaches the reader.
 *
 * @typeParam S The shape describing the resource holding the collection
 * @typeParam P The property collecting the items, inferred from `field` or, where omitted, from the shape
 *
 * @param options The collection to be shown and the criteria it starts from; `sieve` is read as the component first
 *     renders and whenever the collection is created again
 *
 * @returns The shared collection, as it stands for this render
 *
 * @throws {@link !RangeError RangeError} If `entry` is invalid, or relative while the location is not hierarchical
 * @throws {@link !TypeError TypeError} If `field` is omitted and the shape holds no collection of resources, or
 *     several of them, or if `scope` or `sieve` state anything other than narrowing criteria
 */
export function useCollection<S extends Lazy<ResourceShape>, P extends Collections<S> = Sole<S>>({

	entry: relative,
	shape,
	field,

	scope,
	sieve

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
	 * where it holds several of them and the component has to say which of them it shows to the reader.
	 */
	readonly field?: P

	/**
	 * The criteria fixed for the lifetime of the collection, bounding every retrieval a lens makes; compared by
	 * content, so that it may be written inline at the call site without the collection being created again on every
	 * render, which would otherwise reset the criteria the reader has set at each render.
	 */
	readonly scope?: Criteria

	/**
	 * The reader's criteria the collection starts from.
	 */
	readonly sieve?: Criteria

} & ([Sole<S>] extends [never] ? { readonly field: P } : unknown)): Collection<S, P> {

	const entry = resolve(location.href, relative);

	return useModel(() => createCollection<S, P>({ entry, shape, field, scope, sieve }), [entry, shape, field, scope]);

}
