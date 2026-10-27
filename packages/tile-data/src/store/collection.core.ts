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
 * Holds what the lenses of a screen agree on about the collection they show: which collection it is, the criteria
 * fixed by the screen, and the criteria the reader narrows it by. Lenses read the state to build their own retrievals
 * and write the reader's criteria back through its transitions, so that a facet narrowing the collection narrows what
 * every other lens shows, counters and lists alike, with no wiring between the lenses themselves.
 *
 * @module
 */

import { getShapeTarget } from "@metreeca/blue/reference";
import { getShapeProperties, type ResourceShape } from "@metreeca/blue/resource";
import { getShapeBranches } from "@metreeca/blue/union";
import { error, type Lazy } from "@metreeca/core";
import { createState } from "@metreeca/core/state";
import { equals } from "@metreeca/core/values";
import type { Criteria } from "@metreeca/qest/model";
import type { Reference } from "@metreeca/qest/state";


/**
 * Collection criteria being revised.
 *
 * States the criteria to merge into the reader's ones, a key set to `undefined` removing that criterion.
 */
export type CriteriaDelta = {

	readonly [K in keyof Criteria]?: undefined | Criteria[K]

}

/**
 * Shared collection state.
 *
 * The collection the lenses of a screen show, with the criteria narrowing it. Only narrowing criteria are held:
 * bounds (`<`, `>`, `<=`, `>=`), keywords (`~`) and value sets (`?`, `!`). Sort order (`^`) and focus (`+`) arrange
 * what a view shows rather than which items the collection holds, so each view keeps its own.
 */
export interface CollectionState {

	/**
	 * The absolute identifier of the resource holding the collection.
	 */
	readonly entry: Reference

	/**
	 * The multi-valued property of the resource collecting the items.
	 */
	readonly property: string

	/**
	 * The criteria fixed by the screen, bounding every retrieval a lens makes, the counts a facet offers included.
	 *
	 * Never revised by the reader: {@link clear} leaves them in place.
	 */
	readonly scope: Criteria

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
	filter(criteria: CriteriaDelta): this

	/**
	 * Removes every criterion the reader set, leaving the {@link scope} in place.
	 *
	 * @returns The collection under its scope alone, or the same collection if the reader set no criterion
	 */
	clear(): this

}


/**
 * Creates a shared collection state.
 *
 * The collecting property may be left for the shape to settle: it is taken to be the only multi-valued property of
 * the resource ranging over resources, inherited ones included, where a union range counts only if every branch
 * reaches a resource, so a collection mixing resources and literals is never taken for one.
 *
 * @param options The collection to be shown and the criteria it starts from
 *
 * @returns A collection narrowed by `scope` and by the reader's `criteria`
 *
 * @throws {@link !TypeError TypeError} If `property` is omitted and the shape holds no collection of resources, or
 *     several of them, or if `scope` or `criteria` state anything other than narrowing criteria
 */
export function createCollectionState({

	entry,
	shape,
	property,

	scope = {},
	criteria = {}

}: {

	/**
	 * The absolute identifier of the resource holding the collection.
	 */
	readonly entry: Reference

	/**
	 * The shape describing the resource holding the collection, possibly deferred to break definition cycles.
	 */
	readonly shape: Lazy<ResourceShape>

	/**
	 * The multi-valued property collecting the items; required where the shape holds no collection of resources or
	 * several of them, and taken as given, without checking it against the shape.
	 */
	readonly property?: string

	/**
	 * The criteria fixed by the screen.
	 */
	readonly scope?: Criteria

	/**
	 * The reader's criteria the collection starts from.
	 */
	readonly criteria?: Criteria

}): CollectionState {
	return createState<CollectionState>({

		entry,
		property: property ?? collection(shape),

		scope: narrowing(scope),
		criteria: narrowing(criteria),

		filter(criteria: CriteriaDelta) {

			const revised = Object.fromEntries(Object.entries({ ...this.criteria, ...narrowing(criteria) })
				.filter(([, value]) => value !== undefined)
			) as Criteria; // ;(cast) fromEntries widens keys to strings: they are criteria keys narrowing() checked

			return equals(revised, this.criteria) ? {} : { criteria: revised };

		},

		clear() {
			return Object.keys(this.criteria).length === 0 ? {} : { criteria: {} };
		}

	});
}


//// Helpers ///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Matches the keys of criteria narrowing a collection: bounds, keywords and value sets.
 */
const Narrowing = /^(?:<=?|>=?|~|\?|!)/;


/**
 * Identifies the collection a resource holds.
 *
 * Kept local rather than shared through `@metreeca/blue`: each consumer settles the collection by its own rule, as
 * `@metreeca/gate` does with two different ones, so a shared accessor was declined (metreeca/blue#36). This one takes
 * collections of resources alone, since a screen lists and creates items that are resources.
 *
 * @param shape The shape describing the resource holding the collection
 *
 * @returns The name of the only multi-valued property ranging over resources, every branch of a union range reaching
 *     one, with inherited properties counted alike
 *
 * @throws {@link !TypeError TypeError} If the shape holds no such property, or several of them
 */
function collection(shape: Lazy<ResourceShape>): string {

	const [name, ...others] = Object.entries(getShapeProperties(shape))
		.filter(([, member]) => member.kind === "property"
			&& member.range.maxCount !== 1
			&& getShapeBranches(member.range.shape).every(branch => getShapeTarget(branch) !== undefined)
		)
		.map(([name]) => name);

	return name === undefined ? error(new TypeError("missing collection property"))
		: others.length > 0 ? error(new TypeError(`ambiguous collection property [${[name, ...others].join(", ")}]`))
			: name;

}

/**
 * Checks that criteria only narrow a collection.
 *
 * @param criteria The criteria to be checked
 *
 * @returns `criteria`
 *
 * @throws {@link !TypeError TypeError} If `criteria` state anything other than narrowing criteria, such as a sort order
 *     or a focus, which arrange what a view shows
 */
function narrowing<T extends object>(criteria: T): T {

	const illegal = Object.keys(criteria).filter(key => !Narrowing.test(key));

	return illegal.length > 0
		? error(new TypeError(`illegal collection criteria <${illegal.join(", ")}>`))
		: criteria;

}
