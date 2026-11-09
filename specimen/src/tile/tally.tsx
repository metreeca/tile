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

import { Button } from "@metreeca/clay-widgets/button";
import { Sample } from "@metreeca/specimen/tile-widgets/sample.js";
import { base, Products } from "@metreeca/specimen/toys.js";
import { useCollection } from "@metreeca/tile/collection";
import { useCount } from "@metreeca/tile/count";
import { useTally } from "@metreeca/tile/tally";
import "../tile-widgets/index.css";


const entry = `${base}products/`;


/**
 * Creates the tally section.
 *
 * Narrows the toy products by condition through plain checkboxes, each with the number of products holding it.
 *
 * @returns The tally section
 */
export function Tally() {

	const collection = useCollection({ entry, shape: Products });

	const tally = useTally(collection, "condition");
	const count = useCount(collection);

	return <>

		<p>A facet bound with <code>useTally</code> lists the values the items hold for an expression, each with the
			number of items holding it, and narrows every lens over the collection to the items holding the values
			ticked: tick a condition and watch the count follow.</p>

		<div class="samples">
			<Sample label={count({ ready: ({ state }) => `${state} products` }) ?? "products"}>{tally({

				blank: () => <p>Loading…</p>,

				ready: ({ state, select, clear }) => <>

					<ul>{state.map(bucket => <li key={String(bucket.value)}><label>
						<input type="checkbox" checked={bucket.selected}
							onChange={event => select(bucket.value, event.currentTarget.checked)}
						/>
						{" "}{bucket.label ?? String(bucket.value)} ({bucket.count})
					</label></li>)}</ul>

					<div class="controls">
						<Button look="subtle" label="Clear" onClick={clear}/>
					</div>

				</>,

				error: ({ state }) => <p>{state.status} {state.title}</p>

			})}</Sample>
		</div>

	</>;

}
