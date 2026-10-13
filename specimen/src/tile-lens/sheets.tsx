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
 * Sheet samples.
 *
 * @module
 */

import { reference } from "@metreeca/blue/reference";
import { id, multiple, required, resource } from "@metreeca/blue/resource";
import { string } from "@metreeca/blue/string";
import { isNumber, isObject } from "@metreeca/core";
import { getIRIBase } from "@metreeca/core/resource";
import { createFetch } from "@metreeca/http";
import { mock } from "@metreeca/http/mock";
import { decodeTemplate } from "@metreeca/qest/model";
import { Button } from "@metreeca/tile-cell/button";
import { Icon } from "@metreeca/tile-cell/icon";
import { Fetch } from "@metreeca/tile-data/fetch";
import { Store } from "@metreeca/tile-data/store";
import { Sheet } from "@metreeca/tile-lens/sheet";
import { useState } from "preact/hooks";


const entry = "https://example.com/catalogue/";

const Item = resource({ id: id(), label: required(string()) });
const Catalogue = resource({ id: id(), members: multiple(reference(Item)) });

/*
 * The two orders are declared once, so the list is handed the same model on every render and a new one only when the
 * reader switches order.
 */

const Increasing = { members: { id: {}, label: {}, "^label": "asc" } } as const; // ;(literal) the order keeps its literal type
const Decreasing = { members: { id: {}, label: {}, "^label": "desc" } } as const; // ;(literal) as above

const items = Array.from({ length: 1000 }, (_, index) => ({
	id: `${entry}${index + 1}`,
	label: `Item ${String(index + 1).padStart(4, "0")}`
}));


/**
 * Answers a collection query over the sample items, sorted and sliced as the query asks, with no member the query
 * didn't ask for, or their count if the query asks for it.
 */
async function serve(request: Request): Promise<Response> {

	const query = decodeTemplate(new URL(request.url).search.slice(1), { base: getIRIBase(entry) });
	const members: { readonly [key: string]: unknown } = isObject(query.members) ? query.members : {};

	const order = members["^label"] === "desc" ? -1 : 1;
	const offset = isNumber(members["@"]) ? members["@"] : 0;
	const limit = isNumber(members["#"]) && members["#"] > 0 ? members["#"] : items.length;

	return Response.json({
		members: "count=count:" in members ? [{ count: items.length }] : [...items]
			.sort((x, y) => order * x.label.localeCompare(y.label))
			.slice(offset, offset + limit)
	});

}


/**
 * Creates the sheets section.
 *
 * Shows a collection listed a window at a time from a store answering after a delay, and a list starting again from the
 * first items when the order changes.
 *
 * @returns The sheets section
 */
export function Sheets() {

	const [model, setModel] = useState<typeof Increasing | typeof Decreasing>(Increasing);

	return <Fetch fetch={createFetch(mock({ serve, delay: 1000 }))}>

		<Store>

			<p>A sheet lists the items of a collection held by the store, fetching only the items in view and the batches
				around them while taking the room of the whole collection, and starts again from the first items when it
				is handed a new model, as when the order changes.</p>

			<div class="controls">
				<Button
					icon={model === Increasing ? <Icon.Increasing/> : <Icon.Decreasing/>}
					label={model === Increasing ? "Increasing" : "Decreasing"}
					onClick={() => setModel(model === Increasing ? Decreasing : Increasing)}
				/>
			</div>

			<Sheet entry={entry} model={model} placeholder={<Icon.List/>} shape={Catalogue}>{item =>
				<div>{item.label}</div>
			}</Sheet>

		</Store>

	</Fetch>;

}
