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
import { by, locale, reverse } from "@metreeca/core/order";
import { getIRIBase } from "@metreeca/core/resource";
import { createFetch } from "@metreeca/http";
import { mock } from "@metreeca/http/mock";
import { decodeTemplate } from "@metreeca/qest/model";
import { Button } from "@metreeca/tile-cell/button";
import { Icon } from "@metreeca/tile-cell/icon";
import { More } from "@metreeca/tile-cell/more";
import { Fetch } from "@metreeca/tile-data/fetch";
import { type Collection, Store, useCollection, useWindow } from "@metreeca/tile-data/store";
import { Sheet } from "@metreeca/tile-lens/sheet";
import { useState } from "preact/hooks";


const entry = "https://example.com/catalogue/";

const Item = resource({ id: id(), label: required(string()) });
const Catalogue = resource({ id: id(), members: multiple(reference(Item)) });

const items = Array.from({ length: 1000 }, (_, index) => ({
	id: `${entry}${index + 1}`,
	label: `Item ${String(index + 1).padStart(4, "0")}`
}));

const byLabel = by((item: { readonly label: string }) => item.label, locale());


/**
 * Answers a collection query over the sample items, sorted and limited as the query asks.
 */
async function serve(request: Request): Promise<Response> {

	const query = decodeTemplate(new URL(request.url).search.slice(1), { base: getIRIBase(entry) });
	const members: { readonly [key: string]: unknown } = isObject(query.members) ? query.members : {};

	const order = members["^label"] === "desc" ? reverse(byLabel) : byLabel;
	const limit = isNumber(members["#"]) && members["#"] > 0 ? members["#"] : items.length;

	return Response.json({
		members: [...items].sort(order).slice(0, limit)
	});

}


/**
 * Creates the sheets section.
 *
 * Shows a collection listed a batch at a time from a store answering after a delay, growing as the reader scrolls to
 * its end, and a list starting again from the first items when the order changes.
 *
 * @returns The sheets section
 */
export function Sheets() {

	const collection = useCollection({ entry, shape: Catalogue });

	return <Fetch fetch={createFetch(mock({ serve, delay: 1000 }))}>

		<Store>

			<p>A sheet lists the items of a collection window held by the store, closed by a trigger fetching the next
				batch as the reader scrolls to it, and starts again from the first items when the order changes.</p>

			<Listing collection={collection}/>

		</Store>

	</Fetch>;

}


/**
 * Lists the sample collection, sorted as the reader picks.
 */
function Listing({

	collection

}: {

	collection: Collection<typeof Catalogue, "members">

}) {

	const [order, setOrder] = useState<"asc" | "desc">("asc");

	const window = useWindow(collection, { model: { id: {}, label: {} }, order: { label: order } });

	return <>

		<div class="controls">
			<Button
				icon={order === "asc" ? <Icon.Increasing/> : <Icon.Decreasing/>}
				label={order === "asc" ? "Increasing" : "Decreasing"}
				onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
			/>
		</div>

		<Sheet window={window} placeholder={<Icon.List/>}>{item =>
			<div>{item.label}</div>
		}</Sheet>

		{window({ ready: ({ more }) => more && <More onLoad={more}/> })}

	</>;

}
