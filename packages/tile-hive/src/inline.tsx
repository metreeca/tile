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
 * Horizontal inline.
 *
 * Lays out what it holds as a row, one item beside the other, set apart by a step of the spacing ladder, so a screen
 * arranges its parts side by side without writing a layout rule of its own.
 *
 * @module
 */

import { css, type Spacing, tile } from "@metreeca/tile";
import { type ComponentChildren, createElement } from "preact";
import "./inline.css";


/**
 * Creates a horizontal inline.
 *
 * Places what it holds one item beside the other, in the order given, with the same gap between each pair and none
 * before the first or after the last. The gap is a step of the {@link @metreeca/tile!index.tile spacing ladder}, so it
 * follows the text size of the inline and whatever an app retuned the ladder to.
 *
 * The inline stands as wide as whatever holds it and as tall as its tallest item, each item keeping its own width;
 * an inline told to grow takes whatever room its container leaves along the main axis. Items that do not fit stay on
 * one line and overflow it, unless the inline is told to wrap, in which case they flow onto as many rows as they
 * need, set apart by `rowSpace`.
 *
 * The inline carries no semantics: it is a layout, and a screen grouping its items for assistive technology puts the
 * element that does so inside it or around it.
 *
 * @param options The widget configuration
 *
 * @returns The horizontal inline
 */
export function Inline({

	grow = false,
	wrap = false,

	alignBlock = "start",
	alignInline = "start",
	rowSpace,
	space,

	children

}: {

	/**
	 * Whether the inline takes whatever room its container leaves along the container main axis, rather than standing
	 * as large as its items.
	 */
	grow?: boolean

	/**
	 * Whether items that do not fit on one line flow onto further rows, rather than overflowing the inline.
	 */
	wrap?: boolean

	/**
	 * Where each item sits across the row: against the `start` edge, in the `center`, against the `end` edge, on the
	 * text `baseline` shared with the other items, or `stretch`ed to the full height of the row.
	 */
	alignBlock?: "start" | "center" | "end" | "baseline" | "stretch"

	/**
	 * Where the items sit along the row, when the inline is wider than they are: at the `start`, in the `center`, at
	 * the `end`, or `spread` from edge to edge, the leftover room shared out between them.
	 */
	alignInline?: "start" | "center" | "end" | "spread"

	/**
	 * The step of the spacing ladder setting each row apart from the next, when the inline wraps; defaults to `space`.
	 */
	rowSpace?: Spacing

	/**
	 * The step of the spacing ladder setting each item apart from the next; the items touch where left out.
	 */
	space?: Spacing

	/**
	 * What the inline holds, each child an item of the row.
	 */
	children?: ComponentChildren

}) {

	const $rowSpace = rowSpace ?? space;

	return createElement("tile-inline", {

		style: {
			flexGrow: grow ? 1 : undefined,
			flexWrap: wrap ? "wrap" : undefined,
			justifyContent: alignInline === "spread" ? "space-between" : alignInline,
			alignItems: alignBlock,
			columnGap: space === undefined ? undefined : css.var(tile[space]),
			rowGap: $rowSpace === undefined ? undefined : css.var(tile[$rowSpace])
		}

	}, children);

}
