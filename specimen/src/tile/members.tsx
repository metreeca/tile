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
 * Members samples.
 *
 * @module
 */

import { Button } from "@metreeca/clay-widgets/button";
import { Sample } from "@metreeca/specimen/tile-widgets/sample.js";
import { base, Products } from "@metreeca/specimen/toys.js";
import { useCollection } from "@metreeca/tile/collection";
import { useMembers } from "@metreeca/tile/members";
import { text } from "@metreeca/tile/types/text";
import "../tile-widgets/index.css";


const entry = `${base}products/`;


/**
 * Creates the members section.
 *
 * Lists the toy products five at a time, growing on request and sorted either way by name.
 *
 * @returns The members section
 */
export function Members() {

	const collection = useCollection({ entry, shape: Products });

	const members = useMembers(collection, {
		model: { id: {}, sku: {}, label: { "*": {} } },
		order: { name: "asc" },
		batch: 5
	});

	return <>

		<p>A list bound with <code>useMembers</code> shows the items of a collection a batch at a time, here five,
			retrieving one more batch on request and starting over from the first one as the order changes.</p>

		{members({

			blank: () => <p>Loading…</p>,

			ready: ({ state, order, sort, reset, load }) => <>

				<div class="controls">
					<Button label="Load more" disabled={!load} onClick={() => load?.()}/>
					<Button label="Reverse" onClick={() => sort({ name: order.name === "desc" ? "asc" : "desc" })}/>
					<Button look="subtle" label="Reset" disabled={!reset} onClick={() => reset?.()}/>
				</div>

				<div class="samples">
					<Sample label={`${state.length} items, ${order.name === "desc" ? "decreasing" : "increasing"}`}>
						<ol>{state.map(item => <li key={item.id}><code>{item.sku}</code> {text.write(item.label)}</li>)}</ol>
					</Sample>
				</div>

			</>,

			error: ({ state, reload }) => <div class="controls">
				<span>{state.status} {state.title}</span>
				<Button label="Retry" onClick={() => void reload()}/>
			</div>

		})}

	</>;

}
