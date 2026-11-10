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
 * Search samples.
 *
 * @module
 */

import { entry, Faceted } from "@metreeca/specimen/tile-widgets/facets.js";
import { Sample } from "@metreeca/specimen/tile-widgets/sample.js";
import { Products } from "@metreeca/specimen/toys.js";
import { useCollection } from "@metreeca/tile/collection";
import { useSearch } from "@metreeca/tile/search";
import { Search } from "@metreeca/tile-widgets/filters/search";


/**
 * Creates the searches section.
 *
 * Shows the toy products narrowed by text matched against their name.
 *
 * @returns The searches section
 */
export function Searches() {

	const collection = useCollection({ entry, shape: Products });

	return <>

		<p>A search box narrows a collection to the items whose name holds the text the reader types, once the
			reader pauses typing or at once on <code>Enter</code>. The counter tells how many products match, the table
			lists them, and clearing the collection empties the box as well.</p>

		<div class="samples">
			<Sample>
				<Faceted collection={collection}>
					<Search name="Name" search={useSearch(collection, "name")}/>
				</Faceted>
			</Sample>
		</div>

	</>;

}
