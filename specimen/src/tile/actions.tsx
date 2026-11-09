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
 * Actions samples.
 *
 * @module
 */

import { Button } from "@metreeca/clay-widgets/button";
import { Sample } from "@metreeca/specimen/tile-widgets/sample.js";
import { base, Categories } from "@metreeca/specimen/toys.js";
import { useActions } from "@metreeca/tile/actions";
import { useCollection } from "@metreeca/tile/collection";
import { useCount } from "@metreeca/tile/count";
import { useMembers } from "@metreeca/tile/members";
import { text } from "@metreeca/tile/types/text";
import "../tile-widgets/index.css";


const entry = `${base}categories/`;

/**
 * The codes of the categories the sample adds, kept apart from those of the dataset.
 */
const added = /^9\d{3}$/;


/**
 * Creates the actions section.
 *
 * Adds toy categories to their collection and removes them again, the list and the counter following on their own.
 *
 * @returns The actions section
 */
export function Actions() {

	const collection = useCollection({ entry, shape: Categories });

	const { create, delete: remove } = useActions(collection);

	const count = useCount(collection);

	const members = useMembers(collection, {
		model: { id: {}, code: {}, label: { "*": {} } },
		order: { code: "desc" },
		batch: 5
	});

	function add() {

		const code = String(9000+Math.floor(Math.random()*1000));

		void create({
			created: new Date().toISOString(),
			code,
			featured: false,
			label: { en: `New Category ${code}` },
			title: { en: `New Category ${code}` }
		});

	}

	return <>

		<p>A component bound with <code>useActions</code> adds items to a collection and removes them, with no word to
			the lenses showing it: the list of the latest categories and the counter beside it follow every change as
			the store signals it. Only the categories added here can be removed, and a reload brings the dataset back.</p>

		<div class="controls">
			<Button label="Add a category" onClick={add}/>
			<span>{count({ ready: ({ state }) => `${state} categories` })}</span>
		</div>

		<div class="samples">
			<Sample label="latest categories">{members({

				blank: () => <p>Loading…</p>,

				ready: ({ state }) => <ul>{state.map(item => <li key={item.id}>
					<code>{item.code}</code> {text.write(item.label)}{" "}
					{added.test(item.code) && <Button look="subtle" label="Remove" onClick={() => void remove(item.id)}/>}
				</li>)}</ul>,

				error: ({ state }) => <p>{state.status} {state.title}</p>

			})}</Sample>
		</div>

	</>;

}
