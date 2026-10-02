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
 * Motion tokens.
 *
 * Names how long a change takes and how it accelerates, by kind rather than by number, retuned from one place.
 *
 * @remarks
 *
 * **Durations** — `durationFast` is for a change the eye should not have to wait for, a hover or a press;
 * `durationNormal` for one that has to be followed, a panel opening or a row expanding; `durationSlow` for one
 * covering the viewport.
 *
 * **Easings** — `easingEnter` decelerates, for a thing arriving, and `easingExit` accelerates, for a thing leaving,
 * so the two read as opposite halves of the same gesture. `easingStandard` does both, for a thing that stays and
 * merely moves.
 *
 * **Reduced motion** — every duration collapses to zero under `prefers-reduced-motion: reduce`, so a transition
 * stated through these tokens honours the preference with no rule of its own. An animation whose duration is written
 * as a literal opts out of that and owes its own media query, which is the reason to state it as a token.
 *
 * @module motions
 */


/**
 * The custom property behind every motion token.
 *
 * Narrowed to literals, so the design system contract can name the tokens and the custom properties they resolve to.
 */
export const motions = {

	durationFast: "--tile--duration-fast",
	durationNormal: "--tile--duration-normal",
	durationSlow: "--tile--duration-slow",

	easingStandard: "--tile--easing-standard",
	easingEnter: "--tile--easing-enter",
	easingExit: "--tile--easing-exit"

} as const;
