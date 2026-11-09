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

import { Button } from "@metreeca/clay-widgets/button";
import { More } from "@metreeca/clay-widgets/more";
import { Sample } from "@metreeca/specimen/tile-widgets/sample.js";
import { base, Products } from "@metreeca/specimen/toys.js";
import { type Collection, useCollection } from "@metreeca/tile/collection";
import { useKeywords } from "@metreeca/tile/keywords";
import { useMembers } from "@metreeca/tile/members";
import { useQuery } from "@metreeca/tile/query";
import { text } from "@metreeca/tile/types/text";
import { Sheet } from "@metreeca/tile-widgets/viewers/sheet";
import { ChevronDownIcon, ChevronUpIcon, ListIcon } from "lucide-preact";
import { useEffect, useState } from "preact/hooks";


const entry = `${base}products/`;


/**
 * Creates the sheets section.
 *
 * Shows the toy products listed a batch at a time, growing as the reader scrolls to the end, narrowed by keywords kept
 * in the location, and starting again from the first products when the order changes.
 *
 * @returns The sheets section
 */
export function Sheets() {

	const [query, setQuery] = useQuery();

	const collection = useCollection({ entry, shape: Products, query, onChange: setQuery });

	return <>

		<p>A sheet lists the members of a collection held by the store, closed by a trigger fetching the next batch as
			the reader scrolls to it, and starts again from the first items when the order changes. The keywords
			narrowing it are kept in the location, so they survive a reload.</p>

		<Listing collection={collection}/>

	</>;

}


/**
 * Lists the toy products by name, narrowed and sorted as the reader picks.
 */
function Listing({

	collection

}: {

	collection: Collection<typeof Products, "members">

}) {

	const [order, setOrder] = useState<"asc" | "desc">("asc");

	const members = useMembers(collection, {
		model: { id: {}, sku: {}, label: { "*": {} } },
		order: { name: order },
		batch: 20
	});

	const { text: keywords, search } = useKeywords(collection, "name");

	// the box holds the text as typed and follows the keywords whenever they change elsewhere

	const [draft, setDraft] = useState(keywords);

	useEffect(() => setDraft(keywords), [keywords]);

	return <>

		<div class="controls">
			<input type="search" placeholder="Keywords" value={draft}
				onInput={event => setDraft(event.currentTarget.value)}
				onKeyDown={event => event.key === "Enter" && search(draft)}
			/>
			<Button
				icon={order === "asc" ? <ChevronDownIcon/> : <ChevronUpIcon/>}
				label={order === "asc" ? "Increasing" : "Decreasing"}
				onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
			/>
		</div>

		<div class="samples">
			<Sample label="sorted by name">

				<Sheet members={members} placeholder={<ListIcon/>}>{item =>
					<div><code>{item.sku}</code> {text.write(item.label)}</div>
				}</Sheet>

				{members({ ready: ({ load }) => load && <More onLoad={load}/> })}

			</Sample>
		</div>

	</>;

}
