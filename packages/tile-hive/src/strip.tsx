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
 * Horizontal strip.
 *
 * Lays out what it holds as a row, one item beside the other, set apart by a step of the spacing ladder, so a screen
 * arranges its parts side by side without writing a layout rule of its own.
 *
 * @module
 */

import { isString, opt } from "@metreeca/core";
import { css, type Spacing, tile } from "@metreeca/tile";
import { type ComponentChildren, createElement } from "preact";
import "./strip.css";


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
 * Creates a horizontal strip.
 *
 * Places what it holds one item beside the other, in the order given, with the same gap between each pair and none
 * before the first or after the last. The gap is a step of the {@link @metreeca/tile!index.tile spacing ladder}, so it
 * follows the text size of the strip and whatever an app retuned the ladder to.
 *
 * The strip stands as wide as whatever holds it and as tall as its tallest item, each item keeping its own width;
 * a strip told to grow takes whatever room its container leaves along the main axis. Items that do not fit stay on
 * one line and overflow it, unless the strip is told to wrap, in which case they flow onto as many rows as they
 * need, set apart as `wrap` states.
 *
 * The strip carries no semantics: it is a layout, and a screen grouping its items for assistive technology puts the
 * element that does so inside it or around it.
 *
 * @param options The widget configuration
 *
 * @returns The horizontal strip
 */
export function Strip({

	grow = false,
	wrap = false,

	place = "start",
	align = "start",
	space,

	children

}: {

	/**
	 * Whether the strip takes whatever room its container leaves along the container main axis, rather than standing
	 * as large as its items.
	 */
	grow?: boolean

	/**
	 * Whether items that do not fit on one line flow onto further rows, rather than overflowing the strip: `true` sets
	 * the rows apart by `space`, a step of the spacing ladder sets them apart by that step instead.
	 */
	wrap?: boolean | Spacing


	/**
	 * Where the items sit along the row, when the strip is wider than they are: at the `start`, in the `center`, at
	 * the `end`, `spread` from edge to edge, the leftover room shared out between them, or split with the first item
	 * alone at the start and the others at the end (`head`), or the last item alone at the end and the others at the
	 * start (`tail`).
	 */
	place?: "start" | "center" | "end" | "spread" | "head" | "tail"

	/**
	 * Where each item sits across the row: against the `start` edge, in the `center`, against the `end` edge, on the
	 * text `baseline` shared with the other items, or `stretch`ed to the full height of the row.
	 */
	align?: "start" | "center" | "end" | "baseline" | "stretch"

	/**
	 * The step of the spacing ladder setting each item apart from the next; the items touch where left out.
	 */
	space?: Spacing


	/**
	 * What the strip holds, each child an item of the row.
	 */
	children?: ComponentChildren

}) {

	const leading = isString(wrap) ? wrap : wrap ? space : undefined;

	return createElement("tile-strip", {

		place,

		style: {
			flexGrow: grow ? 1 : undefined,
			flexWrap: wrap ? "wrap" : undefined,
			justifyContent: justify[place],
			alignItems: align,
			columnGap: opt(space, step => css.var(tile[step])),
			rowGap: opt(leading, step => css.var(tile[step]))
		}

	}, children);

}
