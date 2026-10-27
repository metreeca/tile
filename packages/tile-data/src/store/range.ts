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
 * Shared collection range.
 *
 * Binds a range control to a shared collection, so that it shows the lowest and highest values the items hold for an
 * expression and narrows every lens over the collection to the items whose values fall between the bounds it sets.
 *
 * @module
 */

import type { ResourceShape } from "@metreeca/blue/resource";
import { items } from "@metreeca/blue/value";
import { isObject, type Lazy, opt, type Optional } from "@metreeca/core";
import { createRelay, type Relay } from "@metreeca/core/relay";
import type { Problem } from "@metreeca/http/success";
import type { Criteria, Expression, Template } from "@metreeca/qest/model";
import { isLiteral, type Literal } from "@metreeca/qest/state";
import type { Collection, Collections } from "./collection.core.js";
import { useEntry } from "./index.core.js";
import { useStore } from "./index.js";


/**
 * Shared collection range cases.
 */
export type RangeCases = {

	/**
	 * The lowest and highest values are being retrieved for the first time.
	 */
	readonly blank: void

	/**
	 * The lowest and highest values are retrieved; they stay on show while they are retrieved again under new
	 * criteria, so that a range control never blanks out as the reader narrows the collection.
	 */
	readonly ready: {

		/**
		 * The lowest and highest values the items let through by the collection criteria hold for the expression,
		 * both missing where no item holds one, as in an empty collection or one whose items lack the value.
		 */
		readonly state: {

			readonly min: Optional<Literal>
			readonly max: Optional<Literal>

		}

		/**
		 * The lower bound narrowing the collection, if one is set.
		 */
		readonly lower: Optional<Literal>

		/**
		 * The upper bound narrowing the collection, if one is set.
		 */
		readonly upper: Optional<Literal>


		/**
		 * Revises the bounds narrowing the collection.
		 *
		 * @param bounds The bounds to be revised: a bound left `undefined` stays as it is, a bound set to `null` is
		 *     removed, and any other value replaces the current bound, the other criteria staying in place
		 */
		narrow(bounds: {

			readonly lower?: null | Literal
			readonly upper?: null | Literal

		}): void

		/**
		 * Removes both bounds, leaving the other criteria narrowing the collection in place.
		 */
		clear(): void

	}

	/**
	 * The last retrieval failed.
	 */
	readonly error: {

		/**
		 * The problem describing the failure.
		 */
		readonly state: Problem

		/**
		 * Retrieves the lowest and highest values again.
		 *
		 * @returns A promise resolving once the values are retrieved; rejects with the {@link Problem} describing the
		 *     failure, if the retrieval fails again, the binding then staying in `error` with it
		 */
		reload(): Promise<void>

	}

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Binds a component to a range over a shared collection.
 *
 * Retrieves through the store offered by the innermost enclosing {@link "store"!Store Store} context the lowest and
 * highest values the items let through by the collection criteria hold for `expression`, its own bounds included, and
 * retrieves them again whenever the criteria change or the store signals a change to the collection.
 *
 * @typeParam S The shape describing the resource holding the collection
 * @typeParam P The property of the resource collecting the items
 *
 * @param collection The collection narrowed, as handed by {@link "store/collection"!useCollection useCollection}
 * @param expression The expression the bounds apply to, as a property path possibly behind a transform pipe: `year`
 *
 * @returns A {@link Relay} over the {@link RangeCases} of the binding
 *
 * @throws {@link !Error Error} If called outside any {@link "store"!Store Store} context
 */
export function useRange<S extends Lazy<ResourceShape>, P extends Collections<S>>(

	collection: Collection<S, P>,
	expression: Expression

): Relay<RangeCases> {

	const store = useStore();

	const { target: { entry, shape, field }, criteria } = collection;

	const lower: `>=${Expression}` = `>=${expression}`;
	const upper: `<=${Expression}` = `<=${expression}`;

	const holder: Lazy<ResourceShape> = shape; // the generic shape accepts any model: the range is typed by the signature
	const model: Template = {
		[field]: {
			...criteria,
			[`min=min:${expression}`]: {},
			[`max=max:${expression}`]: {}
		}
	};

	return createRelay(useEntry({

		store,
		entry,
		model,

		lookup: () => store.lookup({ entry, shape: holder, model })
			.then(match => opt(match, match => bounds(items(match, model)))),

		modify: () => ({

			lower: criteria[lower],
			upper: criteria[upper],

			narrow: (bounds: { readonly lower?: null | Literal, readonly upper?: null | Literal }) => void collection.filter({
				...(bounds.lower === undefined ? {} : { [lower]: bounds.lower ?? undefined }),
				...(bounds.upper === undefined ? {} : { [upper]: bounds.upper ?? undefined })
			} as Partial<Criteria>), // ;(cast) computed keys widen to string

			clear: () => void collection.filter({ [lower]: undefined, [upper]: undefined } as Partial<Criteria>)

		})

	}));

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Reads the lowest and highest values off the single row retrieved for them.
 *
 * @param items The rows retrieved for the range
 *
 * @returns The literals carried by the single row, each missing if the row carries none
 */
function bounds(items: readonly unknown[]): { readonly min: Optional<Literal>, readonly max: Optional<Literal> } {
	return opt(items[0], item => isObject(item) ? {
		min: isLiteral(item.min) ? item.min : undefined,
		max: isLiteral(item.max) ? item.max : undefined
	} : undefined) ?? { min: undefined, max: undefined };
}
