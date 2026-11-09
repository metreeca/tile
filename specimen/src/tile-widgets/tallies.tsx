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
 * Tally samples.
 *
 * @module
 */

import { entry, Faceted } from "@metreeca/specimen/tile-widgets/facets.js";
import { Sample } from "@metreeca/specimen/tile-widgets/sample.js";
import { Products } from "@metreeca/specimen/toys.js";
import { useCollection } from "@metreeca/tile/collection";
import { useTally } from "@metreeca/tile/tally";
import { Tally } from "@metreeca/tile-widgets/filters/tally";


/**
 * Creates the tallies section.
 *
 * Shows the toy products narrowed by tallies over their vendor, categories and condition.
 *
 * @returns The tallies section
 */
export function Tallies() {

	const collection = useCollection({ entry, shape: Products });

	return <>

		<p>A tally narrows a collection to the items holding the values the reader ticks, each value shown with the
			number of items holding it. The other tallies recount their values as the reader ticks, the counter tells
			how many products match, and the table lists them.</p>

		<div class="samples">
			<Sample label="narrowed by category, condition and vendor">
				<Faceted collection={collection}>
					<Tally name="Category" tally={useTally(collection, "categories", { label: "label", size: 5 })}/>
					<Tally name="Condition" tally={useTally(collection, "condition")}/>
					<Tally name="Vendor" compact tally={useTally(collection, "vendor", { label: "name", size: 5 })}/>
				</Faceted>
			</Sample>
		</div>

	</>;

}
