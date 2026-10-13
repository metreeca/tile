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
 * Sortable samples.
 *
 * @module
 */

import { Sortable } from "@metreeca/tile-move/sortable";
import { useState } from "preact/hooks";
import "./index.css";


type Lists = Readonly<Record<string, readonly string[]>>;

type Move = Parameters<NonNullable<Parameters<typeof Sortable>[0]["onMove"]>>[0];


/**
 * Applies a move to a set of lists, as a store adopting it would.
 */
function apply(lists: Lists, { item, from, to }: Move): Lists {

	const stripped = { ...lists, [from.list]: lists[from.list].filter(key => key !== item) };
	const target = stripped[to.list];

	return { ...stripped, [to.list]: [...target.slice(0, to.index), item, ...target.slice(to.index)] };

}


/**
 * Creates the sortable section.
 *
 * Shows a single list reordered in place, and a set of task lists whose items move from one list into another, an
 * empty one included.
 *
 * @returns The sortable section
 */
export function Sorting() {

	const [planets, setPlanets] = useState<Readonly<Record<string, readonly string[]>>>({
		Planets: ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn"]
	});

	const [board, setBoard] = useState<Readonly<Record<string, readonly string[]>>>({
		"To do": ["Draft the outline", "Collect the figures", "Book the room"],
		"Doing": ["Write the summary"],
		"Done": []
	});

	return <>

		<p>Sortable lists let a reader reorder items by dragging them, with the pointer, by touch after a brief hold, or
			with the keyboard: <kbd>Space</kbd> or <kbd>Enter</kbd> picks up the item whose grip has the focus, the
			arrow keys carry it and the same keys drop it, while <kbd>Escape</kbd> sends it back. The items make room
			for the one dragged, so the order it would land in shows before it is dropped.</p>

		<Sortable name="Planets" items={planets} onMove={move => setPlanets(planets => apply(planets, move))}>{planet =>
			planet
		}</Sortable>

		<p>Lists in one set share their items, so an item moves from one list into another as readily as within its own,
			and an empty list takes an item dropped anywhere over it. Each move waits for the store to settle it, the
			item standing faded where it was dropped and the lists taking no other move meanwhile. This store refuses
			outright an item skipping straight from to do to done, which goes back at once, takes a moment over every
			other move, and sends an item moved back into to do back where it came from once it has thought about it.</p>

		<Sortable name="Board" items={board} onMove={move =>

			move.from.list === "To do" && move.to.list === "Done" ? false
				: new Promise<void>(resolve => setTimeout(resolve, 800)).then(() =>
					move.to.list === "To do" ? undefined : setBoard(board => apply(board, move))
				)

		}>{task => task}</Sortable>

		<p>The order adopted is the one shown: {Object.entries(board)
			.map(([list, tasks]) => `${list} (${tasks.length})`)
			.join(", ")}.</p>

	</>;

}
