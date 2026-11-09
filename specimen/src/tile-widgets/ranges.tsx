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
 * Range samples.
 *
 * @module
 */

import { entry, Faceted } from "@metreeca/specimen/tile-widgets/facets.js";
import { Products } from "@metreeca/specimen/toys.js";
import { useCollection } from "@metreeca/tile/collection";
import { useRange } from "@metreeca/tile/range";
import { date } from "@metreeca/tile/types/date";
import { decimal } from "@metreeca/tile/types/decimal";
import { Range } from "@metreeca/tile-widgets/filters/range";


/**
 * Creates the ranges section.
 *
 * Shows the toy products narrowed by ranges over their price and launch date.
 *
 * @returns The ranges section
 */
export function Ranges() {

	const collection = useCollection({ entry, shape: Products });

	return <>

		<p>A range narrows a collection to the items whose values fall between the bounds the reader sets, suggesting
			the lowest and highest values on offer. The other ranges follow the bounds set, the counter tells how many
			products match, and the table lists them.</p>

		<Faceted collection={collection}>
			<Range name="Price" type={decimal} range={useRange(collection, "price")}/>
			<Range name="Launched" compact type={date} range={useRange(collection, "launched")}/>
		</Faceted>

	</>;

}
