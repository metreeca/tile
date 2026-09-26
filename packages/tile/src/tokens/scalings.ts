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
 * Scaling tokens.
 *
 * Names the ladder a glyph, a spinner, a swatch or a dot is sized on, keeping its proportion to the text it sits in.
 *
 * @remarks
 *
 * Each step is the multiple of the text size its number names, stated in `em` so a resized subtree takes it along.
 *
 * A margin, a padding or a gap sets a thing apart rather than sizing it, and takes the {@link spacings spacing ladder}.
 *
 * @module scalings
 */


/**
 * The custom property behind every scaling token.
 *
 * Narrowed to literals, so the design system contract can name the tokens and the custom properties they resolve to.
 */
export const scalings = {

	scaling025: "--tile--scaling-025",
	scaling050: "--tile--scaling-050",
	scaling075: "--tile--scaling-075",
	scaling090: "--tile--scaling-090",
	scaling100: "--tile--scaling-100",
	scaling110: "--tile--scaling-110",
	scaling125: "--tile--scaling-125",
	scaling150: "--tile--scaling-150",
	scaling200: "--tile--scaling-200",
	scaling250: "--tile--scaling-250"

} as const;
