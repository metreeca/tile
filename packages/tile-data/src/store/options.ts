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
 * Shared collection options.
 *
 * Binds a facet to a shared collection, so that it lists the values the items hold for an expression with the number
 * of items holding each, and narrows every lens over the collection to the items holding the values the reader picks.
 *
 * @module
 */

import type { ResourceShape } from "@metreeca/blue/resource";
import { items } from "@metreeca/blue/value";
import { isArray, isNumber, isObject, type Lazy, opt, type Optional } from "@metreeca/core";
import { createRelay, type Option as Outcome, type Relay } from "@metreeca/core/relay";
import { equals, immutable } from "@metreeca/core/values";
import type { Problem } from "@metreeca/http/success";
import { type Criteria, type Expression, isOption, type Option, type Template } from "@metreeca/qest/model";
import type { Resource } from "@metreeca/qest/state";
import { useModel } from "../model.js";
import type { Collection, Collections } from "./collection.core.js";
import { useEntry } from "./index.core.js";
import { useStore } from "./index.js";
import { createOptions } from "./options.core.js";


/**
 * Collection option.
 */
export type Choice = {

	/**
	 * The value the items hold for the expression, as {@link OptionsCases} `select` takes it: the literal itself, the
	 * identifier of the resource, or `null` for the items holding none of them, which a reader may select as well.
	 */
	readonly value: Option

	/**
	 * The value as the option model states it, where one is supplied.
	 */
	readonly frame?: Resource

	/**
	 * The number of items holding the value, under the collection criteria other than the options' own.
	 */
	readonly count: number

	/**
	 * Whether the value narrows the collection.
	 */
	readonly selected: boolean

}

/**
 * Shared collection options cases.
 */
export type OptionsCases = {

	/**
	 * The options are being retrieved for the first time.
	 */
	readonly blank: void

	/**
	 * The options are retrieved; they stay on show while they are retrieved again under new criteria.
	 */
	readonly ready: {

		/**
		 * The options on show: the selected ones first, then the others by decreasing count, each set leading with
		 * the values the other criteria let through; values the other criteria leave out count no items.
		 */
		readonly state: readonly Choice[]

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
		 * Selects or deselects a value, narrowing the collection to the items holding any of the selected ones.
		 *
		 * @param value The value of the option, as {@link Choice.value} states it
		 * @param selected Whether the value is to be selected
		 */
		select(value: Option, selected: boolean): void

		/**
		 * Deselects every value and shows the options as they stood when first retrieved, with no keywords and from the
		 * first one, leaving the other criteria narrowing the collection, its scope included, in place.
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


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Binds a component to the options of a shared collection.
 *
 * Retrieves through the store offered by the innermost enclosing {@link "store"!Store Store} context the values the
 * items hold for `expression` and the number of items holding each, twice: under the collection scope alone, so that
 * the list of values stays stable as other facets narrow the collection, and under the collection criteria other than
 * its own, for the counts. Selected values are kept on top of both, whatever the keywords and the page on show.
 *
 * > [!WARNING]
 * > Selected values are kept on top through qest focus, which qest admits only on literal values for the time being
 * > ([metreeca/qest#29](https://github.com/metreeca/qest/issues/29)): a validating store may reject the options of a
 * > resource-valued expression as soon as the reader selects one of its values, until the issue is settled.
 *
 * @typeParam S The shape describing the resource holding the collection
 * @typeParam P The property of the resource collecting the items
 *
 * @param collection The collection narrowed, as handed by {@link "store/collection"!useCollection useCollection}
 * @param expression The expression the options are values of, as a property path possibly behind a transform pipe, as
 *     in `university` or `year:released`, relative to the items of the collection
 * @param options The values wanted from each resource option, the expression keywords are matched against, and the
 *     number of options on show at a time, all of them where omitted or set to zero
 *
 * @returns A {@link Relay} over the {@link OptionsCases} of the binding
 *
 * @throws {@link !Error Error} If called outside any {@link "store"!Store Store} context
 */
export function useOptions<S extends Lazy<ResourceShape>, P extends Collections<S>>(

	collection: Collection<S, P>,
	expression: Expression,

	{

		model,
		text,
		size

	}: {

		/**
		 * The template stating the values wanted from each resource option, handed over as {@link Choice.frame}:
		 * `{ id: {}, label: {} }`; resource options carry their identifier alone if omitted.
		 */
		readonly model?: Template

		/**
		 * The expression keywords are matched against, as when the options are resources searched by one of their
		 * text properties: `university.label`; resource options can't be searched by keywords without it.
		 *
		 * @defaultValue `expression`
		 */
		readonly text?: Expression

		/**
		 * The number of options on show, or `0` to show them all.
		 *
		 * @defaultValue 0
		 */
		readonly size?: number

	} = {}

): Relay<OptionsCases> {

	const store = useStore();

	const { target: { entry, shape, field }, scope, sieve } = collection;

	const key: `?${Expression}` = `?${expression}`;

	const options = useModel(() => createOptions({ size }), [entry, field, scope, expression, size]);

	const selected = values(sieve[key]);
	const others = Object.fromEntries(Object.entries(sieve).filter(([criterion]) => criterion !== key));

	const specs = {

		[`value=${expression}`]: {},
		...(model ? { [`frame=${expression}`]: model } : {}),
		"count=count:": {},

		...(options.keywords ? { [`~${text ?? expression}`]: options.keywords } : {}),

		"^count:": -2,
		...(selected.length > 0 ? { [`+${expression}`]: selected } : {}), // !!! references pending metreeca/qest#29

		"@": options.offset,
		"#": options.limit > 0 ? options.limit+1 : 0

	};

	const baseline = useChoices({ ...scope, ...specs });
	const matching = useChoices({ ...scope, ...others, ...specs });

	return createRelay(baseline<Outcome<OptionsCases>>({

		blank: () => ({ blank: undefined }),
		error: ({ state }) => ({ error: { state, reload } }),

		ready: ({ state: base }) => matching<Outcome<OptionsCases>>({

			blank: () => ({ blank: undefined }),
			error: ({ state }) => ({ error: { state, reload } }),

			ready: ({ state: match }) => ready(merge(base, match))

		})

	}));


	/**
	 * Binds the options the store holds under a set of criteria.
	 *
	 * The generic shape and template accept any model: the options are typed by the signature instead.
	 *
	 * @param criteria The criteria and the bindings the options are retrieved under
	 */
	function useChoices(criteria: object) {

		const holder: Lazy<ResourceShape> = shape;
		const model: Template = { [field]: criteria };

		return createRelay(useEntry({

			store,
			entry,
			model,

			lookup: () => store.lookup({ entry, shape: holder, model })
				.then(match => opt(match, match => items(match, model).flatMap(row))),

			modify: () => ({})

		}));

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
	 * Lists the options on show: selected first, then the others, those the other criteria let through leading each
	 * set; the options they leave out are retrieved under the scope alone and count no items.
	 */
	function merge(base: readonly Row[], match: readonly Row[]): readonly Choice[] {

		const tagged = (row: Row): Choice => ({ ...row, selected: selected.some(value => equals(value, row.value)) });

		const matched = match.map(tagged);
		const missing = base
			.filter(({ value }) => !match.some(row => equals(row.value, value)))
			.map(row => tagged({ ...row, count: 0 }));

		return [
			...matched.filter(({ selected }) => selected),
			...missing.filter(({ selected }) => selected),
			...matched.filter(({ selected }) => !selected),
			...missing.filter(({ selected }) => !selected)
		];

	}

	function ready(choices: readonly Choice[]): Outcome<OptionsCases> {
		return immutable({
			ready: {

				state: options.limit > 0 ? choices.slice(0, options.limit) : choices,

				keywords: options.keywords,
				offset: options.offset,
				limit: options.limit,
				more: options.limit > 0 && choices.length > options.limit,

				search: (keywords: string) => void options.search(keywords),
				seek: (offset: number) => void options.seek(offset),
				resize: (limit: number) => void options.resize(limit),

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
type Row = Omit<Choice, "selected">

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
 * @param item The row retrieved for an option
 *
 * @returns The option the row states, with a non-negative count, or nothing if the row states no option
 */
function row(item: unknown): readonly Row[] {
	return isObject(item) && isOption(item.value) ? [{
		value: item.value,
		...(isObject(item.frame) ? { frame: item.frame as Resource } : {}), // ;(cast) retrieved under the option model
		count: isNumber(item.count) && item.count >= 0 ? item.count : 0
	}] : [];
}
