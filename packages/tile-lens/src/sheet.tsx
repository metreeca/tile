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
 * Windowed collection list.
 *
 * Offers the list a screen shows the items of a collection in, fetching from the shared store only the items in view
 * and the batches around them, while taking the room of the whole collection, so a long collection is read without
 * being retrieved all at once and the scrollbar still tells where the reader stands in it.
 *
 * @module
 */

import type { ResourceShape } from "@metreeca/blue/resource";
import type { Frame } from "@metreeca/blue/value";
import { isObject, isString, type Lazy, opt, type Optional } from "@metreeca/core";
import { Hint } from "@metreeca/tile-cell/hint";
import { Note } from "@metreeca/tile-cell/note";
import type { Collection, Collections } from "@metreeca/tile-data/store/collection";
import { type Admitted, type Ordering, useWindow } from "@metreeca/tile-data/store/window";
import { type ComponentChildren, createElement, Fragment } from "preact";
import { useEffect, useId, useState } from "preact/hooks";
import "./sheet.css";


/**
 * Creates a windowed collection list.
 *
 * Lists the items of a shared collection, rendering each through `children`, and keeps in step with the store. Only
 * the items in view are retrieved, in batches of 100 together with the batch before and the one after them, while the
 * list takes the room the whole collection would, as estimated from the height of the rows on show, so the scrollbar
 * of whatever area the list scrolls in spans the collection; the items on show stay where they stand while the
 * batches for a new position are on their way.
 *
 * The list shows the items the collection criteria let through, in the sort order given, and starts again from the
 * first items whenever the criteria, the model or the sort order change.
 *
 * Where a `placeholder` is supplied, a list with nothing to show fills its area with it, worded as still loading or as
 * matching nothing. A failed exchange is shown as a critical {@link @metreeca/tile-cell!note.Note note} in place of the
 * list.
 *
 * @typeParam S The shape describing the resource holding the collection
 * @typeParam P The property of the resource collecting the items
 * @typeParam T The template or projection stating the values wanted from each item
 *
 * @param options The widget configuration
 *
 * @returns The list
 */
export function Sheet<S extends Lazy<ResourceShape>, P extends Collections<S>, T extends object>({

	collection,

	model,
	order,

	placeholder,
	children

}: {

	/**
	 * The collection listed, as handed by {@link @metreeca/tile-data!store/collection.useCollection useCollection}.
	 */
	collection: Collection<S, P>

	/**
	 * The template or projection stating the values wanted from each item; compared by content, so it may be written
	 * inline and a copy stating the same leaves the list where it stands.
	 */
	model: T & Admitted<S, P, T>

	/**
	 * The sort order the items are listed in, as expressions mapped to their direction: `{ label: "asc" }`.
	 */
	order?: Ordering


	/**
	 * The glyph marking the area while the list has nothing to show; nothing is rendered in its place if omitted.
	 */
	placeholder?: ComponentChildren

	/**
	 * Renders an item of the collection.
	 */
	children: (item: Frame<S, { readonly [K in P]: T }>) => ComponentChildren

}) {

	const window = useWindow<S, P, T>(collection, { model, order });

	return window({

		blank: () => placeholder && <Hint>{placeholder}<span>Loading…</span></Hint>,

		ready: ({ state, offset, total, move }) => state.length === 0 && offset === 0

			? placeholder && <Hint>{placeholder}<span>No Matches</span></Hint>

			: <Rows items={state} offset={offset} total={total} move={move}>{children}</Rows>,

		error: () => <Note level="critical"><div>Not Available</div></Note>

	});

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Lays out a window of a collection in the room of the whole collection.
 *
 * @param options The items in the window, the index of the first of them, the size of the collection, the transition
 *     bringing the window over the items in view, and the renderer of an item
 *
 * @returns The `<tile-sheet>` element holding the items, padded above and below by the room of the items outside the
 *     window
 */
function Rows<I>({

	items,
	offset,
	total,

	move,

	children

}: {

	items: readonly I[]
	offset: number
	total: Optional<number>

	move: (first: number, last: number) => void

	children: (item: I) => ComponentChildren

}) {

	const id = useId();

	// Row height is known to the browser alone, so it is measured off the rows on show.

	const [row, setRow] = useState<number>();

	const size = Math.max(total ?? 0, offset+items.length);

	useEffect(() => opt(document.getElementById(id) ?? undefined, element => {

		const observer = new ResizeObserver(entries => opt(entries.at(-1), ({ contentRect: { height } }) =>
			setRow(row => height > 0 ? height/items.length : row)
		));

		observer.observe(element);

		return () => observer.disconnect();

	}), [id, items.length]);

	// Items in view are known to the browser alone, so scrolling is followed on the whole page.

	useEffect(() => opt(row, row => opt(document.getElementById(id) ?? undefined, element => {

		const index = (offset: number) => Math.min(size-1, Math.max(0, Math.floor(offset/row)));

		const track = () => {

			const { top } = element.getBoundingClientRect();

			move(index(-top), index(window.innerHeight-top));

		};

		track();

		window.addEventListener("scroll", track, { capture: true, passive: true });
		window.addEventListener("resize", track, { passive: true });

		return () => {
			window.removeEventListener("scroll", track, { capture: true });
			window.removeEventListener("resize", track);
		};

	})), [id, row, size, move]);

	return createElement("tile-sheet", {

		id,

		style: opt(row, row => ({
			paddingTop: `${offset*row}px`,
			paddingBottom: `${Math.max(0, size-offset-items.length)*row}px`
		}))

	}, items.map(item =>
		<Fragment key={key(item)}>{children(item)}</Fragment>
	));

}


/**
 * Identifies an item among its siblings.
 *
 * @param item The item to be identified
 *
 * @returns The identifier of `item`, if it carries one, or its serialisation otherwise, as for a projected row
 */
function key(item: unknown): string {
	return isObject(item) && isString(item.id) ? item.id : JSON.stringify(item);
}
