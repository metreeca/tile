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
 * Collection list.
 *
 * Offers the list a screen shows the items of a collection window in, so that a long collection is read as the reader
 * scrolls through it, a trigger placed after the list asking the window for the next batch.
 *
 * @module
 */

import type { ResourceShape } from "@metreeca/blue/resource";
import type { Frame } from "@metreeca/blue/value";
import { isObject, isString, type Lazy } from "@metreeca/core";
import type { Relay } from "@metreeca/core/relay";
import { Hint } from "@metreeca/tile-cell/hint";
import { Note } from "@metreeca/tile-cell/note";
import type { Collections } from "@metreeca/tile-data/store/collection";
import type { WindowCases } from "@metreeca/tile-data/store/window";
import { type ComponentChildren, createElement, Fragment } from "preact";
import "./sheet.css";


/**
 * Creates a collection list.
 *
 * Lists the items of a collection window, rendering each through `children`, and keeps in step with the window: the
 * items on show stay where they stand while a grown, sorted or narrowed window is on its way. Growing the window is
 * left to the screen, which closes the list with a {@link @metreeca/tile-cell!more.More More} trigger handed `more`:
 *
 * ```tsx
 * const window = useWindow(collection, { model: { id: {}, label: {} } });
 *
 * <Sheet window={window}>{item => <div>{item.label}</div>}</Sheet>
 *
 * {window({ ready: ({ more }) => more && <More onLoad={more}/> })}
 * ```
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

	window,

	placeholder,
	children

}: {

	/**
	 * The collection window listed, as handed by {@link @metreeca/tile-data!store/window.useWindow useWindow}.
	 */
	window: Relay<WindowCases<S, P, T>>


	/**
	 * The glyph marking the area while the list has nothing to show; nothing is rendered in its place if omitted.
	 */
	placeholder?: ComponentChildren

	/**
	 * Renders an item of the collection.
	 */
	children: (item: Frame<S, { readonly [K in P]: T }>) => ComponentChildren

}) {

	return window({

		blank: () => placeholder && <Hint>{placeholder}<span>Loading…</span></Hint>,

		ready: ({ state }) => state.length === 0

			? placeholder && <Hint>{placeholder}<span>No Matches</span></Hint>

			: createElement("tile-sheet", {}, state.map(item =>
				<Fragment key={key(item)}>{children(item)}</Fragment>
			)),

		error: () => <Note level="critical"><div>Not Available</div></Note>

	});

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
