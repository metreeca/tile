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
 * Colour tokens.
 *
 * Names the five anchors an app supplies its brand through and the roles derived from them, so a rule says which role
 * it paints rather than which colour it uses, and an app retuning the anchors alone carries the whole interface along
 * in either platform colour scheme.
 *
 * @remarks
 *
 * **Colour schemes** — the stylesheet ships a light value for each anchor and restates only the dark one, so an
 * interface follows the platform with no work from the app, and one pinning a scheme sets `color-scheme` on the root
 * element as usual. An app supplying its brand states a value per scheme too, and rechecks that the text roles still
 * hold AA contrast against the page and the striped row in both.
 *
 * **Accents** — `colorSubtle` carries an interface at rest, on links, enabled controls and focus rings, while
 * `colorStrong` marks a thing out, on hover and on a selection. The pair states an emphasis relative to each other
 * rather than an appearance, so a brand of any hue or lightness fits it by supplying a quieter value and a louder
 * one; the quieter value is the less saturated of the two, which leaves it free to hold the higher contrast, as it
 * does by default.
 *
 * **The error colour** — `colorInvalid` stands apart as an anchor of its own rather than a derivation of an accent,
 * so a failure keeps reading as one whatever an app brands with, instead of being rejected in the brand's own hue.
 *
 * **Text** — `colorLabel` names a field, `colorPlaceholder` stands in for a value not yet given, and `colorEnabled`
 * tells a control that answers apart from `colorDisabled`, which tells one that does not.
 * Every text role holds AA contrast against the page and the striped row in both colour schemes; `colorDisabled`
 * carries no meaning on its own and is the one exception.
 *
 * **States** — `colorHover` marks what the pointer is over and `colorFocus` what the keyboard has reached, the focus
 * ring holding 3:1. A state is never told in colour alone.
 *
 * **Surfaces** — `backgroundColorEdit` marks a field that takes a value and `backgroundColorStripe` a table row
 * telling itself from its neighbour. A rule paints `background-color` with them rather than retuning
 * `backgroundColor`, which every other colour here stands on.
 *
 * The chart and map colours stand outside this: the {@link palettes heat scale, the series slots and the area
 * classes} keep values of their own, so a rebrand leaves what they code unchanged.
 *
 * @module colors
 */


/**
 * The custom property behind every colour token.
 *
 * Narrowed to literals, so the design system contract can name the tokens and the custom properties they resolve to.
 */
export const colors = {

	color: "--tile--color",
	backgroundColor: "--tile--background-color",

	colorSubtle: "--tile--color-subtle",
	colorStrong: "--tile--color-strong",

	colorInvalid: "--tile--color-invalid",

	colorLabel: "--tile--color-label",
	colorPlaceholder: "--tile--color-placeholder",
	colorEnabled: "--tile--color-enabled",
	colorDisabled: "--tile--color-disabled",

	colorHover: "--tile--color-hover",
	colorFocus: "--tile--color-focus",

	backgroundColorEdit: "--tile--background-color-edit",
	backgroundColorStripe: "--tile--background-color-stripe"

} as const;
