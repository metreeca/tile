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

import { Button } from "@metreeca/clay-widgets/button";
import { Sample } from "@metreeca/specimen/tile-widgets/sample.js";
import { base, Products } from "@metreeca/specimen/toys.js";
import { useCollection } from "@metreeca/tile/collection";
import { useSearch } from "@metreeca/tile/search";
import { useMembers } from "@metreeca/tile/members";
import { text } from "@metreeca/tile/types/text";
import { useState } from "preact/hooks";
import "../tile-widgets/index.css";


const entry = `${base}products/`;


/**
 * Creates the search section.
 *
 * Narrows the toy products to those whose name holds the text typed in a plain search box.
 *
 * @returns The search section
 */
export function Search() {

	const collection = useCollection({ entry, shape: Products });

	const search = useSearch(collection, "name");

	const [draft, setDraft] = useState(search.text);

	const members = useMembers(collection, {
		model: { id: {}, sku: {}, label: { "*": {} } },
		order: { name: "asc" },
		batch: 5
	});

	return <>

		<p>A search box bound with <code>useSearch</code> narrows every lens over the collection to the items whose
			name holds the text, here the first five products. When to submit the text is the box's own
			call: this one waits for <code>Enter</code>, and clearing the collection elsewhere empties it.</p>

		<div class="controls">
			<input type="search" placeholder="Search" value={draft}
				onInput={event => setDraft(event.currentTarget.value)}
				onKeyDown={event => event.key === "Enter" && search.submit(draft)}
			/>
			<Button look="subtle" label="Clear" onClick={() => {
				setDraft("");
				search.submit("");
			}}/>
		</div>

		<div class="samples">
			<Sample label={search.text ? `matching "${search.text}"` : "no search"}>{members({

				blank: () => <p>Loading…</p>,

				ready: ({ state }) => state.length > 0
					? <ol>{state.map(item => <li key={item.id}><code>{item.sku}</code> {text.write(item.label)}</li>)}</ol>
					: <p>No matches</p>,

				error: ({ state }) => <p>{state.status} {state.title}</p>

			})}</Sample>
		</div>

	</>;

}
