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
 * Query samples.
 *
 * @module
 */

import { Button } from "@metreeca/clay-widgets/button";
import { Sample } from "@metreeca/specimen/tile-widgets/sample.js";
import { base, Products } from "@metreeca/specimen/toys.js";
import { useCollection } from "@metreeca/tile/collection";
import { useQuery } from "@metreeca/tile/query";
import "../tile-widgets/index.css";


const entry = `${base}products/`;


/**
 * Creates the query section.
 *
 * Keeps the criteria narrowing the toy products in the location, so they survive a reload.
 *
 * @returns The query section
 */
export function Query() {

	const [query, setQuery] = useQuery();

	const collection = useCollection({ entry, shape: Products, query, onChange: setQuery });

	return <>

		<p>Criteria kept with <code>useQuery</code> live in the location, so they survive a reload, travel with a link
			and come back through the history. Handed to <code>useCollection</code> as the criteria it starts from and
			taking back every revision, they need no wiring beyond the call site: narrow the products below, then
			reload the page and find them narrowed still.</p>

		<div class="controls">
			<Button label="Used only" onClick={() => collection.filter({ "?condition": ["used"] })}/>
			<Button label="In stock" onClick={() => collection.filter({ ">=stock": 1 })}/>
			<Button look="subtle" label="Clear" onClick={() => collection.clear()}/>
		</div>

		<div class="samples">
			<Sample label="criteria in the location">
				<pre><code>{JSON.stringify(collection.query, null, 2)}</code></pre>
			</Sample>
		</div>

	</>;

}
