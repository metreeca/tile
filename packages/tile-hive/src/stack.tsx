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
 * Vertical stack.
 *
 * Lays out what it holds as a column, one item below the other, set apart by a step of the spacing ladder, so a screen
 * arranges its parts top to bottom without writing a layout rule of its own.
 *
 * @module
 */

import { opt } from "@metreeca/core";
import { css, type Spacing, tile } from "@metreeca/tile";
import { type ComponentChildren, createElement } from "preact";
import "./stack.css";


const justify = {
	start: "start",
	center: "center",
	end: "end",
	spread: "space-between",
	head: undefined, // set apart by the stylesheet
	tail: undefined // set apart by the stylesheet
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a vertical stack.
 *
 * Places what it holds one item below the other, in the order given, with the same gap between each pair and none
 * before the first or after the last. The gap is a step of the {@link @metreeca/tile!index.tile spacing ladder}, so it
 * follows the text size of the stack and whatever an app retuned the ladder to.
 *
 * The stack stands as tall as its items and as wide as whatever holds it, each item taking the full width unless
 * aligned otherwise; a stack told to grow takes whatever room its container leaves along the main axis, which is
 * what lets `place` position the items within a stack taller than they are.
 *
 * The stack carries no semantics: it is a layout, and a screen grouping its items for assistive technology puts the
 * element that does so inside it or around it.
 *
 * @param options The widget configuration
 *
 * @returns The vertical stack
 */
export function Stack({

	grow = false,

	place = "start",
	align = "stretch",
	space,

	children

}: {

	/**
	 * Whether the stack takes whatever room its container leaves along the container main axis, rather than standing
	 * as large as its items.
	 */
	grow?: boolean


	/**
	 * Where the items sit along the column, when the stack is taller than they are: at the `start`, in the `center`,
	 * at the `end`, `spread` from edge to edge, the leftover room shared out between them, or split with the first item
	 * alone at the start and the others at the end (`head`), or the last item alone at the end and the others at the
	 * start (`tail`).
	 */
	place?: "start" | "center" | "end" | "spread" | "head" | "tail"

	/**
	 * Where each item sits across the column: against the `start` edge, in the `center`, against the `end` edge, or
	 * `stretch`ed to the full width of the stack.
	 */
	align?: "start" | "center" | "end" | "stretch"

	/**
	 * The step of the spacing ladder setting each item apart from the next; the items touch where left out.
	 */
	space?: Spacing


	/**
	 * What the stack holds, each child an item of the column.
	 */
	children?: ComponentChildren

}) {

	return createElement("tile-stack", {

		place,

		style: {
			flexGrow: grow ? 1 : undefined,
			justifyContent: justify[place],
			alignItems: align,
			gap: opt(space, step => css.var(tile[step]))
		}

	}, children);

}
