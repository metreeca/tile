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
 * Incremental collection list.
 *
 * Offers the list a screen shows the items of a collection in, fetched from the shared store a batch at a time as the
 * reader scrolls to its end, so a long collection is read without being retrieved all at once.
 *
 * @module
 */

import type { ResourceShape } from "@metreeca/blue/resource";
import type { Items, Slice } from "@metreeca/blue/value";
import { isObject, isString, type Lazy } from "@metreeca/core";
import type { IRI } from "@metreeca/core/resource";
import { Fault } from "@metreeca/tile-cell/fault";
import { Hint } from "@metreeca/tile-cell/hint";
import { More } from "@metreeca/tile-cell/more";
import { useModel } from "@metreeca/tile-data/model";
import { useCollection } from "@metreeca/tile-data/store";
import { type ComponentChildren, createElement, Fragment } from "preact";
import { Paging } from "./paging.js";
import "./sheet.css";


/**
 * Creates an incremental collection list.
 *
 * Lists the items of a collection held by the {@link @metreeca/tile-data!store.Store shared store}, rendering each
 * through `children`, and keeps in step with the store as {@link @metreeca/tile-data!store.useCollection useCollection}
 * does. The list starts with the first 25 items and closes with a
 * {@link @metreeca/tile-cell!more.More trigger} while the collection holds more, fetching the next batch as soon as
 * the reader scrolls it into view; the items on show stay there while the next batch is on its way.
 *
 * Filters and sort order are stated in the model as criteria on the collection, as the store takes them: the list
 * sets the limit alone, overriding any the model states, and starts again from the first batch whenever it is handed a
 * new model.
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
	model,
	placeholder,
	shape,

	children

}: {

	/**
	 * The identifier of the resource holding the collection, either absolute or relative to the current location.
	 */
	entry: IRI

	/**
	 * The model naming the multi-valued property collecting the items, stating the values wanted from each item along
	 * with the criteria filtering and sorting them; compared by reference, as for
	 * {@link @metreeca/tile-data!store.useCollection useCollection}, so a model is declared once or kept in state.
	 */
	model: T

	/**
	 * The glyph marking the area while the list has nothing to show; nothing is rendered in its place if omitted.
	 */
	placeholder?: ComponentChildren

	/**
	 * The shape describing the resource holding the collection, possibly deferred to break definition cycles.
	 */
	shape: S


	/**
	 * Renders an item of the collection.
	 */
	children: (item: Items<S, T>[number]) => ComponentChildren

}) {

	/*
	 * The paging is created again whenever the consumer hands over a new model, as when a filter changes, so a new query
	 * starts again from the first batch.
	 */

	const { model: paged, limit, asked, next } = useModel(() => Paging({ model }), [model]);

	const collection = useCollection({

		entry,
		shape,

		model: paged as T // ;(cast) the paged copy of model differs only in the limit, which leaves the items typed alike

	});

	return collection({

		blank: () => placeholder && <Hint>{placeholder}<span>Loading…</span></Hint>,

		ready: ({ state }) => {

			/*
			 * While the binding still holds the items the next batch was asked over, the batch is on its way: they include
			 * the one item past the previous window, which stays off show until the batch lands.
			 */

			const shown = state === asked ? state.length - 1 : limit;

			return state.length === 0

				? placeholder && <Hint>{placeholder}<span>No Matches</span></Hint>

				: createElement("tile-sheet", {}, <>

					{state.slice(0, shown).map(item =>
						<Fragment key={key(item)}>{children(item)}</Fragment>
					)}

					{state.length > shown && <More onLoad={() => next(state)}/>}

				</>);

		},

		error: ({ state }) => <Fault {...state}/>

	});

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
