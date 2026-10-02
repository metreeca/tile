/*
 * Copyright © 2025-2026 Metreeca srl
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
 * Strip samples.
 *
 * @module
 */

import { Frame, Items } from "@metreeca/specimen/tile-hive/sample.js";
import { Stack } from "@metreeca/tile-hive/stack";
import { Strip } from "@metreeca/tile-hive/strip";
import { Style } from "@metreeca/tile-hive/style";
import "./index.css";


type Options = Parameters<typeof Strip>[0]


const labels = [ "One", "Two", "Three" ];

const places: ReadonlyArray<NonNullable<Options["place"]>> = [ "start", "center", "end", "spread", "head", "tail" ];
const aligns: ReadonlyArray<NonNullable<Options["align"]>> = [ "start", "center", "end", "baseline", "stretch" ];

const days = Array.from({ length: 31 }, (_, index) => String(index + 1));


/**
 * Creates the strip section.
 *
 * Shows items laid out side by side, where they sit along a strip wider than they are, where each sits across it, and
 * how a strip told to wrap flows onto further rows.
 *
 * @returns The strip section
 */
export function Strips() {
	return <>

		<p>A strip lays out what it holds as a row, one item beside the other, set apart by a step of the spacing
			ladder. Like a stack, it carries no semantics of its own.</p>

		<p>A strip takes the full width of its container, and <code>place</code> decides where the items sit along it:
			packed at either end or in the middle, spread from edge to edge, or split with the first item alone at the
			start and the others at the end (<code>head</code>), as an app bar sets its logo apart from its actions, or
			the last alone at the end (<code>tail</code>).</p>

		<div class="frames">
			<Stack space="spacing100">{places.map(place =>

				<Frame key={place} label={<code>place="{place}"</code>}>
					<Strip place={place} space="spacing050"><Items labels={labels}/></Strip>
				</Frame>
			)}</Stack>
		</div>

		<p>Across the row, <code>align</code> decides where each item sits: against either edge, in the middle, on the
			text baseline the items share, or stretched to the height of the row. The items below differ in size, so
			each setting reads off the ragged edge it leaves.</p>

		<div class="frames">
			<Strip wrap space="spacing100">{aligns.map(align =>

				<Frame key={align} label={<code>align="{align}"</code>}>
					<Strip align={align} space="spacing050">

						<Items labels={[ "Aa" ]}/>

						<Style css={{ fontSize: "fontSizeLarge" }}><Items labels={[ "Bb" ]}/></Style>

						<Style css={{ fontSize: "fontSizeSmall" }}><Items labels={[ "Cc" ]}/></Style>

					</Strip>
				</Frame>
			)}</Strip>
		</div>

		<p>Items that do not fit stay on one line and overflow it, unless the strip is told to <code>wrap</code>: they
			then flow onto as many rows as they need, set apart by the same step as the items, or by the
			step <code>wrap</code> names.</p>

		<div class="frames">
			<Stack space="spacing100">

				<Frame label={<code>wrap</code>}>
					<Strip wrap space="spacing050"><Items labels={days}/></Strip>
				</Frame>

				<Frame label={<code>wrap="spacing150"</code>}>
					<Strip wrap="spacing150" space="spacing050"><Items labels={days}/></Strip>
				</Frame>

			</Stack>
		</div>

	</>;
}
