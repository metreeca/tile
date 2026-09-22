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
 * Layering tokens.
 *
 * Names the stacking order two things overlapping the page are settled by, so a widget states which kind of thing it
 * is rather than inventing a number and discovering later which other widget it lost to.
 *
 * @remarks
 *
 * **Order** — from the page upwards: `zIndexSticky`, `zIndexDropdown`, `zIndexBlanket`, `zIndexModal`, `zIndexToast`,
 * `zIndexTooltip`. A tooltip sits at the top because it explains whatever is below it, and a toast below that because
 * it is dismissible while a tooltip is not.
 *
 * **Stacking contexts** — a value is compared only against its siblings in the same stacking context, so a dropdown
 * opened inside a modal takes `zIndexDropdown` and still paints above the modal, whose own value applies in the
 * context enclosing it. A widget therefore never adds a step to clear an ancestor.
 *
 * **Steps** — the values are spaced by a hundred, leaving room for a thing an app has to slot between two of them
 * without restating the ladder.
 *
 * @module layers
 */


/**
 * The custom property behind every layering token.
 *
 * Narrowed to literals, so the design system contract can name the tokens and the custom properties they resolve to.
 */
export const layers = {

	zIndexSticky: "--tile--z-index-sticky",
	zIndexDropdown: "--tile--z-index-dropdown",
	zIndexBlanket: "--tile--z-index-blanket",
	zIndexModal: "--tile--z-index-modal",
	zIndexToast: "--tile--z-index-toast",
	zIndexTooltip: "--tile--z-index-tooltip"

} as const;
