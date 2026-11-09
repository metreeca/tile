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
 * Collection samples.
 *
 * @module
 */

import { Button } from "@metreeca/clay-widgets/button";
import { Sample } from "@metreeca/specimen/tile-widgets/sample.js";
import { base, Products } from "@metreeca/specimen/toys.js";
import { useCollection } from "@metreeca/tile/collection";
import { useCount } from "@metreeca/tile/count";
import { useMembers } from "@metreeca/tile/members";
import { text } from "@metreeca/tile/types/text";
import "../tile-widgets/index.css";


const entry = `${base}products/`;


/**
 * Creates the collection section.
 *
 * Hands one collection of toy products to a counter and to a list, so narrowing the collection narrows both.
 *
 * @returns The collection section
 */
export function Collection() {

	const collection = useCollection({ entry, shape: Products });

	const count = useCount(collection);

	const members = useMembers(collection, {
		model: { id: {}, sku: {}, label: { "*": {} }, stock: {} },
		order: { stock: "asc" },
		batch: 5
	});

	return <>

		<p>A collection held by the store is bound once with <code>useCollection</code>, and every lens over it is
			handed the result: the lenses share the criteria narrowing it, with no wiring between them. Narrow the
			products below and watch the counter and the list follow alike.</p>

		<div class="controls">
			<Button label="Used only" onClick={() => collection.filter({ "?condition": ["used"] })}/>
			<Button label="In stock" onClick={() => collection.filter({ ">=stock": 1 })}/>
			<Button look="subtle" label="Clear" onClick={() => collection.clear()}/>
		</div>

		<div class="samples">

			<Sample label="criteria">
				<pre><code>{JSON.stringify(collection.query, null, 2)}</code></pre>
			</Sample>

			<Sample label="count">{count({

				blank: () => <p>Counting…</p>,

				ready: ({ state }) => <p><strong>{state}</strong> products</p>,

				error: ({ state }) => <p>{state.status} {state.title}</p>

			})}</Sample>

			<Sample label="lowest stock">{members({

				blank: () => <p>Loading…</p>,

				ready: ({ state }) => <ol>{state.map(item =>
					<li key={item.id}><code>{item.sku}</code> {text.write(item.label)} ({item.stock})</li>
				)}</ol>,

				error: ({ state }) => <p>{state.status} {state.title}</p>

			})}</Sample>

		</div>

	</>;

}
