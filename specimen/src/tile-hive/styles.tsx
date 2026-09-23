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
 * Style samples.
 *
 * @module
 */

import { Button } from "@metreeca/tile-cell/button";
import { Icon } from "@metreeca/tile-cell/icon";
import { Style } from "@metreeca/tile-hive/style";
import { Tabs } from "@metreeca/tile-hive/tabs";
import "./index.css";


function Toolbar() {
	return <div class="toolbar">
		<Button icon={<Icon.Create/>} label="New"/>
		<Button icon={<Icon.Update/>} label="Edit"/>
		<Button look="strong" mode="commit" icon={<Icon.Save/>} label="Save"/>
	</div>;
}


/**
 * Creates the style section.
 *
 * Shows an area retuned by assigning design system tokens to it, restyling what it holds without laying anything
 * out.
 *
 * @returns The style section
 */
export function Styles() {
	return <>

		<p>A styled area assigns design system tokens to what it holds, so everything inside that reads one is restyled
			and everything else is left alone. It takes no box of its own, so what it holds sits in the flow exactly as
			it would without it.</p>

		<p>How loud the widgets in an area appear is a token like any other. The same toolbar is set as it stands, then
			in an area written quietly: the controls drop their rules, except the one stating a look of its own.</p>

		<Toolbar/>

		<Style css={{ look: "subtle" }}><Toolbar/></Style>

		<p>An accent assigned to an area repaints whatever the area draws with it, here the mark on the chosen tab, while
			an area nested inside another settles what the wider one left.</p>

		<Style css={{ colorStrong: "#2A9D8F" }}>

			<Tabs name="Retuned" panels={{
				Accent: <p>The mark takes the accent the area assigns.</p>,
				Other: <p>Every tab takes it alike.</p>
			}}/>

		</Style>

		<p>A token may be set from another one by name, so an area steps its text down the type ladder without
			restating a size:</p>

		<Style css={{ fontSize: "fontSizeSmall" }}>
			<p>This paragraph is set at the small size the ladder carries.</p>
		</Style>

	</>;
}
