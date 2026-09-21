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
 * Names the anchors an app supplies its brand through and the roles derived from them, so a rule says which role it
 * paints rather than which colour it uses, and an app retuning the anchors alone carries the whole interface along in
 * either platform colour scheme.
 *
 * @remarks
 *
 * **Colour schemes** — the stylesheet ships a light value for each anchor and restates only the dark one, so an
 * interface follows the platform with no work from the app. An app pinning a scheme sets `data-theme` to `light` or
 * `dark` on any element, and the subtree below it takes that scheme whatever the platform says, which is what lets a
 * dark panel sit on a light page. An app supplying its brand states a value per scheme too, and rechecks that the text
 * roles still hold AA contrast against the page and the striped row in both.
 *
 * **Accents** — `colorSubtle` carries an interface at rest, on links, enabled controls and focus rings, while
 * `colorStrong` marks a thing out, on hover and on a selection. The pair states an emphasis relative to each other
 * rather than an appearance, so a brand of any hue or lightness fits it by supplying a quieter value and a louder
 * one; the quieter value is the less saturated of the two, which leaves it free to hold the higher contrast, as it
 * does by default.
 *
 * **Status** — `colorInformation`, `colorSuccess`, `colorWarning` and `colorInvalid` stand apart as anchors of their
 * own rather than derivations of an accent, so an outcome keeps reading as itself whatever an app brands with,
 * instead of being told in the brand's own hue. They are ordered by how much the outcome asks of the reader, from an
 * aside they may ignore to a failure they have to answer, and each pairs with a `backgroundColor*` role tinting a
 * notice. A status is never told in colour alone: an icon or a word carries it too.
 *
 * **What a status colour may paint** — `colorInformation`, `colorSuccess` and `colorInvalid` hold AA contrast on the
 * page, the striped row and their own tint, so they paint text or a mark. `colorWarning` is a **fill**: a caution
 * paints a filled badge with it and sets its message in the dark page anchor over it, at 11.0:1. Stroking it on the
 * page gives 1.73:1 and is a defect.
 *
 * The asymmetry is forced by the colour space rather than chosen. Red reaches full saturation at a middling
 * lightness, so the failure colour is dark enough to read on white and loud at once; yellow reaches full saturation
 * only when it is very light, so a yellow dark enough to stroke on white has already spent its chroma. As a fill it
 * carries chroma 0.151 against the failure's 0.218, so the two shout equally, and it takes one value in both colour
 * schemes, as a {@link palettes series slot} does.
 *
 * **Text** — `colorLabel` names a field, `colorPlaceholder` stands in for a value not yet given, and `colorEnabled`
 * tells a control that answers apart from `colorDisabled`, which tells one that does not.
 * Every text role holds AA contrast against the page and the striped row in both colour schemes; `colorDisabled`
 * carries no meaning on its own and is the one exception.
 *
 * **States** — `colorHover` marks what the pointer is over, `colorPressed` what is being acted on, `colorSelected`
 * what an earlier choice left standing, and `colorFocus` what the keyboard has reached, the focus ring holding 3:1.
 * Each of the first three pairs with a `backgroundColor*` role for a control filling its whole box rather than
 * colouring its text, and the two are never combined on the same element, which would state the emphasis twice. A
 * state is never told in colour alone.
 *
 * **Surfaces** — `backgroundColorEdit` marks a field that takes a value and `backgroundColorStripe` a table row
 * telling itself from its neighbour. A rule paints `background-color` with them rather than retuning
 * `backgroundColor`, which every other colour here stands on. A thing lifted off the page takes an
 * {@link elevations elevation surface} instead.
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

	colorInformation: "--tile--color-information",
	colorSuccess: "--tile--color-success",
	colorWarning: "--tile--color-warning",
	colorInvalid: "--tile--color-invalid",

	colorLabel: "--tile--color-label",
	colorPlaceholder: "--tile--color-placeholder",
	colorEnabled: "--tile--color-enabled",
	colorDisabled: "--tile--color-disabled",

	colorHover: "--tile--color-hover",
	colorPressed: "--tile--color-pressed",
	colorSelected: "--tile--color-selected",
	colorFocus: "--tile--color-focus",

	backgroundColorEdit: "--tile--background-color-edit",
	backgroundColorStripe: "--tile--background-color-stripe",

	backgroundColorHover: "--tile--background-color-hover",
	backgroundColorPressed: "--tile--background-color-pressed",
	backgroundColorSelected: "--tile--background-color-selected",

	backgroundColorInformation: "--tile--background-color-information",
	backgroundColorSuccess: "--tile--background-color-success",
	backgroundColorWarning: "--tile--background-color-warning",
	backgroundColorInvalid: "--tile--background-color-invalid"

} as const;
