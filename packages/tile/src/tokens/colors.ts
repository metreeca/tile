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
 * **Colour schemes** — the stylesheet ships each anchor as a `light-dark()` pair, so an interface follows the platform
 * with no work from the app. An app pinning a scheme sets `data-theme` to `light` or `dark` on any element, and the
 * subtree below it takes that scheme whatever the platform says, which is what lets a dark panel sit on a light page.
 * An app supplying its brand states a value per scheme too, as a single `light-dark()` pair on `:root` that every
 * scheme and every pinned subtree follows, and rechecks that the text roles still hold AA contrast against the page
 * and the striped row in both:
 *
 * ```css
 * :root {
 *     --tile--color-subtle: light-dark(#1C275D, #9AB);
 *     --tile--color-strong: light-dark(#D60, #F80);
 * }
 * ```
 *
 * **Accents** — `colorSubtle` is the quieter of the brand pair and `colorStrong` the louder. The pair states an
 * emphasis relative to each other and nothing else: which elements read them, and in which state, is settled by the
 * roles derived from them rather than by the anchors. A brand of any hue or lightness therefore fits by supplying
 * two values; the quieter one is the less saturated, which leaves it free to hold the higher contrast, as it does by
 * default.
 *
 * **Status** — `colorInfo`, `colorPass`, `colorWarn` and `colorFail` are a four-step scale every meaning a widget
 * carries lands on: `info` says no verdict has been passed, and `pass`, `warn` and `fail` are a verdict getting
 * worse. `info` is therefore not a milder `pass` but the absence of one, which is why the scale reads as one
 * unjudged step ahead of a three-step ramp.
 *
 * Three kinds of meaning share it, and which one a widget carries follows from what the widget is, so no widget
 * carries two: `level` on content, how much attention a passage deserves; `mode` on controls, what activating will
 * do; `status` on reported things, what the system says happened. Each declares `normal` explicitly, and `normal` is
 * not a step: it paints nothing and leaves the ordinary page colours. A widget maps its remaining values onto the
 * steps and states that mapping in its own documentation.
 *
 * How loud a widget appears is a separate axis, its `look`, told in placement, size and weight and never in colour.
 *
 * The four stand apart as anchors rather than derivations of an accent, so a meaning keeps reading as itself
 * whatever an app brands with, and each pairs with a `backgroundColor*` role tinting a notice. A step is never told
 * in colour alone: an icon or a word carries it too, since the two ends of the ramp are the pair colour vision
 * deficiency collapses most readily.
 *
 * **What a status colour may paint** — `colorInfo`, `colorPass` and `colorFail` hold AA contrast on the page,
 * the striped row and their own tint, so they paint text or a mark. `colorWarn` is a **fill**: a caution
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
 * Every text role holds AA contrast against the page and the striped row in both colour schemes, except
 * `colorDisabled` and `colorPlaceholder`, which share one value and carry no meaning on their own: both stand for
 * text the reader has not supplied, and a disabled control is told from an empty one by its background rather than
 * by the weight of its text.
 *
 * **States** — `colorHover` marks what the pointer is over, `colorPressed` what is being acted on, `colorSelected`
 * what an earlier choice left standing, and `colorFocus` what the keyboard has reached, the focus ring holding 3:1.
 * The first three answer to the strong accent, so they follow a brand; `colorFocus` carries a value of its own per
 * colour scheme, so that where the keyboard stands is told the same way whatever an app brands with.
 * Each of the first three pairs with a `backgroundColor*` role for a control filling its whole box rather than
 * colouring its text, and the two are never combined on the same element, which would state the emphasis twice. A
 * state is never told in colour alone.
 *
 * **Filled steps** — `colorOver` is what text takes over a step painted as a fill rather than stroked, which
 * `colorWarn` always is. It resolves to whichever page anchor is the dark one, so it stays dark in both colour
 * schemes where `color` and `backgroundColor` each swap sides.
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

	colorInfo: "--tile--color-info",
	colorPass: "--tile--color-pass",
	colorWarn: "--tile--color-warn",
	colorFail: "--tile--color-fail",

	colorLabel: "--tile--color-label",
	colorPlaceholder: "--tile--color-placeholder",
	colorEnabled: "--tile--color-enabled",
	colorDisabled: "--tile--color-disabled",

	colorHover: "--tile--color-hover",
	colorPressed: "--tile--color-pressed",
	colorSelected: "--tile--color-selected",
	colorFocus: "--tile--color-focus",
	colorOver: "--tile--color-over",

	backgroundColorEdit: "--tile--background-color-edit",
	backgroundColorStripe: "--tile--background-color-stripe",

	backgroundColorHover: "--tile--background-color-hover",
	backgroundColorPressed: "--tile--background-color-pressed",
	backgroundColorSelected: "--tile--background-color-selected",

	backgroundColorInfo: "--tile--background-color-info",
	backgroundColorPass: "--tile--background-color-pass",
	backgroundColorWarn: "--tile--background-color-warn",
	backgroundColorFail: "--tile--background-color-fail"

} as const;
