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
 * Sampler.
 *
 * Assembles the sections each package contributes into one page, inside the same frame an app lays its own screens
 * out in, so the frame is shown by being used rather than described.
 *
 * @module
 */

import "@metreeca/tile/index.css";
import { createFetch } from "@metreeca/http";
import { mock } from "@metreeca/http/mock";
import { Root } from "@metreeca/specimen/index.core.js";
import { TileCell, TileCellPath } from "@metreeca/specimen/tile-cell/index.js";
import { TileHive, TileHivePath } from "@metreeca/specimen/tile-hive/index.js";
import { Tile, TilePath } from "@metreeca/specimen/tile/index.js";
import { Fetch } from "@metreeca/tile-data/fetch";
import { Router, Routes } from "@metreeca/tile-data/router";
import { host } from "@metreeca/tile-hive";
import { render } from "preact";
import "./index.css";


render(<Specimen/>, host("tile-specimen"));


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Specimen() {

	return <Fetch fetch={createFetch(mock({ delay: 1000 }))}>

		<Router>

			<Routes>{{

				[Root]: TilePath,

				[TilePath]: <Tile/>,
				[TileCellPath]: <TileCell/>,
				[TileHivePath]: <TileHive/>

			}}</Routes>

		</Router>

	</Fetch>;

}
