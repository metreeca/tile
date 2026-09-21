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
 * Opacity tokens.
 *
 * Names how far a thing is faded when it is present but not available, so a whole composite dims at once rather than
 * each of its parts taking a colour role of its own.
 *
 * @remarks
 *
 * **Reach** — fading the container is what a colour role cannot do: {@link colors `colorDisabled`} settles the text
 * of a disabled control, while `opacityDisabled` carries its border, its icon and whatever it encloses along. A
 * control whose parts are all tokenised takes the role, and one enclosing arbitrary content takes the token.
 *
 * **Contrast** — a faded thing is exempt from the contrast budget only because it is also inert. Anything a reader is
 * still expected to act on, or to read, states its colour through a role instead and keeps its ratio.
 *
 * **Loading** — `opacityLoading` is lighter than `opacityDisabled`, since content being replaced is still worth
 * reading while it is on its way out.
 *
 * @module opacities
 */


/**
 * The custom property behind every opacity token.
 *
 * Narrowed to literals, so the design system contract can name the tokens and the custom properties they resolve to.
 */
export const opacities = {

	opacityDisabled: "--tile--opacity-disabled",
	opacityLoading: "--tile--opacity-loading"

} as const;
