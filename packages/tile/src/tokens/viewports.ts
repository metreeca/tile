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
 * Viewport tokens.
 *
 * Tells which breakpoints the viewport has passed, so a stylesheet branches on a breakpoint by name instead of
 * repeating its width, which CSS gives it no other way to do.
 *
 * @remarks
 *
 * **Why these exist** — a media feature cannot read a custom property, so `@media (min-width: var(--x))` never
 * matches and a breakpoint cannot be a width token. Each of these carries the *answer* instead of the question: the
 * stylesheet states the width once, in its own media query, and hands the result on as a token any rule can read.
 *
 * **The breakpoints** — four widths, each naming the shape a layout takes from it upwards, stated in the companion
 * stylesheet and nowhere else:
 *
 * | Token            | From    | What it answers                                      |
 * |------------------|---------|------------------------------------------------------|
 * | `viewportSmall`  | `30rem` | a phone held upright, the one-column floor           |
 * | `viewportMedium` | `48rem` | a tablet or a split window, fitting a second column  |
 * | `viewportLarge`  | `64rem` | a laptop, where navigation becomes a rail            |
 * | `viewportXlarge` | `90rem` | a desktop, where the measure is capped not stretched |
 *
 * **Floors, not bands** — every width is a lower bound, so a wide viewport leaves the narrower flags on and a rule
 * reads them as a ladder. A rule needing a band states the wider flag as `off` alongside the narrower one as `on`,
 * rather than reaching for a `max-width` query, where two rules can both match at the boundary or neither can.
 *
 * **Why `rem`** — each width asks whether the content fits, not how big the glass is, and content is measured in
 * text: a comfortable line runs 65 to 75 characters, which is a multiple of the font size rather than of physical
 * pixels. A reader who raises the browser default to 24px needs about half as much width again for the same words,
 * so the layout that fitted at 768 pixels no longer does; a `px` query cannot see that and hands them the wide
 * layout with the text crammed into it, while these move them down the ladder to the simpler one.
 *
 * Inside a media query `rem` resolves against the browser's initial font size, never against the root font size the
 * page sets, so neither {@link typography `fontSize`} nor an app overriding it moves these thresholds: only the
 * reader's own browser setting does. Browser zoom scales the CSS pixel and so moves a `px` query and a `rem` query
 * alike, and is not a case either unit handles better.
 *
 * **How a rule reads one** — through a style query, which matches on the value a custom property holds on an
 * enclosing element. The tokens are assigned on the root element and inherit, so every element is inside a matching
 * container and no rule declares a container of its own:
 *
 * ```css
 * @container style(--tile--viewport-medium: on) {
 *     tile-screen {
 *         grid-template-columns: 1fr 2fr;
 *     }
 * }
 * ```
 *
 * **Both branches** — each token is registered with `off` as its default and set to `on` from its width upwards, so
 * the narrow case is a value a rule can match rather than the absence of one.
 *
 * **Reusable, not retunable** — the width stays in the stylesheet's own media query, so overriding one of these
 * tokens forces the flag without moving the threshold. What they remove is the width repeated across every component,
 * not the need to revise it in one place. An app wanting thresholds of its own writes its own media queries.
 *
 * **Outside the cascade** — code needing the same answer reads the token as it reads any other, through
 * `getComputedStyle`, which is a point-in-time read; a component that has to react to a threshold being crossed
 * watches the element rather than polling.
 *
 * **Container queries first** — a widget changing shape because of the space it was given states a `@container` size
 * query against its own inline size and reads none of these. They answer the page-level questions a container query
 * cannot: how many columns a screen offers, whether navigation is a rail or a drawer.
 *
 * @module viewports
 */


/**
 * The custom property behind every viewport token.
 *
 * Narrowed to literals, so the design system contract can name the tokens and the custom properties they resolve to.
 */
export const viewports = {

	viewportSmall: "--tile--viewport-small",
	viewportMedium: "--tile--viewport-medium",
	viewportLarge: "--tile--viewport-large",
	viewportXlarge: "--tile--viewport-xlarge"

} as const;
