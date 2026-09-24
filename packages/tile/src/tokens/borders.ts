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
 * Border tokens.
 *
 * Names what is drawn at the edge of a box: the line enclosing it, the corner rounding it, the outline marking it
 * focused and the one marking it invalid, together with the weight a vector glyph is stroked at.
 *
 * @remarks
 *
 * **Radii** — `borderRadius025` to `borderRadius100` round a corner by a length, on the steps
 * {@link spacings the spacing ladder} carries and stated the same way, in `em`, so a box rounds by the same amount
 * whatever size it is given and a subtree given a size of its own rounds to match. A shape rather than a corner, a
 * roundel or a pill, is a share of its box rather than a step on this ladder, and the component drawing it says so.
 *
 * **Marks** — `outlineFocus` and `outlineInvalid` are whole `outline` shorthand values rather than colours, so a rule
 * states the mark in one declaration and an app retuning the anchors carries it along. `outline-offset` is not part of
 * that shorthand, so a rule setting either mark states the offset alongside it, and a mark left at the offset the
 * platform gives the control will not sit where the rule expects. They pair with the {@link colors `colorFocus`} and
 * {@link colors `colorFail`} roles, which a consumer reaches for where it paints the mark itself.
 *
 * **Strokes** — `strokeWidth` carries a bare number, in the user units of the vector viewport it applies to, so the
 * weight of a glyph holds at any size.
 *
 * @module borders
 */


/**
 * The custom property behind every border token.
 *
 * Narrowed to literals, so the design system contract can name the tokens and the custom properties they resolve to.
 */
export const borders = {

	borderStyle: "--tile--border-style",
	borderColor: "--tile--border-color",
	borderWidth: "--tile--border-width",

	borderRadius025: "--tile--border-radius-025",
	borderRadius050: "--tile--border-radius-050",
	borderRadius075: "--tile--border-radius-075",
	borderRadius100: "--tile--border-radius-100",

	outlineFocus: "--tile--outline-focus",
	outlineInvalid: "--tile--outline-invalid",

	strokeWidth: "--tile--stroke-width"

} as const;
