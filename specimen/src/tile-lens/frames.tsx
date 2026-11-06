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
 * Frame samples.
 *
 * @module
 */

import { id, required, resource } from "@metreeca/blue/resource";
import { string } from "@metreeca/blue/string";
import { createFetch } from "@metreeca/http";
import { mock } from "@metreeca/http/mock";
import { Icon } from "@metreeca/tile-cell/icon";
import { Fetch } from "@metreeca/tile/fetch";
import { Store, useResource } from "@metreeca/tile/store";
import { Frame } from "@metreeca/tile-lens/frame";


const entry = "https://example.com/catalogue/1";
const missing = "https://example.com/catalogue/0";

const Item = resource({ id: id(), label: required(string()), comment: required(string()) });


/**
 * Answers a resource query for the sample item, and finds any other resource missing.
 */
async function serve(request: Request): Promise<Response> {
	return new URL(request.url).pathname === new URL(entry).pathname
		? Response.json({ id: entry, label: "Item 0001", comment: "The first item of the catalogue." })
		: new Response(null, { status: 404 });
}


/**
 * Creates the frames section.
 *
 * Shows a resource retrieved from a store answering after a delay, beside a resource the store finds missing.
 *
 * @returns The frames section
 */
export function Frames() {

	return <Fetch fetch={createFetch(mock({ serve, delay: 1000 }))}>

		<Store>

			<p>A frame shows a single resource held by the store, marking its area while the resource is retrieved and
				keeping it on show while a change is retrieved again.</p>

			<Sample entry={entry}/>

			<p>A resource the store finds missing is shown as a note in place of the frame.</p>

			<Sample entry={missing}/>

		</Store>

	</Fetch>;

}


/**
 * Shows a sample resource.
 */
function Sample({

	entry

}: {

	entry: string

}) {

	const item = useResource({ entry, shape: Item, model: { id: {}, label: {}, comment: {} } });

	return <Frame resource={item} placeholder={<Icon.File/>}>{item => <>
		<h2>{item.label}</h2>
		<p>{item.comment}</p>
	</>}</Frame>;

}
