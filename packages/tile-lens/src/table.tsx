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
 * Collection table.
 *
 * Offers a table for showing the members of a collection, one row per item and one column per value. The reader
 * compares items side by side, and sorts them on any column the screen makes sortable without leaving the table.
 *
 * @module
 */

import type { ResourceShape } from "@metreeca/blue/resource";
import type { Frame } from "@metreeca/blue/value";
import { classes } from "@metreeca/clay-cell";
import { Button } from "@metreeca/clay-cell/button";
import { Hint } from "@metreeca/clay-cell/hint";
import { Icon } from "@metreeca/clay-cell/icon";
import { Link } from "@metreeca/clay-cell/link";
import { Note } from "@metreeca/clay-cell/note";
import { isNumber, isObject, isString, type Lazy, opt, type Optional } from "@metreeca/core";
import type { Relay } from "@metreeca/core/relay";
import { type Expression, getOrderDirection, getOrderPrecedence, type Order } from "@metreeca/qest/model";
import type { Collections } from "@metreeca/tile/collection";
import type { MembersCases, Ordering } from "@metreeca/tile/members";
import { type ComponentChildren, createElement } from "preact";
import "./table.css";


/**
 * Table column.
 *
 * @typeParam I The items the table shows
 */
export type Column<I> = {

	/**
	 * The expression the column sorts the items on, as `label` or `year:released`; not sortable if omitted.
	 */
	readonly sort?: Expression

	/**
	 * Where the values sit in their cells: `end` lines up figures by their last digit; `start` if omitted.
	 */
	readonly align?: "start" | "end"

	/**
	 * Renders the value the column shows for an item.
	 *
	 * @param item The item whose value is shown
	 */
	readonly render: (item: I) => ComponentChildren

}


/**
 * Creates a collection table.
 *
 * Shows the members of a collection one row per item, with a column for each entry of `columns`, headed by its key, and
 * keeps in step with them: the rows on show stay where they stand while the next batch, a new order or new criteria are
 * on their way. Asking for more is left to the screen, which closes the table with a trigger handed `load`, such as a
 * button fetching the next batch when activated, or one fetching it as it scrolls into view:
 *
 * ```tsx
 * const members = useMembers(collection, { model: { id: {}, label: {}, year: {} }, order: { label: "asc" } });
 *
 * <Table name="Courses" members={members} columns={{
 *     Label: { sort: "label", render: item => item.label },
 *     Year: { sort: "year", align: "end", render: item => item.year }
 * }}/>
 *
 * {members({ ready: ({ load }) => load && <button onClick={() => load()}>More</button> })}
 * ```
 *
 * The header of a sortable column is a button sorting the items on it, increasing first and reversing the order on each
 * further activation, marked by the direction the items are sorted in; the column the items are sorted on first is
 * announced as sorted. While the items are shown in an order other than the one they started in, a button marked by the
 * sort glyph at the end of the header row restores the order the items were first shown in.
 *
 * Items carrying an identifier end their row with a link to the resource it names, taking the reader to its details.
 *
 * In a `hierarchy`, the leading cells of a row repeating the ones above are faded, so that items sharing their first
 * values read as a group. Cells are compared by the text they render, and a cell rendering anything other than text or
 * a number never counts as repeating. A `striped` table tints alternate rows, which native tables don't do, to guide
 * the eye along rows too wide to follow by their rules alone.
 *
 * Where a `placeholder` is supplied, a table with nothing to show fills its area with it, worded as still loading or as
 * matching nothing. A failed exchange is shown as a critical note instead, telling the reader why no rows are listed.
 *
 * @typeParam S The shape describing the resource holding the collection
 * @typeParam P The property of the resource collecting the items
 * @typeParam T The template or projection stating the values wanted from each item
 *
 * @param options The widget configuration
 *
 * @returns The table
 *
 * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/ ARIA APG: Sortable Table}
 */
export function Table<S extends Lazy<ResourceShape>, P extends Collections<S>, T extends object>({

	name,

	hierarchy,
	striped,

	members,

	placeholder,
	columns

}: {

	/**
	 * The accessible name of the table, naming what its rows are, as in `Courses`; unnamed if omitted.
	 */
	name?: string


	/**
	 * Whether leading cells repeating the ones above are faded, grouping items by their first values; not if omitted.
	 */
	hierarchy?: boolean

	/**
	 * Whether alternate rows are tinted, guiding the eye along rows too wide to follow at a glance; not if omitted.
	 */
	striped?: boolean


	/**
	 * The collection members shown, as handed by {@link @metreeca/tile!members.useMembers useMembers}.
	 */
	members: Relay<MembersCases<S, P, T>>


	/**
	 * The glyph marking the area while the table has nothing to show; nothing is rendered in its place if omitted.
	 */
	placeholder?: ComponentChildren

	/**
	 * The columns shown, in order, each keyed by the text heading it.
	 */
	columns: { readonly [header: string]: Column<Frame<S, { readonly [K in P]: T }>> }

}) {

	const entries = Object.entries(columns);

	return members({

		blank: () => placeholder && <Hint>{placeholder}<span>Loading…</span></Hint>,

		ready: ({ state, order, sort, reset }) => state.length === 0

			? placeholder && <Hint>{placeholder}<span>No Matches</span></Hint>

			: createElement("tile-table", { striped },<table aria-label={name}>

				<thead>
					<tr>

						{entries.map(([header, { sort: expression, align }]) =>

							<th key={header} scope="col" class={classes({ end: align === "end" })}
								aria-sort={expression === undefined ? undefined : announced(order, expression)}
							>

								{expression === undefined ? header : <Button

									look="subtle"

									icon={mark(order[expression])}
									label={header}

									onClick={() => sort({ [expression]: direction(order[expression]) > 0 ? "desc" : "asc" })}

								/>}

							</th>
						)}

						<th>{reset && <Button icon={<Icon.Sort/>} title={"Reset Order"} onClick={reset}/>}</th>

					</tr>
				</thead>

				<tbody>{rows(state).map(({ item, values, repeated }) =>

					<tr key={key(item)}>

						{entries.map(([header, { align }], index) =>
							<td key={header} class={classes({ end: align === "end", repeated: index < repeated })}>
								{values[index]}
							</td>
						)}

						<td>{opt(identifier(item), id => <Link href={id}>
							<Icon.Open aria-label={"Open"}/>
						</Link>)}</td>

					</tr>
				)}</tbody>

			</table>),

		error: () => <Note level="critical"><div>Not Available</div></Note>

	});


	/**
	 * Renders the values of each item, counting the leading cells repeating the ones above.
	 *
	 * @param items The items to be shown
	 *
	 * @returns The rows showing `items`, each with the number of its leading cells to be faded
	 */
	function rows(items: readonly Frame<S, { readonly [K in P]: T }>[]): readonly {

		readonly item: unknown
		readonly values: readonly ComponentChildren[]
		readonly repeated: number

	}[] {

		return items
			.map(item => ({ item, values: entries.map(([, { render }]) => render(item)) }))
			.map(({ item, values }, index, rows) => ({
				item,
				values,
				repeated: hierarchy ? repeats(values, rows[index-1]?.values) : 0
			}));

	}

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Counts the leading values of a row repeating the ones of the row above.
 *
 * @param values The values of the row
 * @param above The values of the row above, if any
 *
 * @returns The number of leading values rendering the same text or number as in `above`; `0` for the first row
 */
function repeats(values: readonly ComponentChildren[], above: Optional<readonly ComponentChildren[]>): number {

	const index = values.findIndex((value, index) =>
		!((isString(value) || isNumber(value)) && value === above?.[index])
	);

	return index < 0 ? values.length : index;

}


/**
 * Resolves the announced sort state of a column.
 *
 * @param order The sort order the items are shown in
 * @param expression The expression the column sorts the items on
 *
 * @returns The `aria-sort` state of the column, if the items are sorted on `expression` first; `undefined` otherwise
 */
function announced(order: Ordering, expression: Expression): Optional<"ascending" | "descending"> {

	const first = Object.entries(order)
		.filter(([, value]) => direction(value) !== 0)
		.reduce<Optional<[string, Order]>>((first, entry) =>
			first === undefined || getOrderPrecedence(entry[1]) < getOrderPrecedence(first[1]) ? entry : first, undefined
		);

	return first === undefined || first[0] !== expression ? undefined
		: direction(first[1]) > 0 ? "ascending"
			: "descending";

}

/**
 * Marks the direction a column sorts the items in.
 *
 * @param order The order the items are sorted in on the column, if any
 *
 * @returns The glyph stating `order`, or offering an order yet to be chosen if the items aren't sorted on the column
 */
function mark(order: Optional<Order>): ComponentChildren {

	const sign = direction(order);

	return sign > 0 ? <Icon.Increasing/> : sign < 0 ? <Icon.Decreasing/> : <Icon.Sort/>;

}

/**
 * Resolves the direction of an optional sort order.
 *
 * @param order The sort order, if any
 *
 * @returns `+1` for an increasing order, `-1` for a decreasing one, and `0` if `order` is missing or ignored
 */
function direction(order: Optional<Order>): number {
	return order === undefined ? 0 : getOrderDirection(order);
}


/**
 * Retrieves the identifier of an item.
 *
 * @param item The item to be identified
 *
 * @returns The identifier carried by `item`, if any
 */
function identifier(item: unknown): Optional<string> {
	return isObject(item) && isString(item.id) ? item.id : undefined;
}

/**
 * Identifies an item among its siblings.
 *
 * @param item The item to be identified
 *
 * @returns The identifier of `item`, if it carries one, or its serialisation otherwise, as for a projected row
 */
function key(item: unknown): string {
	return identifier(item) ?? JSON.stringify(item);
}
