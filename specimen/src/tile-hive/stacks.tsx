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
 * Stack samples.
 *
 * @module
 */

import { Frame, Items } from "@metreeca/specimen/tile-hive/sample.js";
import { Stack } from "@metreeca/tile-hive/stack";
import { Strip } from "@metreeca/tile-hive/strip";
import "./index.css";


type Options = Parameters<typeof Stack>[0]


const labels = [ "One", "Two", "Three" ];
const longer = [ "One", "Two", "Three", "Four", "Five", "Six" ];
const ragged = [ "A", "Bravo", "Charlie Delta" ];

const places: ReadonlyArray<NonNullable<Options["place"]>> = [ "start", "center", "end", "spread", "head", "tail" ];
const aligns: ReadonlyArray<NonNullable<Options["align"]>> = [ "start", "center", "end", "stretch" ];


/**
 * Creates the stack section.
 *
 * Shows items laid out one below the other, where they sit along a stack taller than they are, and where each sits
 * across it.
 *
 * @returns The stack section
 */
export function Stacks() {
	return <>

		<p>A stack lays out what it holds as a column, one item below the other, set apart by a step of the spacing
			ladder. It carries no semantics of its own: it is a layout, and nothing else.</p>

		<p>Told to grow, a stack takes the room its container leaves, and <code>place</code> decides where the items
			sit in it: packed at either end or in the middle, spread from edge to edge, or split with the first item
			alone at the top and the others at the bottom (<code>head</code>), or the last alone at the
			bottom (<code>tail</code>), as a sidebar keeps its settings. Below, stacks set side by side in a strip
			stretching them all to the tallest one, which holds more items than the others, and every shorter stack
			places its items in the room left over.</p>

		<div class="frames">
			<Strip wrap align="stretch" space="spacing100">

				<Frame label="as it stands">
					<Stack space="spacing050"><Items labels={longer}/></Stack>
				</Frame>

				{places.map(place =>

					<Frame key={place} label={<code>place="{place}"</code>}>
						<Stack grow place={place} space="spacing050"><Items labels={labels}/></Stack>
					</Frame>
				)}

			</Strip>
		</div>

		<p>Across the column, <code>align</code> decides where each item sits: against either edge, in the middle, or
			stretched to the full width, which is where a stack starts. The items below differ in width, so the stack
			is as wide as the widest one and each setting reads off the ragged edge the others leave.</p>

		<div class="frames">
			<Strip wrap align="stretch" space="spacing100">{aligns.map(align =>

				<Frame key={align} label={<code>align="{align}"</code>}>
					<Stack align={align} space="spacing050"><Items labels={ragged}/></Stack>
				</Frame>
			)}</Strip>
		</div>

	</>;
}
