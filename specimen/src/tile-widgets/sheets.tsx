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

import { Card } from "@metreeca/clay-widgets/card";
import { Sample } from "@metreeca/specimen/tile-widgets/sample.js";
import { base, Products } from "@metreeca/specimen/toys.js";
import { useCollection } from "@metreeca/tile/collection";
import { useMembers } from "@metreeca/tile/members";
import { text } from "@metreeca/tile/types/text";
import { Sheet } from "@metreeca/tile-widgets/viewers/sheet";
import { BikeIcon, BlocksIcon, DicesIcon, ListIcon, ShieldIcon, SparklesIcon } from "lucide-preact";


const entry = `${base}products/`;

const price = new Intl.NumberFormat("en", { style: "currency", currency: "EUR" });

const glyphs: Readonly<Record<string, typeof SparklesIcon>> = {
	AF: ShieldIcon,
	BG: DicesIcon,
	BS: BlocksIcon,
	OT: BikeIcon
};


/**
 * Creates the sheets section.
 *
 * Shows the premium toy products as a gallery of cards.
 *
 * @returns The sheets section
 */
export function Sheets() {

	const collection = useCollection({ entry, shape: Products, scope: { ">=price": 80 } });

	const members = useMembers(collection, {
		model: {
			id: {},
			sku: {},
			label: { "*": {} },
			comment: { "*": {} },
			condition: {},
			price: {},
			change: {},
			stock: {},
			vendor: { id: {}, label: {} },
			reviews: { rating: {} }
		},
		order: { name: "asc" }
	});

	return <>

		<p>A sheet lists the members of a collection held by the store, rendering each as the screen sees fit, here as
			a gallery of cards for the products priced 80 or more.</p>

		<div class="samples">
			<Sample>

				<Sheet members={members} placeholder={<ListIcon/>}>{item => {

					const Glyph = glyphs[item.sku.slice(0, 2)] ?? SparklesIcon;

					return <Card look="strong"
						title={text.write(item.label)}
						badge={<Price value={item.price} change={item.change}/>}
						image={<Glyph/>}
					>

						{item.comment && <p>{text.write(item.comment)}</p>}

						<small>
							<Rating values={(item.reviews ?? []).map(review => review.rating)}/>
							<span>{item.vendor.label}</span>
							{item.condition !== "new" && <span>{item.condition}</span>}
							<Stock value={item.stock}/>
						</small>

					</Card>;

				}}</Sheet>

			</Sample>
		</div>

	</>;

}


/**
 * Shows a price beside its latest change, marked as rising or falling.
 */
function Price({

	value,
	change

}: {

	value: number
	change?: number

}) {

	return <span class="price">
		{price.format(value)}
		{change !== undefined && change !== 0 && <em class={change > 0 ? "rising" : "falling"}>
			{change > 0 ? "▲" : "▼"} {Math.abs(change).toFixed(1)}%
		</em>}
	</span>;

}

/**
 * Shows the average of review ratings as a run of five stars, or nothing for an item no one reviewed.
 */
function Rating({

	values

}: {

	values: readonly number[]

}) {

	const average = values.length === 0 ? 0 : Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);

	return values.length > 0 && <span class="rating" title={`${values.length} reviews`}>
		{"★".repeat(average)}{"☆".repeat(5 - average)}
	</span>;

}

/**
 * Shows how many items are in stock, telling sold out and back-ordered items apart.
 */
function Stock({

	value

}: {

	value: number

}) {

	return value > 0 ? <span class="stock">{value} in stock</span>
		: value === 0 ? <span class="stock" data-out="">sold out</span>
			: <span class="stock" data-out="">back soon</span>;

}
