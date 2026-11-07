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

import { Routes, useRoute } from "@metreeca/clay/router";
import { Page } from "@metreeca/specimen/index.core.js";
import { Frames } from "@metreeca/specimen/tile-widgets/frames.js";
import { Sheets } from "@metreeca/specimen/tile-widgets/sheets.js";
import { Tables } from "@metreeca/specimen/tile-widgets/tables.js";
import "@metreeca/specimen/tile-widgets/index.css";


export const TileWidgetsPath = "/tile-widgets/";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function TileWidgets() {

	const sections = {

		Sheet: <Sheets/>,
		Frame: <Frames/>,
		Table: <Tables/>

	};

	const route = useRoute();

	const path = (label: string) => label.toLowerCase();

	return <Page

		tray={<nav aria-label="Sections"><ul>{Object.keys(sections).map(label => {

			const href = `${TileWidgetsPath}${path(label)}`;

			return <li key={label}><a href={href} aria-current={route === href ? "page" : undefined}>{label}</a></li>;

		})}</ul></nav>}

	>

		<Routes>{{

			"/": `/${path("Sheet")}`,

			...Object.fromEntries(Object.entries(sections).map(([label, view]) => [`/${path(label)}`, view]))

		}}</Routes>

	</Page>;

}
