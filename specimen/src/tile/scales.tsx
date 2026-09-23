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
 * Scale samples.
 *
 * @module
 */

import { css, tile } from "@metreeca/tile";
import { type Entry, Samples } from "./sample.js";
import "./index.css";
import "./scales.css";


const spacings: ReadonlyArray<Entry> = [

	[ tile.spacing025, "gaps inside a control, and between list items" ],
	[ tile.spacing050, "cell and field padding" ],
	[ tile.spacing075, "the space under a description or a second-level heading" ],
	[ tile.spacing100, "the space between paragraphs" ],
	[ tile.spacing150, "the space between blocks, and the indent of a list" ],
	[ tile.spacing200, "the space between one band of a screen and the next" ],
	[ tile.spacing250, "the widest step, the room under a band of tabs" ]

];

const faces: ReadonlyArray<Entry> = [

	[ tile.fontFamily, "body copy, and everything not named below" ],
	[ tile.fontFamilyHeading, "a title" ],
	[ tile.fontFamilyMono, "a code span, and a figure aligning down a column" ]

];

const sizes: ReadonlyArray<Entry> = [

	[ tile.fontSizeSmall, "small print and table text" ],
	[ tile.fontSize, "body copy, relative to the reader's own setting" ],
	[ tile.fontSizeLarge, "the page heading" ],
	[ tile.fontSizeHeading, "every heading below the first, which all share it" ]

];

const tracking: ReadonlyArray<Entry> = [

	[ tile.letterSpacingHeading, "the tracking a heading takes, neutral until a brand face asks otherwise" ]

];

const leadings: ReadonlyArray<Entry> = [

	[ tile.lineHeight, "the leading every line of text is set on" ]

];

const weights: ReadonlyArray<Entry> = [

	[ tile.fontWeight, "body copy" ],
	[ tile.fontWeightStrong, "headings, links, terms and strong words" ],
	[ tile.fontWeightHeavy, "table headers" ]

];

const rules: ReadonlyArray<Entry> = [

	[ tile.borderStyle, "the line a border is drawn as" ],
	[ tile.borderWidth, "how heavy that line is drawn" ]

];

const marks: ReadonlyArray<Entry> = [

	[ tile.outlineFocus, "the ring marking what the keyboard has reached" ],
	[ tile.outlineInvalid, "the outline marking a value a field rejects" ]

];

const borders: ReadonlyArray<Entry> = [

	[ tile.borderRadius025, "a field, a panel or a button" ],
	[ tile.borderRadius050, "a badge or a chip, read as a marker rather than a box" ],
	[ tile.borderRadius075, "a card or a tile carrying a surface of its own" ],
	[ tile.borderRadius100, "a sheet or a dialog, the deepest corner the ladder draws" ]

];

const durations: ReadonlyArray<Entry> = [

	[ tile.durationFast, "a hover or a press, which the eye should not wait for" ],
	[ tile.durationNormal, "a panel opening or a row expanding, which has to be followed" ],
	[ tile.durationSlow, "a change covering the viewport" ]

];

const easings: ReadonlyArray<Entry> = [

	[ tile.easingEnter, "a thing arriving, decelerating into place" ],
	[ tile.easingExit, "a thing leaving, accelerating away" ],
	[ tile.easingStandard, "a thing that stays and merely moves" ]

];


/**
 * The scaling ladder, which sizes whatever is measured against the text rather than spaced from it.
 *
 * Shown here as a ladder in its own right, and again wherever a widget is sized against it.
 */
export const scalings: ReadonlyArray<Entry> = [

	[ tile.scaling025, "a dot no larger than the full stop beside it" ],
	[ tile.scaling050, "a bullet or a caret, half the height of the text" ],
	[ tile.scaling075, "a mark subordinate to its text" ],
	[ tile.scaling090, "a mark set a shade below the text" ],
	[ tile.scaling100, "an icon beside a label" ],
	[ tile.scaling110, "a mark set a shade above it" ],
	[ tile.scaling125, "a roundel or a swatch" ],
	[ tile.scaling150, "a glyph standing without a label" ],
	[ tile.scaling200, "a mark heading a panel" ],
	[ tile.scaling250, "a display mark on an empty or failed screen" ]

];


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates the scales section.
 *
 * Shows the ladders an interface is measured on: the spacing a thing is set apart by, the type it is written in, the
 * scaling a mark beside the text is sized on, the line and the radii a box is edged with, the marks a control wears
 * when it is reached or rejected, and the durations and curves a change is timed by, which run under the pointer.
 *
 * @returns The scales section
 */
export function Scales() {
	return <>

		<p>The spacing, scaling and radius ladders are stated in <code>em</code>, so a subtree given a size of its own
			takes its rhythm along. The body size stands apart, stated in <code>rem</code>, so a page holds its rhythm
			wherever it is embedded.</p>

		<h3>Spacing</h3>

		<Samples entries={spacings} sample={property =>
			<span class="bar" style={{ width: css.var(property) }}/>
		}/>

		<h3>Type</h3>

		<p>Three faces carry the whole interface, each a brand face ahead of a generic stack that covers it until it
			loads, so an app supplying a face of its own keeps the fallbacks by restating them.</p>

		<Samples entries={faces} sample={property =>
			<span style={{ fontFamily: css.var(property) }}>Aa</span>
		}/>

		<p>The small and large steps are relative, taking the size of whatever they sit in along. Headings below the
			first share one size, their hierarchy carried by the face, the weight and the room around them.</p>

		<Samples entries={sizes} sample={property =>
			<span style={{ fontSize: css.var(property) }}>Aa</span>
		}/>

		<Samples entries={weights} sample={property =>
			<span style={{ fontWeight: css.var(property) }}>Aa</span>
		}/>

		<Samples entries={tracking} sample={property =>
			<span style={{ letterSpacing: css.var(property) }}>Aa</span>
		}/>

		<Samples entries={leadings} sample={property =>
			<span class="leading" style={{ lineHeight: css.var(property) }}>Aa<br/>Aa</span>
		}/>

		<h3>Scaling</h3>

		<p>The scaling ladder sizes what is measured against the text rather than spaced from it: a glyph, a spinner,
			a swatch or a dot.</p>

		<Samples entries={scalings} sample={property =>
			<span class="box" style={{ width: css.var(property), height: css.var(property) }}/>
		}/>

		<h3>Borders</h3>

		<p>The line every edge is drawn with comes as a style and a weight, so a rule, a field and a panel are all
			bordered alike and overriding the two changes every edge on the page.</p>

		<Samples entries={rules} sample={() =>
			<span class="card"/>
		}/>

		<p>The focus ring and the invalid outline are whole shorthand values rather than colours, so a rule states the
			mark in one declaration and an app retuning the anchors carries it along.</p>

		<Samples entries={marks} sample={property => property === tile.outlineFocus

			? <span class="field" style={{
				outline: css.var(property),
				outlineOffset: `calc(-2 * ${ css.var(tile.borderWidth) })`
			}}>Value</span>
			: <span class="field" style={{ outline: css.var(property), outlineOffset: 0 }}>Value</span>

		}/>

		<p>The radius ladder runs on the steps the spacing ladder carries and is stated the same way, in
			<code>em</code>, so a box rounds by the same amount whatever size it is given and a column of boxes of
			differing heights reads as one corner throughout. A shape rather than a corner, a roundel or a pill, is a
			share of its own box instead, and the component drawing it says so rather than reaching for a step
			here.</p>

		<Samples entries={borders} sample={property =>
			<span class="box" style={{ borderRadius: css.var(property) }}/>
		}/>

		<h3>Motion</h3>

		<p>A duration says what kind of change it carries rather than how many milliseconds it lasts, so a whole
			interface slows down or speeds up from one place. Every duration collapses to zero for a reader who asked
			for less motion, which is the reason to state one as a token rather than as a literal.</p>

		<Samples entries={durations} sample={property =>
			<span class="slide" style={{ transitionDuration: css.var(property) }}/>
		}/>

		<p>The entering curve decelerates and the leaving one accelerates, so the two read as opposite halves of the
			same gesture.</p>

		<Samples entries={easings} sample={property =>
			<span class="slide" style={{ transitionTimingFunction: css.var(property) }}/>
		}/>

	</>;
}
