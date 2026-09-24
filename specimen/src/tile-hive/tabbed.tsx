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
 * Tabs samples.
 *
 * @module
 */

import { Tabs } from "@metreeca/tile-hive/tabs";
import "./index.css";


/**
 * Creates the tabs section.
 *
 * Shows the panels a reader chooses between, how loud the strip is set, and the menu standing in for it where the
 * labels would not fit.
 *
 * @returns The tabs section
 */
export function Tabbed() {
	return <>

		<p>Tabs present a fixed set of labelled panels one at a time. A panel is chosen with the pointer or with the
			keyboard, the arrow keys stepping to either neighbour and <kbd>Home</kbd> and <kbd>End</kbd> jumping to
			either end of the strip. A panel given no content keeps its label, greyed, and is never brought on
			show.</p>

		<Tabs name="Seasons" panels={{
			Spring: <p>Days lengthen, and the first leaves open.</p>,
			Summer: <p>The longest days, and the warmest.</p>,
			Autumn: <p>Days shorten, and the leaves turn.</p>,
			Winter: undefined
		}}/>

		<p>The quiet step drops the rule closing the strip off, so the labels read as part of what surrounds them; the
			mark on the chosen tab stays either way.</p>

		<Tabs name="Seasons, quietly" look="subtle" panels={{
			Spring: <p>Days lengthen, and the first leaves open.</p>,
			Summer: <p>The longest days, and the warmest.</p>,
			Autumn: <p>Days shorten, and the leaves turn.</p>
		}}/>

		<p>Where the labels would not fit on one line, the strip gives way to a menu offering the same choice, and comes
			back as soon as they fit again. The same tabs are set below in a wide column and in a narrow one, where the
			menu stands in; narrowing the window turns the wide one over to the menu as well.</p>

		<div class="columns">

			{[ "Wide column", "Narrow column" ].map(name =>
				<Tabs key={name} name={name} panels={{
					"Introduction": <p>What the guide covers, and who it is for.</p>,
					"Getting started": <p>Installing the package and rendering a first screen.</p>,
					"Configuration": <p>The options a screen takes, and their defaults.</p>,
					"Troubleshooting": <p>The mistakes most often made, and their fixes.</p>
				}}/>
			)}

		</div>

	</>;
}
