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
 * Colour samples.
 *
 * @module
 */

import { css, tile } from "@metreeca/tile";
import { type Entry, type Pair, Pairs, Samples } from "./sample.js";
import "./index.css";
import "./colours.css";


const page: ReadonlyArray<Entry> = [

	[ tile.color, "the text the page is written in" ],
	[ tile.backgroundColor, "the canvas it is written on" ],
	[ tile.backgroundColorEdit, "a field open to editing" ],
	[ tile.backgroundColorStripe, "a striped row, a quoted or preformatted block" ],
	[ tile.borderColor, "a rule between things" ]

];

const accents: ReadonlyArray<Entry> = [

	[ tile.colorSubtle, "the quieter of the two, near-neutral" ],
	[ tile.colorStrong, "the louder of the two, saturated" ]

];

const steps: ReadonlyArray<Pair> = [

	[ tile.colorInfo, tile.backgroundColorInfo, "stated or provisional" ],
	[ tile.colorPass, tile.backgroundColorPass, "completed as intended" ],
	[ tile.colorWarn, tile.backgroundColorWarn, "completed with caveats" ],
	[ tile.colorFail, tile.backgroundColorFail, "failed to complete" ]

];

const texts: ReadonlyArray<Entry> = [

	[ tile.colorLabel, "labels and secondary text" ]

];

const controls: ReadonlyArray<Entry> = [

	[ tile.colorEnabled, "a control that answers" ],
	[ tile.colorDisabled, "a control that takes no input" ],
	[ tile.colorPlaceholder, "a field standing empty" ],
	[ tile.colorFocus, "a control the keyboard has reached" ]

];

const states: ReadonlyArray<Pair> = [

	[ tile.colorHover, tile.backgroundColorHover, "under the pointer" ],
	[ tile.colorSelected, tile.backgroundColorSelected, "left standing by an earlier choice" ],
	[ tile.colorPressed, tile.backgroundColorPressed, "while it is being acted on" ]

];

const fills: ReadonlyArray<Entry> = [

	[ tile.colorOver, "what text takes over a step painted as a fill" ]

];


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates the colours section.
 *
 * Shows the anchors an app retunes an interface from and every role derived from them, each colour standing in the
 * shape it is legible in: a swatch for a page colour, a bordered field for a control colour, a mark beside the
 * notice it fills for a step of the meaning scale, and a filled badge for the ink a message over one takes.
 *
 * @returns The colours section
 */
export function Colours() {
	return <>

		<p>Every colour role an interface paints with derives from the page pair and the two accents, so an app that
			retunes those four carries the whole interface along. The four steps of the meaning scale stand apart,
			keeping values of their own, so an outcome reads as itself whatever an app brands with.</p>

		<h3>Page</h3>

		<p>The pair everything else is measured against, and the quiet marks the page is ruled and shaded with, which
			are mixed towards the canvas so they carry no meaning of their own.</p>

		<Samples entries={page}/>

		<h3>Accents</h3>

		<p>The brand pair states an emphasis relative to each other and nothing else: which elements read them, and in
			which state, is settled by the roles derived from them. An app supplies a quieter value and a louder one, of
			any hue or lightness, and everything standing on them follows.</p>

		<Samples entries={accents}/>

		<h3>Meaning</h3>

		<p>Four steps, one unjudged and three of a verdict getting worse, shared by everything a widget has to say: how
			much attention a passage deserves, what activating a control will do, what the system says happened. Each step
			comes as a pair, one colour to draw the glyph and the rule in and one to fill the notice with, and a step is
			never told in colour alone.</p>

		<Pairs pairs={steps}/>

		<p>The caution step is a fill rather than a stroke, so a caution paints a badge and sets its message in the
			colour below, which resolves to whichever page anchor is the dark one and so stays dark in both colour
			schemes, where the page pair otherwise swaps sides.</p>

		<Samples entries={fills} sample={property =>
			<span class="badge" style={{ color: css.var(property) }}>Aa</span>
		}/>

		<h3>Text</h3>

		<p>What text other than body copy takes.</p>

		<Samples entries={texts} sample={property =>
			<span style={{ color: css.var(property) }}>Aa</span>
		}/>

		<h3>Controls</h3>

		<p>Each shown in the same bordered field, so the four read against one another: a control that answers, one
			that takes no input, a field standing empty, and what the keyboard has reached. The focus colour is a ring
			rather than text, holding the 3:1 a boundary owes rather than the 4.5:1 a sentence does.</p>

		<Samples entries={controls} sample={property =>
			<span class={property === tile.colorFocus ? "field focused" : "field"} style={

				property === tile.colorFocus ? {} : { color: css.var(property) }

			}>Value</span>
		}/>

		<h3>States</h3>

		<p>What the pointer, an earlier choice and an activation under way mark a control with, each as a pair: a
			control colouring its text takes the first, one filling its whole box takes the second, and the two are
			never combined on the same element, which would state the emphasis twice.</p>

		<Pairs pairs={states}/>

	</>;
}
