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
import { Buttons } from "@metreeca/specimen/tile-cell/buttons.js";
import { Faults } from "@metreeca/specimen/tile-cell/faults.js";
import { Icons } from "@metreeca/specimen/tile-cell/icons.js";
import { Logos } from "@metreeca/specimen/tile-cell/logos.js";
import { Notes } from "@metreeca/specimen/tile-cell/notes.js";
import { Colours } from "@metreeca/specimen/tile/colours.js";
import { Text } from "@metreeca/specimen/tile/text.js";
import { Forms } from "@metreeca/specimen/tile/forms.js";
import { Palettes } from "@metreeca/specimen/tile/palettes.js";
import { Scales } from "@metreeca/specimen/tile/scales.js";
import { Surfaces } from "@metreeca/specimen/tile/surfaces.js";
import { Tables } from "@metreeca/specimen/tile/tables.js";
import { Theming } from "@metreeca/specimen/tile/theming.js";
import { app } from "@metreeca/tile-data";
import { Tabs } from "@metreeca/tile-hive/tabs.js";


export function Tile() {

	return <Page>

		<Tabs name={app.name} panels={{

			Colours: <Colours/>,
			Surfaces: <Surfaces/>,
			Palettes: <Palettes/>,
			Scales: <Scales/>,
			Icons: <Icons/>,
			Text: <Text/>,
			Tables: <Tables/>,
			Charts: undefined,
			Forms: <Forms/>,
			Logos: <Logos/>,
			Buttons: <Buttons/>,
			Notes: <Notes/>,
			Faults: <Faults/>,
			Theming: <Theming/>

		}}/>

	</Page>;

}
