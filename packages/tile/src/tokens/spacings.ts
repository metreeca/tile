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
 * Spacing tokens.
 *
 * Names the ladder margins, paddings and gaps set a thing apart on, so an interface's spacing retunes from one place.
 *
 * @remarks
 *
 * Each step is the multiple of the text size its number names, stated in `em` so a resized subtree takes it along.
 *
 * A step sizing a thing against the text rather than spacing it from its neighbour belongs to the
 * {@link scalings scaling ladder} instead: a glyph, a spinner, a swatch or a dot is scaled, not spaced.
 *
 * **Padding** — `padding` is not a step but the padding of the element it is assigned to, set from a step: no rule
 * reads it, and assigning it through {@link index.css css} pads that element alone, leaving what it holds unpadded.
 *
 * @module spacings
 */


/**
 * The custom property behind every spacing token.
 *
 * Narrowed to literals, so the design system contract can name the tokens and the custom properties they resolve to.
 */
export const spacings = {

	spacing025: "--tile--spacing-025",
	spacing050: "--tile--spacing-050",
	spacing075: "--tile--spacing-075",
	spacing100: "--tile--spacing-100",
	spacing150: "--tile--spacing-150",
	spacing200: "--tile--spacing-200",
	spacing250: "--tile--spacing-250",

	padding: "--tile--padding"

} as const;
