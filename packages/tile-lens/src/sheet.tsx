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
import type { Items, Slice } from "@metreeca/blue/value";
import { isNumber, isObject, isString, type Lazy, opt, type Optional } from "@metreeca/core";
import type { IRI } from "@metreeca/core/resource";
import { Fault } from "@metreeca/tile-cell/fault";
import { Hint } from "@metreeca/tile-cell/hint";
import { useModel } from "@metreeca/tile-data/model";
import { useCollection } from "@metreeca/tile-data/store";
import { type ComponentChildren, createElement, Fragment } from "preact";
import { useEffect, useId, useMemo, useState } from "preact/hooks";
import { tally, createWindow } from "./_/window.js";
import "./sheet.css";


/**
 * Creates a windowed collection list.
 *
 * Lists the items of a collection held by the {@link @metreeca/tile-data!store.Store shared store}, rendering each
 * through `children`, and keeps in step with the store as {@link @metreeca/tile-data!store.useCollection useCollection}
 * does. Only the items in view are retrieved, in batches of 25 together with the batch before and the one after them,
 * while the list takes the room the whole collection would, as estimated from the height of the rows on show, so the
 * scrollbar of whatever area the list scrolls in spans the collection; the items on show stay where they stand while
 * the batches for a new position are on their way.
 *
 * Filters and sort order are stated in the model as criteria on the collection, as the store takes them: the list
 * sets the offset and limit alone, overriding any the model states, and starts again from the first items whenever it
 * is handed a model stating something different.
 *
 * Where a `placeholder` is supplied, a list with nothing to show fills its area with it, worded as still loading or as
 * matching nothing; a failed exchange is shown as a {@link @metreeca/tile-cell!fault.Fault fault} in place of the
 * list.
 *
 * @typeParam S The shape describing the resource holding the collection
 * @typeParam T The model naming the property collecting the items and stating which values of each item are wanted
 *
 * @param options The widget configuration
 *
 * @returns The list
 */
export function Sheet<S extends Lazy<ResourceShape>, T extends Slice<S, T>>({

	entry,
	shape,
	model,

	placeholder,
	children

}: {

	/**
	 * The identifier of the resource holding the collection, either absolute or relative to the current location.
	 */
	entry: IRI

	/**
	 * The shape describing the resource holding the collection, possibly deferred to break definition cycles.
	 */
	shape: S

	/**
	 * The model naming the multi-valued property collecting the items, stating the values wanted from each item along
	 * with the criteria filtering and sorting them; compared by content, so a model may be written inline and a copy
	 * stating the same leaves the list where it stands.
	 */
	model: T


	/**
	 * The glyph marking the area while the list has nothing to show; nothing is rendered in its place if omitted.
	 */
	placeholder?: ComponentChildren

	/**
	 * Renders an item of the collection.
	 */
	children: (item: Items<S, T>[number]) => ComponentChildren

}) {

	// A new model, as when a filter changes, creates the window again from the first items.

	const { model: slice, lower, stale, focus } = useModel(() => createWindow({ model }), [model]);

	// The count is retrieved again only as the window moves, the binding comparing models by reference.

	const counting = useMemo(() => tally(slice), [slice]);

	const collection = useCollection({

		entry,
		shape,

		model: slice as T // ;(cast) offset and limit leave the items typed alike

	});

	const counter = useCollection({

		entry,
		shape,

		model: counting as T // ;(cast) count() reads the count off an untyped item

	});

	const total = counter({ ready: ({ state }) => count(state) });

	return collection({

		blank: () => placeholder && <Hint>{placeholder}<span>Loading…</span></Hint>,

		ready: ({ state }) => {

			// Stale items stand where they were taken from until the new window lands.

			const start = state === stale?.items ? stale.lower : lower;

			return state.length === 0 && start === 0

				? placeholder && <Hint>{placeholder}<span>No Matches</span></Hint>

				: <Rows items={state} start={start} total={total} focus={focus}>{children}</Rows>;

		},

		error: ({ state }) => <Fault {...state}/>

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
	start,
	total,

	focus,

	children

}: {

	items: readonly I[]
	start: number
	total: Optional<number>

	focus: (first: number, last: number, items: readonly unknown[]) => void

	children: (item: I) => ComponentChildren

}) {

	const id = useId();

	// Row height is known to the browser alone, so it is measured off the rows on show.
	const [row, setRow] = useState<number>();

	const size = Math.max(total ?? 0, start+items.length);

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

			focus(index(-top), index(window.innerHeight-top), items);

		};

		track();

		window.addEventListener("scroll", track, { capture: true, passive: true });
		window.addEventListener("resize", track, { passive: true });

		return () => {
			window.removeEventListener("scroll", track, { capture: true });
			window.removeEventListener("resize", track);
		};

	})), [id, row, size, items, focus]);

	return createElement("tile-sheet", {

		id,

		style: opt(row, row => ({
			paddingTop: `${start*row}px`,
			paddingBottom: `${Math.max(0, size-start-items.length)*row}px`
		}))

	}, items.map(item =>
		<Fragment key={key(item)}>{children(item)}</Fragment>
	));

}


/**
 * Reads the size of a collection off its count.
 *
 * @param items The items retrieved for the count of a collection
 *
 * @returns The count carried by the single item retrieved, if it carries one
 */
function count(items: readonly unknown[]): Optional<number> {
	return opt(items[0], item => isObject(item) && isNumber(item.count) ? item.count : undefined);
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
