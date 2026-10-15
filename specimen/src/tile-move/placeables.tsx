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
 * Placeable samples.
 *
 * @module
 */

import { css, tile } from "@metreeca/tile";
import { Style } from "@metreeca/tile-hive/style";
import { Placeable } from "@metreeca/tile-move/placeable";
import { Fragment } from "preact";
import { useState } from "preact/hooks";
import "./index.css";


const types = ["Bug", "Task"];

// each state tints its column along the flow, from cool to hot

const states = [
	{ label: "To do", tint: tile.colorHeat010 },
	{ label: "Doing", tint: tile.colorHeat060 },
	{ label: "Done", tint: tile.colorHeat080 }
];

const issues = [
	{ id: "1", row: "Bug", column: "To do", title: "Fix the login timeout" },
	{ id: "2", row: "Bug", column: "Doing", title: "Trim the export headers" },
	{ id: "3", row: "Task", column: "To do", title: "Draft the release notes" },
	{ id: "4", row: "Task", column: "To do", title: "Book the review room" },
	{ id: "5", row: "Task", column: "Done", title: "Collect the figures" }
];


/**
 * Creates the board section.
 *
 * Shows a board of issues by type and state whose moves wait on a simulated store, which takes a moment to settle each
 * one and refuses any issue skipping straight from to do to done.
 *
 * @returns The board section
 */
export function Placeables() {

	const [items, setItems] = useState(issues);

	return <>

		<p>A board lays cards out in cells by row and column, in a grid drawn by the screen hosting it, and lets a reader
			move a card into another cell by dragging it, with the pointer, by touch after a brief hold, or with the
			keyboard: <kbd>Space</kbd> or <kbd>Enter</kbd> picks up the focused card, the arrow keys carry it to the next
			cell and the same keys drop it, while <kbd>Escape</kbd> sends it back.</p>

		<p>Each move waits for the store to settle it, the card standing faded in its new cell and the board taking no
			other move meanwhile. This store refuses outright a card skipping straight from to do to done, which never
			leaves its cell, takes a moment over every other move, and sends a card moved back into to do back where it
			came from once it has thought about it.</p>

		<Placeable name="Issues" items={items} card={issue => issue.title} onMove={({ card, from, to }) =>

			from.column === "To do" && to.column === "Done" ? false
				: new Promise<void>(resolve => setTimeout(resolve, 800)).then(() =>
					to.column === "To do" ? undefined : setItems(items => items.map(item =>
						item.id === card ? { ...item, ...to } : item
					))
				)

		}>{cell =>

			<div class="board">

				<header/>
				{states.map(({ label }) => <header key={label}>{label}</header>)}

				{types.map(type => <Fragment key={type}>
					<header>{type}</header>
					{states.map(({ label, tint }) => <Style key={label} css={{ backgroundColor: css.tint(tint, 20) }}>
						{cell({ row: type, column: label }, `${type}, ${label}`)}
					</Style>)}
				</Fragment>)}

			</div>

		}</Placeable>

	</>;

}
