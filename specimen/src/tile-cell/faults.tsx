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
 * Fault samples.
 *
 * @module
 */

import { NotFound, UnprocessableContent } from "@metreeca/http";
import { Fault } from "@metreeca/tile-cell/fault";
import "./index.css";


/**
 * Creates the faults section.
 *
 * Shows the notices a screen fills a failed area with, told in the reader's terms or carrying what the source sent.
 *
 * @returns The faults section
 */
export function Faults() {
	return <>

		<p>A fault shows problem details as a note: a failure the reader can act on is told in their own terms and
			left at that, while an unexpected one carries the explanation and the data the source sent along.</p>

		<div class="notes">

			<Fault status={NotFound}/>

			<Fault detail="The submitted product failed validation." report={{

				price: [ "expected a value of at least <0>" ],
				label: [ "expected at most <1> value" ]

			}} status={UnprocessableContent} title="Unprocessable Content"/>

		</div>

	</>;
}
