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
 * Styled box.
 *
 * Sets what it holds on a box of its own, padded, rounded, lifted and painted from design system tokens, so a screen
 * draws a card, a panel or a well without writing a rule of its own.
 *
 * @module
 */

import { css as compile, type Tokens } from "@metreeca/tile";
import { type ComponentChildren, createElement } from "preact";
import "./box.css";


/**
 * Creates a styled box.
 *
 * Assigns the tokens given to a box enclosing what it holds, as a {@link style!Style styled area} does, and shapes
 * the box itself from them: `padding`, `borderRadius` and `boxShadow` pad, round and lift the box alone, while
 * `backgroundColor` and `color` paint it and carry on to everything inside it, as every other token assigned does.
 * Each is set from a step of the ladder it belongs to, so a box follows whatever an app retuned the design system to:
 *
 * ```tsx
 * <Box css={{ backgroundColor: "backgroundColorRaised", boxShadow: "boxShadowRaised", padding: "spacing100" }}>
 * ```
 *
 * The box stands as wide as whatever holds it and as tall as what it holds, unless a stack or a strip holding it
 * stretches it further, and stretches what it holds to fill it both ways: a stack or a strip inside a stretched box
 * takes its full height, and places its items in it. As an item of a stack or a strip, the box shrinks no further than
 * what it holds allows, exactly as that would on its own. The box holds a single element, a layout or a block: several
 * elements lie over one another, and text is wrapped in an element of its own rather than handed to the box loose.
 *
 * The box carries no semantics: a screen giving it a role for assistive technology puts the element that carries one
 * inside it or around it.
 *
 * @param options The widget configuration
 *
 * @returns The styled box
 */
export function Box({

	css = {},

	children

}: {

	/**
	 * The value each token takes on the box and inside it, keyed by {@link @metreeca/tile!index.Token token name}; a
	 * token left out or given `undefined` keeps whatever the cascade already gives it, and the box is left unpadded,
	 * square, flat and painted as what encloses it.
	 */
	css?: Tokens

	/**
	 * What the box holds, set inside its padding.
	 */
	children?: ComponentChildren

}) {

	return createElement("tile-box", { style: compile(css) }, children);

}
