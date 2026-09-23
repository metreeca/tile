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
 * Palette samples.
 *
 * @module
 */

import { tile } from "@metreeca/tile";
import { Ramp, type Stop } from "./sample.js";
import "./index.css";


const grays: ReadonlyArray<Stop> = [

	[ tile.colorGray010, "010" ],
	[ tile.colorGray020, "020" ],
	[ tile.colorGray030, "030" ],
	[ tile.colorGray040, "040" ],
	[ tile.colorGray050, "050" ],
	[ tile.colorGray060, "060" ],
	[ tile.colorGray070, "070" ],
	[ tile.colorGray080, "080" ],
	[ tile.colorGray090, "090" ],
	[ tile.colorGray100, "100" ]

];

const subtles: ReadonlyArray<Stop> = [

	[ tile.colorSubtle010, "010" ],
	[ tile.colorSubtle020, "020" ],
	[ tile.colorSubtle030, "030" ],
	[ tile.colorSubtle040, "040" ],
	[ tile.colorSubtle050, "050" ],
	[ tile.colorSubtle060, "060" ],
	[ tile.colorSubtle070, "070" ],
	[ tile.colorSubtle080, "080" ],
	[ tile.colorSubtle090, "090" ],
	[ tile.colorSubtle100, "100" ]

];

const strongs: ReadonlyArray<Stop> = [

	[ tile.colorStrong010, "010" ],
	[ tile.colorStrong020, "020" ],
	[ tile.colorStrong030, "030" ],
	[ tile.colorStrong040, "040" ],
	[ tile.colorStrong050, "050" ],
	[ tile.colorStrong060, "060" ],
	[ tile.colorStrong070, "070" ],
	[ tile.colorStrong080, "080" ],
	[ tile.colorStrong090, "090" ],
	[ tile.colorStrong100, "100" ]

];

const heats: ReadonlyArray<Stop> = [

	[ tile.colorHeat010, "010" ],
	[ tile.colorHeat020, "020" ],
	[ tile.colorHeat030, "030" ],
	[ tile.colorHeat040, "040" ],
	[ tile.colorHeat050, "050" ],
	[ tile.colorHeat060, "060" ],
	[ tile.colorHeat070, "070" ],
	[ tile.colorHeat080, "080" ],
	[ tile.colorHeat090, "090" ],
	[ tile.colorHeat100, "100" ]

];

const classes: ReadonlyArray<Stop> = [

	[ tile.colorArea1, "1" ],
	[ tile.colorArea2, "2" ],
	[ tile.colorArea3, "3" ],
	[ tile.colorArea4, "4" ]

];

const series: ReadonlyArray<Stop> = [

	[ tile.colorSeries1, "1" ],
	[ tile.colorSeries2, "2" ],
	[ tile.colorSeries3, "3" ],
	[ tile.colorSeries4, "4" ],
	[ tile.colorSeries5, "5" ],
	[ tile.colorSeries6, "6" ],
	[ tile.colorSeries7, "7" ],
	[ tile.colorSeries8, "8" ],
	[ tile.colorSeries9, "9" ]

];


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates the palettes section.
 *
 * Shows the colours that stand for a position or for a thing rather than for a role: the neutral and accent ramps, the
 * heat bands, the series slots a chart tells one thing from another with, and the four classes a map fills areas with.
 *
 * @returns The palettes section
 */
export function Palettes() {
	return <>

		<p>A palette carries the colours that stand for a position or for a thing rather than for a role: a cell in a
			heat map, a band in a coding, a bar in a chart. A step is named by the share of the anchor it carries, so
			<code>010</code> is the faintest and <code>100</code> the anchor itself.</p>

		<h3>Greyscale</h3>

		<p>The neutral ramp mixes the text colour towards the page, so it reads the same way in either colour
			scheme.</p>

		<Ramp stops={grays}/>

		<h3>Accents</h3>

		<p>Both accent ramps derive from their anchor, so the brand this page states carries all the way through
			them.</p>

		<Ramp stops={subtles}/>
		<Ramp stops={strongs}/>

		<h3>Heat</h3>

		<p>The heat ramp carries literals of its own, cool blue through green and red to a violet standing for a
			measure past the top of the range. Its hue carries the reading and its lightness does not, so a step means
			a band a legend names, never a position on a gradient, and a consumer states the band in text beside the
			colour.</p>

		<Ramp stops={heats}/>

		<h3>Series</h3>

		<p>The slots tell one thing apart from another, so they read as separate chips rather than as one band. They
			stand in a fixed order, taken in sequence and held to the thing each one paints, so a filter dropping a
			series leaves the survivors their colours. Nine hold where only neighbours are compared, on bars, stacks
			and lines; where every pair is compared, on a scatter or a map, the first three hold and a fourth thing is
			faceted rather than coloured. Four of the nine stay under 3:1 against the page, so a chart carrying them
			states its figures in text as well.</p>

		<Ramp chips stops={series}/>

		<h3>Areas</h3>

		<p>The area classes fill a shape rather than draw a mark: a region on a choropleth, a band on a terrain, a cell
			on a grid. They come as two pairs, a light and a dark of one hue each, so the members of a pair are told
			apart by lightness where hue alone would fail and the two hues read as two families, which is what a
			greyscale print survives on. Four is the limit: a fifth class is a second map, never a fifth colour.</p>

		<Ramp chips stops={classes}/>

	</>;
}
