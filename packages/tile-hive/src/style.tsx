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
 * Styled area.
 *
 * Restyles everything an area holds by assigning design system tokens to it, without laying anything out or taking
 * room of its own.
 *
 * @module
 */

import { css as compile, type Tokens } from "@metreeca/tile-skin";
import { type ComponentChildren, createElement } from "preact";
import "./style.css";


/**
 * Creates a styled area.
 *
 * Assigns the tokens given to an area of the interface, so everything inside it that reads one is restyled and
 * everything that doesn't is left alone: a token inherits, which makes an enclosing element the scope the design
 * system is retuned over. A token assigned nearer the thing it paints wins, so an area nests inside another and
 * settles what the wider one left.
 *
 * Tokens are named through the {@link @metreeca/tile-skin!index.tile published contract} rather than as literal
 * strings, so a renamed token breaks the build instead of silently losing its styling; a token mapped to `undefined`
 * is left out, so a conditional override is expressed inline. A screen that already renders an element of its own
 * assigns the same tokens to it with {@link @metreeca/tile-skin!index.css css}, sparing the extra wrapper.
 *
 * The area takes no box of its own, so what it holds sits in the row, the grid or the flow around it exactly as it
 * would without the wrapper. Being an element all the same, it stands between what it holds and whatever encloses
 * that: a rule reaching its children by `> *`, `:first-child` or `:nth-child()` stops at the area, and a screen
 * styling what it holds that way reaches for a class instead.
 *
 * @param options The widget configuration
 *
 * @returns The styled area
 */
export function Style({

	css,

	children

}: {

	/**
	 * The value each token takes inside the area, keyed by {@link @metreeca/tile-skin!index.Token token name}; a token
	 * left out or given `undefined` keeps whatever the cascade already gives it. A value naming a token of the same
	 * kind stands for whatever that one carries, so an area is set from the design system rather than from a literal.
	 */
	css: Tokens

	/**
	 * What the area holds, restyled by the tokens assigned to it and laid out as it would be without the area.
	 */
	children: ComponentChildren

}) {

	/*
	 * The tokens are assigned on the element rather than declared in a stylesheet, an area being settled by whoever
	 * renders it and not by a rule written ahead of time.
	 */

	return createElement("tile-style", { style: compile(css) }, children);

}
