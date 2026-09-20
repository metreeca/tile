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
 * Typography tokens.
 *
 * Names the faces, sizes, weights and line height an interface sets its text in, and that an app overrides to put its
 * own type on the whole interface with no component change.
 *
 * @remarks
 *
 * **Faces** — `fontFamily` carries the body face, `fontFamilyHeading` the one a title is set in and `fontFamilyMono`
 * the one a code span or a figure aligns on. Each ships as a brand face ahead of a generic stack covering it until it
 * loads, so an app supplying a face of its own keeps the fallbacks by restating them.
 *
 * **Sizes** — `fontSize` is absolute, so a page holds its rhythm wherever it is embedded, while `fontSizeSmall` and
 * `fontSizeLarge` are relative and take the size of whatever they sit in along.
 *
 * **Weights** — `fontWeight` carries text at rest, `fontWeightStrong` marks a run out within it, and
 * `fontWeightHeavy` is what a title and a table header take.
 *
 * @module typography
 */


/**
 * The custom property behind every typography token.
 *
 * Narrowed to literals, so the design system contract can name the tokens and the custom properties they resolve to.
 */
export const typography = {

	fontFamily: "--tile--font-family",
	fontFamilyHeading: "--tile--font-family-heading",
	fontFamilyMono: "--tile--font-family-mono",

	fontSize: "--tile--font-size",
	fontSizeSmall: "--tile--font-size-small",
	fontSizeLarge: "--tile--font-size-large",

	lineHeight: "--tile--line-height",

	fontWeight: "--tile--font-weight",
	fontWeightStrong: "--tile--font-weight-strong",
	fontWeightHeavy: "--tile--font-weight-heavy"

} as const;
