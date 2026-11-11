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

import { Infobox } from "@metreeca/clay-widgets/infobox";
import { base, Product } from "@metreeca/specimen/toys.js";
import { Sample } from "@metreeca/specimen/tile-widgets/sample.js";
import { useResource } from "@metreeca/tile/resource";
import { text } from "@metreeca/tile/types/text";
import { Frame } from "@metreeca/tile-widgets/frame";
import { FileIcon } from "lucide-preact";


const entry = `${base}products/AF-001`;
const missing = `${base}products/XX-000`;


/**
 * Creates the frames section.
 *
 * Shows a toy product retrieved from the store, beside a product the store finds missing.
 *
 * @returns The frames section
 */
export function Frames() {

	return <>

		<p>A frame shows a single resource held by the store, marking its area while the resource is retrieved and
			keeping it on show while a change is retrieved again. A resource the store finds missing is shown as a
			note in place of the frame.</p>

		<div class="samples">

			<Sample label="ready">
				<Item entry={entry}/>
			</Sample>

			<Sample label="missing">
				<Item entry={missing}/>
			</Sample>

		</div>

	</>;

}


/**
 * Shows a toy product as an infobox.
 */
function Item({

	entry

}: {

	entry: string

}) {

	const product = useResource({
		entry,
		shape: Product,
		model: {
			id: {},
			label: { "*": {} },
			comment: { "*": {} },
			sku: {},
			condition: {},
			price: {},
			stock: {},
			launched: {},
			vendor: { id: {}, label: {} }
		}
	});

	return <Frame resource={product} placeholder={<FileIcon/>}>{product => <>

		<h3>{text.write(product.label)}</h3>
		<p>{product.comment && text.write(product.comment)}</p>

		<Infobox>{{
			Code: product.sku,
			Vendor: product.vendor.label,
			Condition: product.condition,
			Price: product.price.toFixed(2),
			Stock: product.stock,
			Launched: product.launched
		}}</Infobox>

	</>}</Frame>;

}
