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

import { Colours, Forms, Palettes, Scales, Surfaces, Tables, Text, Theming } from "@metreeca/specimen/tile";
import { Icons, Widgets } from "@metreeca/specimen/tile-cell";
import "@metreeca/tile/index.css";
import { Button } from "@metreeca/tile-cell/button";
import { Icon } from "@metreeca/tile-cell/icon";
import { Logo } from "@metreeca/tile-cell/logo";
import { app } from "@metreeca/tile-data";
import { Fetch, useFetch } from "@metreeca/tile-data/fetch";
import { host } from "@metreeca/tile-hive";
import { Page } from "@metreeca/tile-hive/page";
import { Style } from "@metreeca/tile-hive/style";
import { Tabs } from "@metreeca/tile-hive/tabs";
import { type ComponentChild, render } from "preact";
import { useState } from "preact/hooks";


/**
 * What the sampler shows, keyed by the label the section is chosen by.
 */
const panels: Readonly<Record<string, ComponentChild>> = {

	Colours: <Colours/>,
	Surfaces: <Surfaces/>,
	Palettes: <Palettes/>,
	Scales: <Scales/>,
	Icons: <Icons/>,
	Text: <Text/>,
	Tables: <Tables/>,
	Forms: <Forms/>,
	Widgets: <Widgets/>,
	Theming: <Theming/>

};


/**
 * Stands in for the network, so waiting is shown with no server to reach: every exchange takes two seconds and comes
 * back empty.
 */
async function stall() {

	await new Promise(resolve => setTimeout(resolve, 2000));

	return new Response("{}", { headers: { "Content-Type": "application/json" } });

}


render(<Fetch fetch={stall}><Specimen/></Fetch>, host("tile-specimen"));


function Specimen() {

	const fetch = useFetch();

	const [lock, setLock] = useState(false);
	const [main, setMain] = useState(false);
	const [wide, setWide] = useState(false);

	const [reader, setReader] = useState<string>();

	const tray = lock ? "Release the tray" : "Lock the tray";
	const side = main ? "Show the tray" : "Hide the tray";
	const measure = wide ? "Cap the measure" : "Take the width";

	return <Page

		lock={lock}
		main={main}
		wide={wide}

		logo={<Style css={{ fontSize: "fontSizeLarge" }}><Logo>{app.name}</Logo></Style>}

		meta={<>

			<Button
				icon={lock ? <Icon.Unlock/> : <Icon.Lock/>}
				look="subtle"
				name={tray}
				title={tray}
				onClick={() => setLock(!lock)}
			/>

		</>}

		head={<>

			<Button
				icon={main ? <Icon.PanelLeftOpen/> : <Icon.PanelLeftClose/>}
				look="subtle"
				name={side}
				title={side}
				onClick={() => setMain(!main)}
			/>

			<Button
				icon={wide ? <Icon.ChevronsRightLeft/> : <Icon.ChevronsLeftRight/>}
				look="subtle"
				name={measure}
				title={measure}
				onClick={() => setWide(!wide)}
			/>

		</>}

		menu={<>

			<small>v{VERSION}</small>

			<Button
				icon={<Icon.Search/>}
				look="subtle"
				name="Run an exchange"
				title="Run an exchange"
				onClick={() => { void fetch(app.base); }}
			/>

		</>}

		tray={<>

			<h1>Sections</h1>

			{Object.keys(panels).map(label => <h2 key={label}>{label}</h2>)}

		</>}

		info={reader

			? <>

				<small>{reader}</small>

				<Button
					icon={<Icon.LogOut/>}
					look="subtle"
					name="Sign out"
					title="Sign out"
					onClick={() => setReader(undefined)}
				/>

			</>

			: <Button
				icon={<Icon.LogIn/>}
				look="subtle"
				name="Sign in"
				title="Sign in"
				onClick={() => setReader("reader@example.com")}
			/>

		}

		copy={<small>{app.copy}</small>}

	>

		<Tabs name={app.name} panels={panels}/>

	</Page>;

}
