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
 * Store samples.
 *
 * @module
 */

import { Button } from "@metreeca/clay-widgets/button";
import { Sample } from "@metreeca/specimen/tile-widgets/sample.js";
import { base, Product } from "@metreeca/specimen/toys.js";
import { useStore } from "@metreeca/tile";
import { text } from "@metreeca/tile/types/text";
import { useState } from "preact/hooks";
import "../tile-widgets/index.css";


const entry = `${base}products/AF-001`;


/**
 * Creates the store section.
 *
 * Retrieves a toy product straight from the shared store, showing what each retrieval answered and how long it took.
 *
 * @returns The store section
 */
export function Store() {

	const store = useStore();

	const [answers, setAnswers] = useState<readonly string[]>([]);

	function retrieve() {

		const started = performance.now();

		void store.lookup({ entry, shape: Product, model: { id: {}, label: { "*": {} } } }).then(product => setAnswers(answers => [
			`${product ? text.write(product.label) : "missing"} in ${Math.round(performance.now()-started)} ms`,
			...answers
		].slice(0, 3)));

	}

	return <>

		<p>The page is assembled with one shared store, configured once with <code>Store</code> and reached anywhere
			below it with <code>useStore</code>; here it holds the toys dataset in memory. Localised values come back in
			the languages the reader prefers, so the product label below reads in the language of the browser.</p>

		<div class="controls">
			<Button label="Retrieve a product" onClick={retrieve}/>
		</div>

		{answers.length > 0 && <div class="samples">
			<Sample label="retrievals">
				<ul>{answers.map((answer, index) => <li key={`${index}:${answer}`}><code>{answer}</code></li>)}</ul>
			</Sample>
		</div>}

	</>;

}
