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
import { useModel } from "@metreeca/clay/model";
import type { Frame } from "@metreeca/blue/value";
import { isNumber, isObject, isString, type Lazy, opt, type Optional } from "@metreeca/core";
import type { Relay } from "@metreeca/core/relay";
import { createState } from "@metreeca/core/state";
import { type Expression, getOrderDirection, getOrderPrecedence, type Order } from "@metreeca/qest/model";
import type { Collections } from "@metreeca/tile/collection";
import type { MembersCases, Ordering } from "@metreeca/tile/members";
import { ChevronDownIcon, ChevronRightIcon, ChevronsUpDownIcon, ChevronUpIcon } from "lucide-preact";
import { type ComponentChildren, createElement, type TargetedMouseEvent } from "preact";
import { classes, Failure, Hint } from "../index.js";
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
 * The label heading a sortable column is a button sorting the items on it, increasing first and reversing the order on
 * each further activation, its tooltip naming the order it applies next. Every column the items are sorted on is
 * marked by the direction they are sorted in, and the one they are sorted on first is announced as sorted. A button
 * marked by the sort glyph at the end of the header row, its tooltip naming it as resetting the sort order, restores
 * the order the items were first shown in, and is disabled while they are shown in that order already.
 *
 * Items carrying an identifier end their row with a link to the resource it names, taking the reader to its details,
 * unless `link` is turned off for screens where the items have no details of their own to open.
 *
 * Values hold to one line, clipped with an ellipsis where they outgrow their cells, and texts and numbers are shown
 * whole in a tooltip, so a clipped one is never out of the reader's reach, however narrow its column gets.
 *
 * In a `hierarchy`, items sharing their first values read as a group: a leading value repeating the one above is shown
 * once, in a cell spanning the rows of its group, and stays in view under the headers while those rows scroll past.
 * Cells are compared by the text or number they render, and a cell rendering anything else never counts as repeating.
 *
 * A `striped` table tints alternate rows, which native tables don't do. The tint guides the eye along rows too wide
 * to follow by their rules alone, where a reader would otherwise lose track of the row they are reading.
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
	link = true,

	members,

	placeholder,
	columns

}: {

	/**
	 * The accessible name of the table, naming what its rows are, as in `Courses`; unnamed if omitted.
	 */
	name?: string


	/**
	 * Whether leading values repeating the ones above are shown once, grouping items by them; not if omitted.
	 */
	hierarchy?: boolean

	/**
	 * Whether alternate rows are tinted, guiding the eye along rows too wide to follow at a glance; not if omitted.
	 */
	striped?: boolean

	/**
	 * Whether rows end with a link to the item they show, opening its details; linked if omitted.
	 */
	link?: boolean


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

	const { widths, freeze } = useModel(() => createLayout());

	return members({

		blank: () => placeholder && <Hint placeholder={placeholder} text={"Loading…"}/>,

		ready: ({ state, order, sort, reset }) => state.length === 0

			? placeholder && <Hint placeholder={placeholder} text={"No Matches"}/>

			: createElement("tile-table", {}, <table aria-label={name} data-striped={striped || undefined}
				data-frozen={widths !== undefined || undefined}
			>

				{widths && <colgroup>{widths.map((width, index) =>
					<col key={index} style={{ width: `${width}px` }}/>
				)}</colgroup>}

				<thead>
					<tr>

						{entries.map(([header, { sort: expression, align }]) =>

							<th key={header} scope="col" class={classes({ end: align === "end" })}
								aria-sort={expression === undefined ? undefined : announced(order, expression)}
							>

								{expression === undefined ? header : <button type="button"

									title={direction(order[expression]) > 0 ? "Sort Descending" : "Sort Ascending"}

									onClick={event => {
										freeze(measure(event));
										sort({ [expression]: direction(order[expression]) > 0 ? "desc" : "asc" });
									}}

								>{header}{mark(order[expression])}</button>}

							</th>
						)}

						<th><button type="button" title={"Reset Sort Order"} disabled={!reset} onClick={reset}>
							<ChevronsUpDownIcon/>
						</button></th>

					</tr>
				</thead>

				<tbody>{rows(state).map(({ item, values, spans }) =>

					<tr key={key(item)}>

						{entries.map(([header, { align }], index) => opt(spans[index], span => span === 0 ? undefined
							: <td key={header} title={text(values[index])} rowSpan={span > 1 ? span : undefined}
								class={classes({ end: align === "end" })}
							>
								{span > 1 ? <span>{values[index]}</span> : values[index]}
							</td>
						))}

						<td>{link && opt(identifier(item), id => <a href={id} title={"Open"}>
							<ChevronRightIcon aria-label={"Open"}/>
						</a>)}</td>

					</tr>
				)}</tbody>

			</table>),

		error: () => <Failure/>

	});


	/**
	 * Renders the values of each item, joining the leading values repeating the ones above.
	 *
	 * @param items The items to be shown
	 *
	 * @returns The rows showing `items`, each with the rows its cells span, `0` for a cell joined to the one above
	 */
	function rows(items: readonly Frame<S, { readonly [K in P]: T }>[]): readonly {

		readonly item: unknown
		readonly values: readonly ComponentChildren[]
		readonly spans: readonly number[]

	}[] {

		const rendered = items.map(item => ({ item, values: entries.map(([, { render }]) => render(item)) }));

		const repeated = rendered.map(({ values }, index) =>
			hierarchy ? repeats(values, rendered[index-1]?.values) : 0
		);

		return rendered.map(({ item, values }, index) => ({
			item,
			values,
			spans: values.map((_, column) => span(repeated, index, column))
		}));

	}

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Spells out a value for the tooltip showing it whole where its cell clips it.
 *
 * @param value The value rendered in a cell
 *
 * @returns The text `value` renders, if a text or a number; `undefined` otherwise
 */
function text(value: ComponentChildren): Optional<string> {
	return isString(value) || isNumber(value) ? String(value) : undefined;
}

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
 * Counts the rows a cell spans.
 *
 * @param repeated The number of leading values each row repeats from the row above
 * @param row The index of the row holding the cell
 * @param column The index of the column holding the cell
 *
 * @returns `0` if the cell repeats the one above; otherwise `1` plus the number of rows below repeating it
 */
function span(repeated: readonly number[], row: number, column: number): number {

	const following = repeated.slice(row+1);
	const end = following.findIndex(count => count <= column);

	return column < (repeated[row] ?? 0) ? 0 : 1+(end < 0 ? following.length : end);

}


/**
 * The column widths a table keeps once the reader reorders its items, so columns don't stretch or shrink to fit the
 * values each new order brings into view.
 */
interface Layout {

	readonly widths: Optional<readonly number[]>;

	/**
	 * Keeps the column widths on show, unless widths are already kept.
	 *
	 * @param widths The widths of the columns on show, if known
	 *
	 * @returns A layout keeping the first widths it was handed
	 */
	freeze(widths: Optional<readonly number[]>): this;

}

function createLayout(): Layout {
	return createState<Layout>({

		widths: undefined,

		freeze(widths) {
			return { widths: this.widths ?? widths };
		}

	});
}


/**
 * Measures the columns of the header row a control sits in.
 *
 * @param event The activation of the control
 *
 * @returns The rendered widths of the header cells, in order; `undefined` if the control sits in no row
 */
function measure(event: TargetedMouseEvent<HTMLElement>): Optional<readonly number[]> {
	return opt(event.currentTarget.closest("tr") ?? undefined, row =>
		Array.from(row.cells, cell => cell.getBoundingClientRect().width)
	);
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
 * @returns The glyph stating `order`; nothing if the items aren't sorted on the column
 */
function mark(order: Optional<Order>): ComponentChildren {

	const sign = direction(order);

	return sign > 0 ? <ChevronDownIcon/> : sign < 0 ? <ChevronUpIcon/> : undefined;

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
