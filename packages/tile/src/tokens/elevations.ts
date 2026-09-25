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
 * Elevation tokens.
 *
 * Names what a thing lifted off the page is painted on: the surface it carries its own background in, the shadow
 * setting it apart from what it covers, and the blanket dimming the page behind a thing demanding an answer.
 *
 * @remarks
 *
 * **Pairing** — a surface and its shadow are taken together, `backgroundColorRaised` with `boxShadowRaised` and
 * `backgroundColorOverlay` with `boxShadowOverlay`. A surface without its shadow reads as a flat patch of a slightly
 * different colour, and a shadow without its surface lets the page show through wherever the reset hands an element
 * `background-color: inherit`.
 *
 * **Steps** — `backgroundColorRaised` lifts a thing that stays in the flow, a card or a sticky header, and
 * `backgroundColorOverlay` lifts one that leaves it, a menu, a popover or a dialog. `backgroundColorSunken` goes the
 * other way, for a well a thing is dropped into.
 *
 * **Lifting** — `boxShadow` is not a step but the shadow of the element it is assigned to, set from a step: no rule
 * reads it, and assigning it through {@link index.css css} lifts that element alone.
 *
 * **White pages** — the surfaces are derived by lightening the page, so on a light scheme whose page is already white
 * they resolve to the page colour itself and the shadow carries the whole separation, while on a dark scheme they
 * lighten as expected. This is what lets one derivation serve both schemes; a design needing a visible card on a light
 * page overrides the page anchor to an off-white rather than the surface.
 *
 * **Blankets** — `backgroundColorBlanket` is a translucent value, so it dims whatever it covers rather than replacing
 * it. It pairs with the {@link layers `zIndexBlanket`} slot, which decides what it covers.
 *
 * @module elevations
 */


/**
 * The custom property behind every elevation token.
 *
 * Narrowed to literals, so the design system contract can name the tokens and the custom properties they resolve to.
 */
export const elevations = {

	backgroundColorRaised: "--tile--background-color-raised",
	backgroundColorOverlay: "--tile--background-color-overlay",
	backgroundColorSunken: "--tile--background-color-sunken",
	backgroundColorBlanket: "--tile--background-color-blanket",

	boxShadowRaised: "--tile--box-shadow-raised",
	boxShadowOverlay: "--tile--box-shadow-overlay",
	boxShadow: "--tile--box-shadow"

} as const;
