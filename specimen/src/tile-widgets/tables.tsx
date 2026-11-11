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
 * Table samples.
 *
 * @module
 */

import { Sample } from "@metreeca/specimen/tile-widgets/sample.js";
import { base, Products } from "@metreeca/specimen/toys.js";
import { type Collection, useCollection } from "@metreeca/tile/collection";
import { useMembers } from "@metreeca/tile/members";
import { text } from "@metreeca/tile/types/text";
import { Table } from "@metreeca/tile-widgets/table";
import { TableIcon } from "lucide-preact";


const entry = `${base}products/`;


/**
 * Creates the tables section.
 *
 * @returns The tables section
 */
export function Tables() {

	const collection = useCollection({ entry, shape: Products, scope: { ">=price": 60 } });

	return <>

		<p>A table shows the members of a collection one row per item, here the products priced 60 or more, sorted on
			any sortable column by its header. Grouped by vendor, each vendor is shown once, staying in view while its products scroll past.</p>

		<Listing collection={collection}/>

	</>;

}


function Listing({

	collection

}: {

	collection: Collection<typeof Products, "members">

}) {

	const members = useMembers(collection, {
		model: { id: {}, sku: {}, label: { "*": {} }, price: {}, stock: {}, vendor: { id: {}, label: {} } },
		order: { "vendor.label": "asc" }
	});

	return <>

		<div class="samples">
			<Sample>

				<Table name="Products" hierarchy link={false} members={members} placeholder={<TableIcon/>} columns={{
					Vendor: { sort: "vendor.label", render: item => item.vendor.label },
					Code: { sort: "sku", render: item => item.sku },
					Product: { sort: "name", render: item => text.write(item.label) },
					Price: { sort: "price", align: "end", render: item => item.price.toFixed(2) },
					Stock: { sort: "stock", align: "end", render: item => item.stock }
				}}/>

			</Sample>
		</div>

	</>;

}
