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
 * Facet sample frame.
 *
 * @module
 */

import { Strip } from "@metreeca/clay-widgets/strip";
import { base, Products } from "@metreeca/specimen/toys.js";
import type { Collection } from "@metreeca/tile/collection";
import { useCount } from "@metreeca/tile/count";
import { useMembers } from "@metreeca/tile/members";
import { text } from "@metreeca/tile/types/text";
import { Clear } from "@metreeca/tile-widgets/filters/clear";
import { Facets } from "@metreeca/tile-widgets/filters/facets";
import { Count } from "@metreeca/tile-widgets/viewers/count";
import { Table } from "@metreeca/tile-widgets/viewers/table";
import { TableIcon } from "lucide-preact";
import type { ComponentChildren } from "preact";


/**
 * The collection of toy products the facet samples narrow.
 */
export const entry = `${base}products/`;


/**
 * Creates a facet sample frame.
 *
 * Shows the facets beside the toy products they narrow, under a strip telling how many products match and offering
 * to clear every filter at once.
 *
 * @param options The frame configuration
 *
 * @returns The facet sample frame
 */
export function Faceted({

	collection,

	children

}: {

	/**
	 * The collection of toy products the facets narrow.
	 */
	collection: Collection<typeof Products, "members">

	/**
	 * The facets narrowing the collection.
	 */
	children: ComponentChildren

}) {

	return <>

		<Strip look="strong" place="spread" align="center">
			<Count collection={collection} count={useCount(collection)}/>
			<Clear collection={collection}/>
		</Strip>

		<div class="facets">
			<Facets>{children}</Facets>
			<Listing collection={collection}/>
		</div>

	</>;

}


/**
 * Lists the first dozen toy products matching the facets, by name.
 */
function Listing({

	collection

}: {

	collection: Collection<typeof Products, "members">

}) {

	const members = useMembers(collection, {
		model: { id: {}, sku: {}, label: { "*": {} }, price: {}, vendor: { id: {}, label: {} } },
		order: { name: "asc" },
		batch: 12
	});

	return <section>

		<Table name="Products" link={false} members={members} placeholder={<TableIcon/>} columns={{
			Product: { sort: "name", render: item => text.write(item.label) },
			Vendor: { sort: "vendor.label", render: item => item.vendor.label },
			Price: { sort: "price", align: "end", render: item => item.price.toFixed(2) }
		}}/>

	</section>;

}
