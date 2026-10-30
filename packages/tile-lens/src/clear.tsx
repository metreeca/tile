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
 * Collection reset.
 *
 * Offers the control a reader drops every criterion narrowing a collection with, so that every lens showing it goes
 * back to the whole collection in a single step rather than one facet at a time.
 *
 * @module
 */

import type { ResourceShape } from "@metreeca/blue/resource";
import type { Lazy } from "@metreeca/core";
import { Button } from "@metreeca/tile-cell/button";
import { Icon } from "@metreeca/tile-cell/icon";
import type { Collection, Collections } from "@metreeca/tile-data/store/collection";


/**
 * Creates a collection reset.
 *
 * Shows a {@link @metreeca/tile-cell!button.Button button} marked by the {@link @metreeca/tile-cell!icon.Icon Clear}
 * glyph, removing every criterion the reader set on the collection, so that every lens handed the same collection,
 * lists, facets and counters alike, follows along. The button is disabled while no criterion narrows the collection,
 * and is named for assistive technology by its `Clear Filters` hint, the glyph standing alone.
 *
 * ```tsx
 * const collection = useCollection({ entry: "/courses/", shape: Course });
 *
 * <Clear collection={collection}/>
 * ```
 *
 * @typeParam S The shape describing the resource holding the collection
 * @typeParam P The property of the resource collecting the items
 *
 * @param options The widget configuration
 *
 * @returns The reset control
 */
export function Clear<S extends Lazy<ResourceShape>, P extends Collections<S>>({

	collection

}: {

	/**
	 * The collection reset, as handed by {@link @metreeca/tile-data!store/collection.useCollection useCollection}.
	 */
	collection: Collection<S, P>

}) {

	return <Button

		disabled={Object.keys(collection.criteria).length === 0}

		icon={<Icon.Clear/>}
		title={"Clear Filters"}

		onClick={collection.clear}

	/>;

}
