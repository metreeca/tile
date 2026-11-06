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
 * Shared collection tally.
 *
 * Binds a facet to a shared collection, so that it lists the values the items hold for an expression with the number
 * of items holding each, and narrows every lens over the collection to the items holding the values the reader picks.
 *
 * @module store/tally
 */

import type { ResourceShape } from "@metreeca/blue/resource";
import { getShapeBranches } from "@metreeca/blue/union";
import { effective, items, type Range } from "@metreeca/blue/value";
import { useModel } from "@metreeca/clay/model";
import { error, isArray, isNumber, isObject, isString, type Lazy, opt, type Optional } from "@metreeca/core";
import { ascending, by } from "@metreeca/core/order";
import { createRelay, type Option as Outcome, type Relay } from "@metreeca/core/relay";
import { equals, immutable } from "@metreeca/core/values";
import type { Problem } from "@metreeca/http/success";
import {
	type Criteria,
	decodeProbe,
	type Expression,
	isOption,
	type Option,
	type Template
} from "@metreeca/qest/model";
import type { Collection, Collections } from "./collection.core.js";
import { useEntry } from "./index.core.js";
import { useStore } from "./index.js";
import { createTally } from "./tally.core.js";


/**
 * Shared collection tally cases.
 */
export type TallyCases = {

	/**
	 * The options are being retrieved for the first time.
	 */
	readonly blank: void

	/**
	 * The options are retrieved; they stay on show while they are retrieved again under new criteria.
	 */
	readonly ready: {

		/**
		 * The options on show. Selected options come first, then the others. In each set, the values the other
		 * criteria let through lead by decreasing count, ties ordered by label for resources and by value for
		 * literals. The values left out follow with no items, in the same order, the option for unvalued items first.
		 */
		readonly state: readonly TallyBucket[]

		/**
		 * The keywords the options on show are narrowed by.
		 */
		readonly keywords: string

		/**
		 * The index of the first option on show.
		 */
		readonly offset: number

		/**
		 * The number of options on show, or `0` where they are all shown.
		 */
		readonly limit: number

		/**
		 * Whether more options follow the ones on show.
		 */
		readonly more: boolean


		/**
		 * Narrows the options on show by keywords.
		 *
		 * @param keywords The keywords replacing the current ones; empty keywords show the options from the first one
		 *     again, while any other keywords leave the page on show standing where it was
		 */
		search(keywords: string): void

		/**
		 * Moves the options on show.
		 *
		 * @param offset The index of the first option on show; a negative index stands for the first option
		 */
		seek(offset: number): void

		/**
		 * Resizes the options on show.
		 *
		 * @param limit The number of options on show, or `0` to show them all; a negative number stands for `0`
		 */
		resize(limit: number): void

		/**
		 * Shows one more batch of options, as many as the binding was created to show; offered while more options
		 * follow the ones on show, so that a view closes the list with a trigger handed `load` for as long as it is
		 * offered:
		 *
		 * ```tsx
		 * {tally({ ready: ({ load }) => load && <More onLoad={load}/> })}
		 * ```
		 */
		load?(): void

		/**
		 * Selects or deselects a value, narrowing the collection to the items holding any of the selected ones.
		 *
		 * @param value The value of the option, as {@link TallyBucket.value} states it
		 * @param selected Whether the value is to be selected
		 */
		select(value: Option, selected: boolean): void

		/**
		 * Deselects every value and shows the options as they stood when first retrieved, with no keywords and from the
		 * first one, leaving the other criteria narrowing the collection in place, as the other facets set them.
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
		 * Retrieves the options again.
		 *
		 * @returns A promise resolving once the options are retrieved; rejects with the {@link Problem} describing the
		 *     failure, if the retrieval fails again, the binding then staying in `error` with it
		 */
		reload(): Promise<void>

	}

}

/**
 * Collection tally bucket.
 */
export type TallyBucket = {

	/**
	 * Whether the value narrows the collection.
	 */
	readonly selected: boolean

	/**
	 * The value the items hold for the expression, as {@link TallyCases} `select` takes it: the literal itself, the
	 * identifier of the resource, or `null` for the items holding none of them, which a reader may select as well.
	 */
	readonly value: Option

	/**
	 * The name the value is shown by: the literal as text or the label of the resource; absent only for `null`, which
	 * the presenting widget names itself, as no value stands behind it to supply a name of its own.
	 */
	readonly label?: string

	/**
	 * The number of items holding the value, under the collection criteria other than the options' own.
	 */
	readonly count: number

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Binds a component to the tally of a shared collection.
 *
 * Retrieves through the store offered by the innermost enclosing {@link "store"!Store Store} context the values the
 * items hold for `expression` and the number of items holding each, twice: under no criteria, so that the list of
 * values stays stable as other facets narrow the collection, and under the collection criteria other than its own,
 * for the counts. Selected values are kept on top of both, whatever the keywords and the page on show.
 *
 * The expression reaches either literals, shown, searched and ordered as they stand, or linked resources, shown,
 * searched and ordered by the label the caller names; choosing a target the shape admits as a facet is the caller's.
 *
 * @typeParam S The shape describing the resource holding the collection
 * @typeParam P The property of the resource collecting the items
 *
 * @param collection The collection narrowed, as handed by {@link "store/collection"!useCollection useCollection}
 * @param expression The expression the options are values of, as a property path possibly behind a transform pipe, as
 *     in `university` or `year:released`, relative to the items of the collection
 * @param options The label of resource options and the number of options on show, all of them where omitted or zero
 *
 * @returns A {@link Relay} over the {@link TallyCases} of the binding
 *
 * @throws {@link !Error Error} If called outside any {@link "store"!Store Store} context
 * @throws {@link !Error Error} If `expression` or `label` is malformed
 * @throws {@link !RangeError RangeError} If `expression` reaches no value, literals mixed with resources, nested
 *     resources, or linked resources with `label` omitted; or if `label` reaches anything but exactly one text
 */
export function useTally<S extends Lazy<ResourceShape>, P extends Collections<S>>(

	collection: Collection<S, P>,
	expression: Expression,

	{

		label,
		size

	}: {

		/**
		 * The expression naming resource options, relative to the resources themselves, as in `name` or `lower:title`:
		 * exactly one text per resource, possibly localised, that options are shown, searched and ordered by; required
		 * where `expression` reaches linked resources, and ignored where it reaches literals.
		 */
		readonly label?: Expression

		/**
		 * The number of options on show, or `0` to show them all.
		 *
		 * @defaultValue 0
		 */
		readonly size?: number

	} = {}

): Relay<TallyCases> {

	const store = useStore();

	const { target: { entry, shape, field }, scope, query: criteria } = collection;

	const naming = resolveNaming(shape, field, expression, label);
	const text = naming ?? expression;

	const key: `?${Expression}` = `?${expression}`;

	const options = useModel(() => createTally({ size }), [entry, field, expression, size]);

	const selected = values(criteria[key]);
	const others = Object.fromEntries(Object.entries(criteria).filter(([criterion]) => criterion !== key));

	const specs = {

		[`value=${expression}`]: {},
		...(naming ? { [`label=${naming}`]: {} } : {}),
		"count=count:": {},

		...(options.keywords ? { [`~${text}`]: options.keywords } : {}),

		"^count:": -1,
		[`^${text}`]: 2,
		...(selected.length > 0 ? { [`+${expression}`]: selected } : {})

	};

	const baseline = useBuckets({ ...scope, ...specs });
	const matching = useBuckets({ ...others, ...scope, ...specs });

	return createRelay(baseline<Outcome<TallyCases>>({

		blank: () => ({ blank: undefined }),
		error: ({ state }) => ({ error: { state, reload } }),

		ready: ({ state: base }) => matching<Outcome<TallyCases>>({

			blank: () => ({ blank: undefined }),
			error: ({ state }) => ({ error: { state, reload } }),

			ready: ({ state: match }) => ready(merge(base, match))

		})

	}));


	/**
	 * Binds the options on show the store holds under a set of criteria, retrieved batch by batch.
	 *
	 * @param slot The criteria and the bindings the options are retrieved under
	 */
	function useBuckets(slot: object) {

		return createRelay(useEntry({

			store,
			entry,
			model: { [field]: { ...slot, "@": options.offset, "#": options.limit } }, // the options on show

			lookup: () => Promise.all(batches().map(batch => retrieve({ ...slot, ...batch })))
				.then(rows => rows.every(rows => rows !== undefined) ? rows.flat() : undefined),

			modify: () => ({})

		}));

	}

	/**
	 * Slices the options on show into batches of the facet size, each retrieved by a request of its own, so no
	 * request outgrows the result set a store serves at once; the last one reaches one option past the options on
	 * show, to tell whether more follow.
	 */
	function batches(): readonly { readonly "@": number, readonly "#": number }[] {

		const step = size !== undefined && size > 0 ? size : options.limit;
		const count = options.limit > 0 ? Math.ceil(options.limit/step) : 0;

		return count === 0 ? [{ "@": options.offset, "#": 0 }] : Array.from({ length: count }, (_, index) => ({
			"@": options.offset+index*step,
			"#": Math.min(step, options.limit-index*step)+(index === count-1 ? 1 : 0)
		}));

	}

	/**
	 * Retrieves the options the store holds under a set of criteria and bindings.
	 *
	 * The generic shape and template accept any model: the options are typed by the signature instead.
	 *
	 * @param slot The criteria and the bindings the options are retrieved under, a batch of them included
	 */
	function retrieve(slot: object): Promise<Optional<readonly Row[]>> {

		const holder: Lazy<ResourceShape> = shape;
		const model: Template = { [field]: slot };

		return store.lookup({ entry, shape: holder, model })
			.then(match => opt(match, match => items(match, model).flatMap(row)));

	}

	/**
	 * Retrieves the options again under both sets of criteria, settling the ones that failed.
	 */
	function reload(): Promise<void> {
		return Promise.all([baseline, matching].map(binding =>
			binding({ error: ({ reload }) => reload() }) ?? Promise.resolve()
		)).then(() => {});
	}

	/**
	 * Lists the options on show, in the order {@link TallyCases} `ready` states for them. The options the other
	 * criteria leave out are taken from the retrieval under no criteria, and count no items.
	 */
	function merge(base: readonly Row[], match: readonly Row[]): readonly TallyBucket[] {

		const tagged = (row: Row): TallyBucket => ({
			...row,
			selected: selected.some(value => equals(value, row.value))
		});

		const ranked = by(({ value, label }: Row) => naming ? label : value, ascending);

		const matched = match.map(tagged);
		const missing = base
			.filter(({ value }) => !match.some(row => equals(row.value, value)))
			.sort(ranked) // sorts the fresh array filter() returns, as toSorted() is beyond the ES2022 library
			.map(row => tagged({ ...row, count: 0 }));

		return [
			...matched.filter(({ selected }) => selected),
			...missing.filter(({ selected }) => selected),
			...matched.filter(({ selected }) => !selected),
			...missing.filter(({ selected }) => !selected)
		];

	}

	function ready(buckets: readonly TallyBucket[]): Outcome<TallyCases> {
		return immutable({
			ready: {

				state: options.limit > 0 ? buckets.slice(0, options.limit) : buckets,

				keywords: options.keywords,
				offset: options.offset,
				limit: options.limit,
				more: options.limit > 0 && buckets.length > options.limit,

				search: (keywords: string) => void options.search(keywords),
				seek: (offset: number) => void options.seek(offset),
				resize: (limit: number) => void options.resize(limit),

				...(options.limit > 0 && buckets.length > options.limit ? { load: () => void options.load() } : {}),

				select: (value: Option, selected: boolean) => void select(value, selected),

				clear: () => {
					options.reset();
					void select(undefined, false);
				}

			}
		});
	}

	/**
	 * Revises the selected values.
	 *
	 * @param value The value to be selected or deselected, or `undefined` to deselect every value
	 * @param selection Whether `value` is to be selected
	 */
	function select(value: Optional<Option>, selection: boolean) {

		const revised = value === undefined ? [] : [
			...selected.filter(current => !equals(current, value)),
			...(selection ? [value] : [])
		];

		// ;(cast) computed keys widen to string

		return collection.filter({ [key]: revised.length > 0 ? revised : undefined } as Partial<Criteria>);

	}

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Collection option as retrieved, before it is checked against the selected values.
 */
type Row = Omit<TallyBucket, "selected">

/**
 * Reads the selected values off the criterion stating them.
 *
 * @param options The criterion stating the selected values, if any
 *
 * @returns The selected values, a single one included, and none for a localised option set
 */
function values(options: unknown): readonly Option[] {
	return isArray(options) ? options.filter(isOption) : isOption(options) ? [options] : [];
}

/**
 * Reads an option off a row retrieved for it.
 *
 * A row stating no value at all stands for the items holding none, as a store hands that group over.
 *
 * @param item The row retrieved for an option
 *
 * @returns The option the row states, with a non-negative count, or nothing if the row states no option
 */
function row(item: unknown): readonly Row[] {

	const value = isObject(item) ? item.value ?? null : undefined;

	return isObject(item) && isOption(value) ? [{
		value,
		...(value === null ? {} : { label: isString(item.label) ? item.label : String(value) }),
		count: isNumber(item.count) && item.count >= 0 ? item.count : 0
	}] : [];

}

/**
 * Resolves the expression naming resource options.
 *
 * @param shape The shape describing the resource holding the collection
 * @param field The property of the resource collecting the items
 * @param expression The expression the options are values of, relative to the items
 * @param label The expression naming resource options, relative to the resources
 *
 * @returns The expression naming resource options relative to the items, or nothing for literals, named as they stand
 *
 * @throws {@link !Error Error} If `expression` or `label` is malformed
 * @throws {@link !RangeError RangeError} If `expression` or `label` reaches no value a facet admits
 */
function resolveNaming(
	shape: Lazy<ResourceShape>,
	field: string,
	expression: Expression,
	label: Optional<Expression>
): Optional<Expression> {

	const literals = new Set(["boolean", "number", "string", "dictionary"]);

	const range = effective(shape, decodeProbe(`?${nest(field, expression)}`));
	const kinds = isString(range) ? [] : getShapeBranches(range.shape).map(({ kind }) => kind);

	return isString(range) ? illegal("expression", expression, range)
		: kinds.every(kind => literals.has(kind)) ? undefined
			: kinds.includes("resource") ? illegal("expression", expression, "nested resource values")
				: !kinds.every(kind => kind === "reference")
					? illegal("expression", expression, "mixed literal and reference values")
					: label === undefined ? illegal("expression", expression, "missing label for reference values")
						: nest(expression, checkLabel(range, label));

}

/**
 * Checks that a label names each resource with exactly one text.
 *
 * @returns `label`, once checked
 */
function checkLabel(range: Range, label: Expression): Expression {

	// a single resource reached, so that the bounds stated are the label's own

	const reached = effective({ ...range, minCount: 1, maxCount: 1 }, decodeProbe(`?${label}`));

	return isString(reached) ? illegal("label", label, reached)
		: reached.minCount !== 1 ? illegal("label", label, "optional value")
			: reached.maxCount !== 1 ? illegal("label", label, "multiple values")
				: !getShapeBranches(reached.shape).every(({ kind }) => kind === "string" || kind === "dictionary")
					? illegal("label", label, "non-textual values")
					: label;

}

/**
 * Rebases an expression relative to the values of another one.
 *
 * @returns `inner`, its path following the path of `outer` and its pipe applied to the combined path
 */
function nest(outer: Expression, inner: Expression): Expression {

	const { path: head } = decodeProbe(`?${outer}`);
	const { pipe, path: tail } = decodeProbe(`?${inner}`);

	return `${pipe.map(transform => `${transform}:`).join("")}${[...head, ...tail].join(".")}`;

}

function illegal<T>(argument: string, value: string, issue: string): T {
	return error(new RangeError(`illegal tally ${argument} <${value}>: ${issue}`));
}
