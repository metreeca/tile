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
 * Count samples.
 *
 * @module
 */

import { Button } from "@metreeca/clay-widgets/button";
import { Sample } from "@metreeca/specimen/tile-widgets/sample.js";
import { base, Products } from "@metreeca/specimen/toys.js";
import { useCollection } from "@metreeca/tile/collection";
import { useCount } from "@metreeca/tile/count";
import "../tile-widgets/index.css";


const entry = `${base}products/`;


/**
 * Creates the count section.
 *
 * Counts the toy products, narrowed or not to those in stock.
 *
 * @returns The count section
 */
export function Count() {

	const collection = useCollection({ entry, shape: Products });

	const count = useCount(collection);

	return <>

		<p>A counter bound with <code>useCount</code> tells how many items the criteria on a collection let through,
			counted again as they change, with no exchange beyond the count itself. It also tells whether the count was
			taken under the reader's criteria, so a counter can word a narrowed count apart from the whole.</p>

		<div class="controls">
			<Button label="In stock" onClick={() => collection.filter({ ">=stock": 1 })}/>
			<Button look="subtle" label="Clear" onClick={() => collection.clear()}/>
		</div>

		<div class="samples">
			<Sample label="products">{count({

				blank: () => <p>Counting…</p>,

				ready: ({ state, filtered }) => <p><strong>{state}</strong> {filtered ? "in stock" : "in all"}</p>,

				error: ({ state }) => <p>{state.status} {state.title}</p>

			})}</Sample>
		</div>

	</>;

}
