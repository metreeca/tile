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
 * Resource samples.
 *
 * @module
 */

import { Button } from "@metreeca/clay-widgets/button";
import { Sample } from "@metreeca/specimen/tile-widgets/sample.js";
import { base, Category } from "@metreeca/specimen/toys.js";
import { useResource } from "@metreeca/tile/resource";
import { text } from "@metreeca/tile/types/text";
import "../tile-widgets/index.css";


/**
 * Creates the resource section.
 *
 * Binds two views to the same toy category, so a change written through one shows in both, beside a category the
 * store finds missing.
 *
 * @returns The resource section
 */
export function Resource() {

	return <>

		<p>A component bound to a resource with <code>useResource</code> renders what the store holds and writes changes
			back through it, with no exchange of its own: feature the category in either view and watch both follow, as
			the store signals the change to every binding. A missing resource lands in the error case, with the way to
			retry.</p>

		<div class="samples">

			<Sample label="first view">
				<Item entry={`${base}categories/1000`}/>
			</Sample>

			<Sample label="second view">
				<Item entry={`${base}categories/1000`}/>
			</Sample>

			<Sample label="missing">
				<Item entry={`${base}categories/9999`}/>
			</Sample>

		</div>

	</>;

}


/**
 * Shows a toy category with the way to feature it.
 */
function Item({

	entry

}: {

	entry: string

}) {

	const category = useResource({
		entry,
		shape: Category,
		model: {
			id: {},
			created: {},
			label: { "*": {} },
			comment: { "*": {} },
			featured: {},
			code: {},
			title: { "*": {} },
			description: { "*": {} },
			broader: {},
			upper: {}
		}
	});

	return category({

		blank: () => <p>Loading…</p>,

		ready: ({ state, update }) => <>
			<strong>{text.write(state.label)}</strong>
			<p>{state.featured ? "Featured" : "Not featured"}</p>
			<div class="controls">
				<Button
					label={state.featured ? "Unfeature" : "Feature"}
					onClick={() => void update({ ...state, featured: !state.featured })}
				/>
			</div>
		</>,

		error: ({ state, reload }) => <>
			<p>{state.status} {state.title}</p>
			<div class="controls">
				<Button label="Retry" onClick={() => void reload()}/>
			</div>
		</>

	});

}
