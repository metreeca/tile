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

import { tile } from "@metreeca/tile";
import "./index.css";


/**
 * Creates the tables section.
 *
 * Shows what a plain table is given: rows alternating against the stripe, cells padded from the spacing ladder, and a
 * trailing empty header taking the width the named columns leave.
 *
 * @returns The tables section
 */
export function Tables() {
	return <>

		<p>Rows alternate against the stripe background, cells are padded from the spacing scale, and a trailing empty
			header takes the width the named columns leave, so they stay as narrow as their content.</p>

		<table>

			<thead>
				<tr>
					<th>Token</th>
					<th>Kind</th>
					<th/>
				</tr>
			</thead>

			<tbody>
				<tr>
					<td><code>{tile.colorStrong}</code></td>
					<td>anchor</td>
					<td>carries the accent a mark is made in</td>
				</tr>
				<tr>
					<td><code>{tile.colorHover}</code></td>
					<td>role</td>
					<td>derived from the anchor above</td>
				</tr>
				<tr>
					<td><code>{tile.spacing050}</code></td>
					<td>scale</td>
					<td>pads these cells</td>
				</tr>
			</tbody>

		</table>

	</>;
}
