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
 * Binds a set of lenses to one collection held by the {@link "index"!Store shared store}, so that a list, its facets
 * and its counters show the same items, and a facet narrowing the collection narrows what every other lens shows,
 * with no wiring between the lenses themselves beyond the collection they are handed.
 *
 * @module collection
 */

import type { ResourceShape } from "@metreeca/blue/resource";
import { useModel } from "@metreeca/clay/model";
import type { Lazy } from "@metreeca/core";
import type { IRI } from "@metreeca/core/resource";
import { equals } from "@metreeca/core/values";
import type { Criteria } from "@metreeca/qest/model";
import { useEffect, useState } from "preact/hooks";
import { type Collection, type Collections, createCollection, getCollection, type Sole } from "./collection.core.js";
import { resolveTarget } from "../index.core.js";

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
 * {@link "collection.core"!createCollection createCollection} does, and is typed against the shape: only a
 * collection of resources the shape holds is accepted, and omitting it fails to compile unless the shape holds exactly
 * one, so that the error reaches the author at build time rather than the reader at run time.
 *
 * The reader's criteria survive reloads and navigation where the page keeps them in the location, handing them over as
 * the starting criteria and taking them back as the reader revises them, once per catalogue page and with no wiring:
 *
 * ```tsx
 * const [query, setQuery] = useQuery();
 *
 * const courses = useCollection({ entry: "/courses/", shape: Course, query, onChange: setQuery });
 * ```
 *
 * @typeParam S The shape describing the resource holding the collection
 * @typeParam P The property collecting the items, inferred from `field` or, where omitted, from the shape
 *
 * @param options The collection to be shown and the criteria it starts from; `query` is read on the first render and
 *     whenever the collection is created again, as for another resource, shape, collecting property or scope
 *
 * @returns The shared collection, as it stands for this render
 *
 * @throws {@link !RangeError RangeError} If `entry` is invalid, or relative while the location is not hierarchical
 * @throws {@link !TypeError TypeError} If `field` is omitted and the shape holds no collection of resources, or
 *     several of them, or if `scope` or `query` state anything other than narrowing criteria
 */
export function useCollection<S extends Lazy<ResourceShape>, P extends Collections<S> = Sole<S>>({

	entry: relative,
	shape,
	field,

	scope,
	query,

	onChange

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
	 * The criteria fixing which items the collection holds at all, beyond the reach of the reader: never cleared nor
	 * handed to `onChange`, and taking effect again whenever they change. Options matched against values the shape
	 * types as references may be relative to the current location, and are handed over resolved.
	 */
	readonly scope?: Criteria

	/**
	 * The reader's criteria the collection starts from, read only as it is created: criteria handed over later, as
	 * those written back by `onChange`, take effect only once the collection is created again. Options matched against
	 * values the shape types as references may be relative to the current location, and are handed over resolved.
	 */
	readonly query?: Criteria


	/**
	 * Takes the reader's criteria whenever they change, so that a page may keep them wherever it likes, as in the
	 * location through {@link "query"!useQuery useQuery}; never called with the criteria the collection is
	 * created with, which the page handed over itself and so already keeps wherever it took them from.
	 */
	readonly onChange?: (criteria: Criteria) => void

} & ([Sole<S>] extends [never] ? { readonly field: P } : unknown)): Collection<S, P> {

	const target = { entry: relative, shape, field: field ?? getCollection(shape) };

	const { entry, query: $scope } = resolveTarget({ ...target, query: scope ?? {} });
	const { query: $query } = resolveTarget({ ...target, query: query ?? {} });

	const collection = useModel(() => createCollection<S, P>({ entry, shape, field, scope: $scope, query: $query }),
		[entry, shape, field, $scope]
	);

	// the criteria last handed over, from those the collection is created with, so that only changes reach onChange

	const [notified, setNotified] = useState(collection.query);

	useEffect(() => {

		if ( !equals(notified, collection.query) ) {
			setNotified(collection.query);
			onChange?.(collection.query);
		}

	}, [collection.query]);

	return collection;

}
