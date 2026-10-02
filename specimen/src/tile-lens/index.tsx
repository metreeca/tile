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

import { Page } from "@metreeca/specimen/index.core.js";
import { Sheets } from "@metreeca/specimen/tile-lens/sheets.js";
import { Link } from "@metreeca/tile-cell/link";
import { Routes } from "@metreeca/tile-data/router";
import "@metreeca/specimen/tile-cell/index.css";


export const TileLensPath = "/tile-lens/";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function TileLens() {

	const sections = {

		Sheet: <Sheets/>

	};

	const path = (label: string) => label.toLowerCase();

	return <Page

		tray={<>

			{Object.keys(sections).map(label =>
				<Link key={label} active look="subtle" href={`${TileLensPath}${path(label)}`}>{label}</Link>
			)}

		</>}
	>

		<Routes>{{

			"/": `/${path("Sheet")}`,

			...Object.fromEntries(Object.entries(sections).map(([label, view]) => [`/${path(label)}`, view]))

		}}</Routes>

	</Page>;

}
