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
 * Range samples.
 *
 * @module
 */

import { Button } from "@metreeca/clay-widgets/button";
import { Sample } from "@metreeca/specimen/tile-widgets/sample.js";
import { base, Products } from "@metreeca/specimen/toys.js";
import { useCollection } from "@metreeca/tile/collection";
import { useCount } from "@metreeca/tile/count";
import { useRange } from "@metreeca/tile/range";
import "../tile-widgets/index.css";


const entry = `${base}products/`;


/**
 * Creates the range section.
 *
 * Narrows the toy products by price through two plain number fields, suggesting the lowest and highest prices.
 *
 * @returns The range section
 */
export function Range() {

	const collection = useCollection({ entry, shape: Products });

	const range = useRange(collection, "price");
	const count = useCount(collection);

	return <>

		<p>A control bound with <code>useRange</code> shows the lowest and highest values the items hold for an
			expression and narrows every lens over the collection to the items falling between the bounds it sets:
			type a bound and press <code>Enter</code>, and watch the count and the other bound's suggestion follow.</p>

		<div class="samples">
			<Sample label={count({ ready: ({ state }) => `${state} products` }) ?? "products"}>{range({

				blank: () => <p>Loading…</p>,

				ready: ({ state: { min, max }, lower, upper, narrow, clear }) => <div class="controls">

					<label>From{" "}
						<input type="number" placeholder={String(min ?? "")} value={String(lower ?? "")}
							onChange={event => narrow({ lower: bound(event.currentTarget.value) })}
						/>
					</label>

					<label>To{" "}
						<input type="number" placeholder={String(max ?? "")} value={String(upper ?? "")}
							onChange={event => narrow({ upper: bound(event.currentTarget.value) })}
						/>
					</label>

					<Button look="subtle" label="Clear" onClick={clear}/>

				</div>,

				error: ({ state }) => <p>{state.status} {state.title}</p>

			})}</Sample>
		</div>

	</>;

}


/**
 * Reads a bound off a number field, an empty field clearing it.
 */
function bound(value: string): null | number {
	return value.trim() === "" ? null : Number(value);
}
