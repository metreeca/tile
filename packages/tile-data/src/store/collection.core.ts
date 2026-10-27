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
 * Shared collection state.
 *
 * Holds what lenses showing the same collection agree on: which collection it is, and the criteria the reader narrows
 * it by. Lenses read the state to build their own retrievals and write the reader's criteria back through its
 * transitions, so that a facet narrowing the collection narrows what every other lens shows, counters and lists
 * alike, with no wiring between the lenses themselves beyond the collection they are all handed.
 *
 * @module
 */

import { getShapeTarget } from "@metreeca/blue/reference";
import { getShapeProperties, type ResourceShape } from "@metreeca/blue/resource";
import { getShapeBranches } from "@metreeca/blue/union";
import type { Draft, State } from "@metreeca/blue/value";
import { type Eager, error, type Identifier, type Lazy, type Optional } from "@metreeca/core";
import { createState } from "@metreeca/core/state";
import { equals } from "@metreeca/core/values";
import type { Criteria } from "@metreeca/qest/model";
import type { Reference } from "@metreeca/qest/state";


/**
 * Matches the keys of criteria narrowing a collection: bounds, keywords and value sets.
 */
const Narrowing = /^(?:<=?|>=?|~|\?|!)/;


//// !!! ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Resolves the collections a resource holds.
 *
 * Yields the names of the multi-valued properties of the resource, declared or inherited, ranging over resources: the
 * properties a lens may list and add items to. The bare `ResourceShape` resolves to any name, so that any property
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


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Shared collection.
 *
 * The collection a set of lenses shows, with the criteria narrowing it. Only narrowing criteria are held:
 * bounds (`<`, `>`, `<=`, `>=`), keywords (`~`) and value sets (`?`, `!`). Sort order (`^`) and focus (`+`) arrange
 * what a view shows rather than which items the collection holds, so each view keeps its own.
 *
 * @typeParam S The shape describing the resource holding the collection
 * @typeParam P The property of the resource collecting the items
 */
export interface Collection<S extends Lazy<ResourceShape>, P extends Collections<S> = Collections<S>> {

	/**
	 * The collection the lenses show.
	 */
	readonly target: {

		/**
		 * The absolute identifier of the resource holding the collection.
		 */
		readonly entry: Reference

		/**
		 * The shape describing the resource holding the collection, possibly deferred to break definition cycles.
		 */
		readonly shape: S

		/**
		 * The multi-valued property of the resource collecting the items.
		 */
		readonly field: P

	}


	/**
	 * The criteria the reader narrows the collection by.
	 */
	readonly criteria: Criteria


	/**
	 * Revises the reader's criteria.
	 *
	 * @param criteria The criteria to merge into the current ones, a key set to `undefined` removing that criterion
	 *
	 * @returns The collection narrowed by the revised criteria, or the same collection if nothing changes
	 *
	 * @throws {@link !TypeError TypeError} If `criteria` states anything other than narrowing criteria
	 */
	filter(criteria: Partial<Criteria>): this

	/**
	 * Removes every criterion the reader set.
	 *
	 * @returns The collection narrowed by no criterion, or the same collection if the reader set none
	 */
	clear(): this

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a shared collection.
 *
 * The collecting property may be left for the shape to settle: it is taken to be the only multi-valued property of
 * the resource ranging over resources, inherited ones included, where a union range counts only if every branch
 * reaches a resource, so a collection mixing resources and literals is never taken for one. The property is typed
 * against the shape: only a collection of resources the shape holds is accepted.
 *
 * @typeParam S The shape describing the resource holding the collection
 * @typeParam P The property collecting the items, inferred from `field` or, where omitted, from the shape
 *
 * @param options The collection to be shown and the criteria it starts from
 *
 * @returns A collection narrowed by the reader's `criteria`
 *
 * @throws {@link !TypeError TypeError} If `field` is omitted and the shape holds no collection of resources, or
 *     several of them, or if `criteria` states anything other than narrowing criteria
 */
export function createCollection<S extends Lazy<ResourceShape>, P extends Collections<S> = Sole<S>>({

	entry,
	shape,
	field,

	criteria = {}

}: {

	/**
	 * The absolute identifier of the resource holding the collection.
	 */
	readonly entry: Reference

	/**
	 * The shape describing the resource holding the collection, possibly deferred to break definition cycles.
	 */
	readonly shape: S

	/**
	 * The multi-valued property collecting the items; required where the shape holds no collection of resources or
	 * several of them.
	 */
	readonly field?: Optional<P>

	/**
	 * The reader's criteria the collection starts from.
	 */
	readonly criteria?: Optional<Criteria>

}): Collection<S, P> {

	return createState<Collection<S, P>>({

		target: {
			entry,
			shape,
			field: field ?? collection(shape) as P // ;(cast) the field inferred from the shape is Sole<S>, P's default
		},

		criteria: narrowing(criteria),

		filter(criteria: Partial<Criteria>) {

			const revised = Object.fromEntries(Object.entries({ ...this.criteria, ...narrowing(criteria) })
				.filter(([, value]) => value !== undefined)
			) as Criteria; // ;(cast) fromEntries widens keys to strings: they are criteria keys narrowing() checked

			return equals(revised, this.criteria) ? {} : { criteria: revised };

		},

		clear() {
			return Object.keys(this.criteria).length === 0 ? {} : { criteria: {} };
		}

	});


	function collection(shape: Lazy<ResourceShape>): Identifier {

		const [name, ...others] = Object.entries(getShapeProperties(shape))
			.filter(([, member]) => member.kind === "property"
				&& member.range.maxCount !== 1
				&& getShapeBranches(member.range.shape).every(branch => getShapeTarget(branch) !== undefined)
			)
			.map(([name]) => name);

		return name === undefined ? error(new TypeError("missing collection field"))
			: others.length > 0 ? error(new TypeError(`ambiguous collection field [${[name, ...others].join(", ")}]`))
				: name;

	}

	function narrowing<T extends object>(criteria: T): T {

		const illegal = Object.keys(criteria).filter(key => !Narrowing.test(key));

		return illegal.length > 0
			? error(new TypeError(`illegal collection criteria <${illegal.join(", ")}>`))
			: criteria;

	}

}
