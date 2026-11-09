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
 * Widget samples.
 *
 * @module
 */

import { Page, type Sample } from "@metreeca/specimen/index.core.js";
import { Frames } from "@metreeca/specimen/tile-widgets/frames.js";
import { Sheets } from "@metreeca/specimen/tile-widgets/sheets.js";
import { Tables } from "@metreeca/specimen/tile-widgets/tables.js";
import "@metreeca/specimen/tile-widgets/index.css";


const samples: readonly Sample[] = [

	{ id: "sheet", group: "Viewers", title: "Sheet", view: <Sheets/> },
	{ id: "frame", group: "Viewers", title: "Frame", view: <Frames/> },
	{ id: "table", group: "Viewers", title: "Table", view: <Tables/> }

];


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function TileWidgets() {

	return <Page

		eyebrow="@metreeca/tile-widgets"
		title="Linked Data Widgets"
		lead={<>
			The pieces a linked data interface is assembled from, each driven by the shape and the query of the
			resources it shows. Every sample on this page is a live widget, reading from an in-memory toys store.
		</>}

		samples={samples}

	/>;

}
