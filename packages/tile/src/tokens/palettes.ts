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
 * Palette tokens.
 *
 * Names the colours a chart, a coding or a map reads: four ten-step scales, nine series slots and four area classes.
 * A step, a slot or a class says where a value sits or which thing it belongs to, and never stands in for a
 * {@link colors role}, which says what a colour means in the interface.
 *
 * @remarks
 *
 * **Colour scales** — where a colour stands for a position rather than for a role, a ten-step scale provides it:
 * `colorGray*` for a neutral, `colorSubtle*` and `colorStrong*` for a branded one, and `colorHeat*` for a magnitude.
 * The number is the share of the anchor the step carries, so `010` is the faintest and `100` the anchor itself, and
 * the three derived scales follow an app retuning {@link colors the anchors}. A step is not a replacement for a role
 * token: the text and background roles do not land on the ladder.
 *
 * **The heat scale** — it carries literals of its own, cool blue through green and red to a violet extremum standing
 * for a measure past the top of its range. Its hue carries the reading and its lightness does not, so a step means a
 * band a legend names, never a position on a continuous gradient, and a consumer states the band in text beside the
 * colour. Text over a step takes the page colour {@link colors `color`} up to `070` and the page background
 * {@link colors `backgroundColor`} from `080` on. A continuous gradient needs a monotone scale of
 * its own.
 *
 * **Series slots** — `colorSeries1` to `colorSeries9` tell one thing apart from another, on a bar, a line or a wedge.
 * A number is a slot rather than a share: the slots stand in a fixed order, taken in sequence and held to the thing
 * each one paints, so a filter dropping a series leaves the survivors their colours. Their separation under simulated
 * colour vision deficiency is what the order buys, so reordering or resampling them forfeits it, and a state is told
 * in the role that names it rather than in a slot. Nine hold where only neighbours are compared; where every pair is
 * compared, on a scatter, a bubble chart or a map, the first three hold and a fourth thing is faceted rather than
 * coloured. One value serves both colour schemes; four of the nine stay under 3:1 against the light page, so a chart
 * carrying them states its figures in text as well, through direct labels or a table view.
 *
 * **Area classes** — `colorArea1` to `colorArea4` fill a shape rather than draw a mark: a region on a choropleth, a
 * band on a terrain, a cell on a grid. They come as two pairs, a light and a dark of one hue each, so the members of
 * a pair are told apart by lightness where hue alone would fail, and the two hues read as two families; that pairing
 * is what a greyscale print survives on. Every pair of classes meets on a shared boundary, so the four are held to
 * the all-pairs measure rather than the adjacent one, and four is the limit: a fifth class is a second map, never a
 * fifth colour. The two pale classes stay under 3:1 against the light page, so a map keeps its boundaries drawn and
 * names its classes in the legend.
 *
 * @module palettes
 */


/**
 * The custom property behind every palette token.
 *
 * Narrowed to literals, so the design system contract can name the tokens and the custom properties they resolve to.
 */
export const palettes = {

	colorGray010: "--tile--color-gray-010",
	colorGray020: "--tile--color-gray-020",
	colorGray030: "--tile--color-gray-030",
	colorGray040: "--tile--color-gray-040",
	colorGray050: "--tile--color-gray-050",
	colorGray060: "--tile--color-gray-060",
	colorGray070: "--tile--color-gray-070",
	colorGray080: "--tile--color-gray-080",
	colorGray090: "--tile--color-gray-090",
	colorGray100: "--tile--color-gray-100",

	colorSubtle010: "--tile--color-subtle-010",
	colorSubtle020: "--tile--color-subtle-020",
	colorSubtle030: "--tile--color-subtle-030",
	colorSubtle040: "--tile--color-subtle-040",
	colorSubtle050: "--tile--color-subtle-050",
	colorSubtle060: "--tile--color-subtle-060",
	colorSubtle070: "--tile--color-subtle-070",
	colorSubtle080: "--tile--color-subtle-080",
	colorSubtle090: "--tile--color-subtle-090",
	colorSubtle100: "--tile--color-subtle-100",

	colorStrong010: "--tile--color-strong-010",
	colorStrong020: "--tile--color-strong-020",
	colorStrong030: "--tile--color-strong-030",
	colorStrong040: "--tile--color-strong-040",
	colorStrong050: "--tile--color-strong-050",
	colorStrong060: "--tile--color-strong-060",
	colorStrong070: "--tile--color-strong-070",
	colorStrong080: "--tile--color-strong-080",
	colorStrong090: "--tile--color-strong-090",
	colorStrong100: "--tile--color-strong-100",

	colorHeat010: "--tile--color-heat-010",
	colorHeat020: "--tile--color-heat-020",
	colorHeat030: "--tile--color-heat-030",
	colorHeat040: "--tile--color-heat-040",
	colorHeat050: "--tile--color-heat-050",
	colorHeat060: "--tile--color-heat-060",
	colorHeat070: "--tile--color-heat-070",
	colorHeat080: "--tile--color-heat-080",
	colorHeat090: "--tile--color-heat-090",
	colorHeat100: "--tile--color-heat-100",

	colorSeries1: "--tile--color-series-1",
	colorSeries2: "--tile--color-series-2",
	colorSeries3: "--tile--color-series-3",
	colorSeries4: "--tile--color-series-4",
	colorSeries5: "--tile--color-series-5",
	colorSeries6: "--tile--color-series-6",
	colorSeries7: "--tile--color-series-7",
	colorSeries8: "--tile--color-series-8",
	colorSeries9: "--tile--color-series-9",

	colorArea1: "--tile--color-area-1",
	colorArea2: "--tile--color-area-2",
	colorArea3: "--tile--color-area-3",
	colorArea4: "--tile--color-area-4"

} as const;
