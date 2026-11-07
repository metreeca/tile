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

import { base, Product } from "@metreeca/specimen/toys.js";
import { useResource } from "@metreeca/tile/resource";
import { text } from "@metreeca/tile/types/text";
import { Frame } from "@metreeca/tile-widgets/viewers/frame";
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
			keeping it on show while a change is retrieved again.</p>

		<Sample entry={entry}/>

		<p>A resource the store finds missing is shown as a note in place of the frame.</p>

		<Sample entry={missing}/>

	</>;

}


/**
 * Shows a toy product.
 */
function Sample({

	entry

}: {

	entry: string

}) {

	const product = useResource({
		entry,
		shape: Product,
		model: { id: {}, label: { "*": {} }, comment: { "*": {} } }
	});

	return <Frame resource={product} placeholder={<FileIcon/>}>{product => <>
		<h2>{text.write(product.label)}</h2>
		<p>{product.comment && text.write(product.comment)}</p>
	</>}</Frame>;

}
