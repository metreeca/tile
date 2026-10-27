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
import { isNumber, isObject, isString } from "@metreeca/core";
import { by, locale, reverse } from "@metreeca/core/order";
import { getIRIBase } from "@metreeca/core/resource";
import { createFetch } from "@metreeca/http";
import { mock } from "@metreeca/http/mock";
import { decodeTemplate } from "@metreeca/qest/model";
import { Button } from "@metreeca/tile-cell/button";
import { Icon } from "@metreeca/tile-cell/icon";
import { More } from "@metreeca/tile-cell/more";
import { Fetch } from "@metreeca/tile-data/fetch";
import { type Collection, Store, useCollection, useKeywords, useMembers, useQuery } from "@metreeca/tile-data/store";
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
 * Answers a collection query over the sample items, narrowed by label keywords, sorted and limited as the query asks.
 */
async function serve(request: Request): Promise<Response> {

	const query = decodeTemplate(new URL(request.url).search.slice(1), { base: getIRIBase(entry) });
	const members: { readonly [key: string]: unknown } = isObject(query.members) ? query.members : {};

	const keywords = isString(members["~label"]) ? members["~label"].toLowerCase() : "";
	const order = members["^label"] === "desc" ? reverse(byLabel) : byLabel;
	const limit = isNumber(members["#"]) && members["#"] > 0 ? members["#"] : items.length;

	return Response.json({
		members: items.filter(({ label }) => label.toLowerCase().includes(keywords)).sort(order).slice(0, limit)
	});

}


/**
 * Creates the sheets section.
 *
 * Shows a collection listed a batch at a time from a store answering after a delay, growing as the reader scrolls to
 * its end, narrowed by keywords kept in the location, and starting again from the first items when the order changes.
 *
 * @returns The sheets section
 */
export function Sheets() {

	const [query, setQuery] = useQuery();

	const collection = useCollection({ entry, shape: Catalogue, sieve: query, onChange: setQuery });

	return <Fetch fetch={createFetch(mock({ serve, delay: 1000 }))}>

		<Store>

			<p>A sheet lists the members of a collection held by the store, closed by a trigger fetching the next
				batch as the reader scrolls to it, and starts again from the first items when the order changes. The
				keywords narrowing it are kept in the location, so they survive a reload.</p>

			<Listing collection={collection}/>

		</Store>

	</Fetch>;

}


/**
 * Lists the sample collection, narrowed and sorted as the reader picks.
 */
function Listing({

	collection

}: {

	collection: Collection<typeof Catalogue, "members">

}) {

	const [order, setOrder] = useState<"asc" | "desc">("asc");

	const members = useMembers(collection, { model: { id: {}, label: {} }, order: { label: order } });
	const { text, search, commit } = useKeywords(collection, "label");

	return <>

		<div class="controls">
			<input type="search" placeholder="Keywords" value={text}
				onInput={event => search(event.currentTarget.value)}
				onKeyDown={event => event.key === "Enter" && commit()}
			/>
			<Button
				icon={order === "asc" ? <Icon.Increasing/> : <Icon.Decreasing/>}
				label={order === "asc" ? "Increasing" : "Decreasing"}
				onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
			/>
		</div>

		<Sheet members={members} placeholder={<Icon.List/>}>{item =>
			<div>{item.label}</div>
		}</Sheet>

		{members({ ready: ({ load }) => load && <More onLoad={load}/> })}

	</>;

}
