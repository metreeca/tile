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
 * Design system samples.
 *
 * Shows what `@metreeca/tile` decides: the colours an interface paints with, the surfaces it lifts things onto, the
 * palettes it charts with, and the ladders it sizes, spaces and times by. Every sample is drawn with the token it
 * names, and the text and tables around it take the base rules the same stylesheet gives plain markup.
 *
 * @module
 */

import { css, tile } from "@metreeca/tile";
import { type Entry, type Pair, Pairs, Ramp, Samples, type Stop } from "./sample.js";
import "./index.css";


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


const surfaces: ReadonlyArray<Entry> = [

	[ tile.backgroundColorSunken, "a well a thing is dropped into" ],
	[ tile.backgroundColorRaised, "a card or a sticky header, which stays in the flow" ],
	[ tile.backgroundColorOverlay, "a menu, a popover or a dialog, which leaves it" ]

];

const shadows: ReadonlyArray<Entry> = [

	[ tile.boxShadowRaised, "the lift a card carries" ],
	[ tile.boxShadowOverlay, "the lift a thing leaving the flow carries" ]

];

const blankets: ReadonlyArray<Entry> = [

	[ tile.backgroundColorBlanket, "what dims the page behind a thing demanding an answer" ]

];

const stack: ReadonlyArray<Entry> = [

	[ tile.zIndexSticky, "a header or a column pinned to an edge" ],
	[ tile.zIndexDropdown, "a menu or a popover attached to a control" ],
	[ tile.zIndexBlanket, "the dimming behind a thing demanding an answer" ],
	[ tile.zIndexModal, "the thing demanding it" ],
	[ tile.zIndexToast, "a message reporting what just happened" ],
	[ tile.zIndexTooltip, "the label explaining whatever is below it" ]

];

const fades: ReadonlyArray<Entry> = [

	[ tile.opacityLoading, "content on its way out while its replacement arrives" ],
	[ tile.opacityDisabled, "a whole composite that takes no input" ]

];

const thresholds: ReadonlyArray<Entry> = [

	[ tile.viewportSmall, "a phone held upright, from 30rem" ],
	[ tile.viewportMedium, "a tablet or a split window, from 48rem" ],
	[ tile.viewportLarge, "a laptop, from 64rem" ],
	[ tile.viewportXlarge, "a desktop, from 90rem" ]

];


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

	[ tile.boxShadowFocus, "the ring marking what the keyboard has reached" ],
	[ tile.outlineInvalid, "the outline marking a value a field rejects" ]

];

const borders: ReadonlyArray<Entry> = [

	[ tile.borderRadius, "fields, panels and buttons" ],
	[ tile.borderRadius025, "a softly rounded mark" ],
	[ tile.borderRadius050, "a roundel, a swatch or an avatar" ],
	[ tile.borderRadius075, "a lozenge leaning towards the round" ],
	[ tile.borderRadius100, "a mark rounded to its own edges" ]

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

/**
 * Creates the surfaces section.
 *
 * Shows what a thing lifted off the page takes: the surface it is painted on, the shadow pairing with it, the blanket
 * dimming whatever it covers, the step it is stacked at, the fade that says it is present but not available, and the
 * viewport flags a layout branches on, which fill as the window is resized.
 *
 * @returns The surfaces section
 */
export function Surfaces() {
	return <>

		<p>A thing lifted off the page takes a surface and the shadow that goes with it, together: a surface alone
			reads as a flat patch of a slightly different colour, and a shadow alone lets the page show through
			wherever an element inherits its background.</p>

		<h3>Surfaces</h3>

		<p>The surfaces are derived by lightening the page, so one derivation serves both schemes. On a light scheme
			whose page is already white they resolve to the page itself and the shadow carries the whole separation,
			which is what the samples below show; on a dark scheme they lighten as expected.</p>

		<Samples entries={surfaces} sample={property =>
			<span class="card" style={{ backgroundColor: css.var(property) }}/>
		}/>

		<h3>Shadows</h3>

		<Samples entries={shadows} sample={property =>
			<span class="card" style={{ boxShadow: css.var(property) }}/>
		}/>

		<h3>Blankets</h3>

		<p>A blanket is translucent, so it dims what it covers rather than replacing it, and the page stays visible
			behind the thing demanding an answer.</p>

		<Samples entries={blankets} sample={property =>
			<span class="card blanket">Aa<span style={{ backgroundColor: css.var(property) }}/></span>
		}/>

		<h3>Layering</h3>

		<p>The stacking order settles which of two things overlapping the page wins. A value is compared only against
			its siblings in the same stacking context, so a menu opened inside a dialog keeps the menu step and still
			paints above it, and no widget adds a step to clear an ancestor.</p>

		<Samples entries={stack} sample={property =>
			<code>{css.var(property)}</code>
		}/>

		<h3>Opacity</h3>

		<p>Fading the container carries its border, its glyph and whatever it encloses along, which a colour role
			cannot reach. A faded thing is exempt from the contrast budget only because it is also inert.</p>

		<Samples entries={fades} sample={property =>
			<span class="box" style={{ opacity: css.var(property) }}/>
		}/>

		<h3>Viewport</h3>

		<p>A media feature cannot read a custom property, so a breakpoint is not a width token: the stylesheet runs the
			four queries once and hands the answers on. A rule branches on the answer through a style query and never
			repeats the width, and the flags are floors, so a wider viewport leaves the narrower ones standing. Resize
			the window and watch the marks fill.</p>

		<Samples entries={thresholds} sample={property =>
			<span class={`flag ${ property.slice("--tile--".length) }`}/>
		}/>

	</>;
}

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

		<p>The spacing and scaling ladders, and the plain radius, are stated in <code>em</code>, so a subtree given a
			size of its own takes its rhythm along. The body size stands apart, stated in <code>rem</code>, so a page
			holds its rhythm wherever it is embedded.</p>

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

		<Samples entries={marks} sample={property => property === tile.boxShadowFocus

			? <span class="field" style={{ boxShadow: `inset ${ css.var(property) }` }}>Value</span>
			: <span class="field" style={{ outline: css.var(property), outlineOffset: 0 }}>Value</span>

		}/>

		<p>The radius palette is stated as a share of the box, so a mark rounds with whatever size it is given. Each
			sample rounds two opposite corners: where the radii on one side add up to more than the side itself, the
			browser scales them down to fit, and every share above a half draws the same roundel.</p>

		<Samples entries={borders} sample={property =>
			<span class="box" style={{ borderRadius: `${ css.var(property) } 0` }}/>
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

/**
 * Creates the text section.
 *
 * Shows what plain document markup is given as it stands, with no class on anything: the measure body copy sets, the
 * inline treatments a passage carries, the heading levels an outline is built from, the blocks set apart from the
 * text around them, and the lists and definitions a page is structured with.
 *
 * @returns The text section
 */
export function Text() {
	return <>

		<p>Plain document markup is styled as it stands: an app writes ordinary HTML and gets the type scale, the
			rhythm and the inline treatments without a class on anything.</p>

		<p>Body copy sets the measure: a <a href="#colours">link</a>, some <strong>strong</strong> words,
			an <em>emphatic aside</em>, a <code>code span</code> and a trailing <small>note in small print</small>.</p>

		<h3>Headings</h3>

		<p>The first level stands alone and every level below it shares one size, the hierarchy being carried by the
			face, the weight and the room around a heading rather than by a ladder of sizes, which keeps a deep outline
			readable in a column.</p>

		{/* The samples are marked presentational, so they show how a heading is styled without joining the outline
		 a reader navigates the page by. */}

		<h1 role="presentation">A first-level heading</h1>
		<h2 role="presentation">A second-level heading</h2>
		<h3 role="presentation">A third-level heading</h3>

		<hr/>

		<h3>Blocks</h3>

		<blockquote>
			<p>A quotation sits on the stripe background, so it reads as set apart without a border.</p>
			<p>A second paragraph keeps the tighter rhythm of the block.</p>
		</blockquote>

		<p>A preformatted block sits on the same stripe and keeps the lines it was given, so what runs past the measure
			is scrolled rather than folded:</p>

		<pre><code>{
			`const style = css({ colorSubtle: "#345", colorStrong: "#D60", fontFamily: "Inter, sans-serif",`
			+ ` fontSizeLarge: "1.5em", spacing100: "1.25em", borderRadius: "0.25em" });`
		}</code></pre>

		<hr/>

		<h3>Lists</h3>

		<ul>
			<li>an unordered item</li>
			<li>
				another, with a nested list
				<ul>
					<li>nested once</li>
					<li>nested twice</li>
				</ul>
			</li>
		</ul>

		<ol>
			<li>an ordered item</li>
			<li>and the one after it</li>
		</ol>

		<dl>
			<dt>Definition term</dt>
			<dd>The description explaining it.</dd>
			<dt>Another term</dt>
			<dd>And what it stands for.</dd>
		</dl>

	</>;
}

/**
 * Creates the tables section.
 *
 * Shows what a plain table is given: rows alternating against the stripe, cells padded from the spacing ladder, and a
 * trailing empty header taking the width the named columns leave.
 *
 * @returns The tables section
 */
export function Tables() {
	return <>

		<p>Rows alternate against the stripe background, cells are padded from the spacing scale, and a trailing empty
			header takes the width the named columns leave, so they stay as narrow as their content.</p>

		<table>

			<thead>
				<tr>
					<th>Token</th>
					<th>Kind</th>
					<th/>
				</tr>
			</thead>

			<tbody>
				<tr>
					<td><code>{tile.colorStrong}</code></td>
					<td>anchor</td>
					<td>carries the accent a mark is made in</td>
				</tr>
				<tr>
					<td><code>{tile.colorHover}</code></td>
					<td>role</td>
					<td>derived from the anchor above</td>
				</tr>
				<tr>
					<td><code>{tile.spacing050}</code></td>
					<td>scale</td>
					<td>pads these cells</td>
				</tr>
			</tbody>

		</table>

	</>;
}

/**
 * Creates the forms section.
 *
 * Shows the states a native control is given before a component adds anything of its own: what the keyboard has
 * reached, what a field standing empty shows, what a rejected value looks like, and what takes no input at all.
 *
 * @returns The forms section
 */
export function Forms() {
	return <>

		<p>Fields and buttons carry the focus, invalid and disabled roles, so the state of a control is legible before
			a component adds anything of its own.</p>

		<p>
			<input type="text" value="an editable value"/>{" "}
			<input type="text" placeholder="a placeholder" readOnly/>{" "}
			<input type="email" value="not an address"/>
		</p>

		<p>
			<label><input type="checkbox" checked/> checkbox</label>{" "}
			<label><input type="radio" name="sample" checked/> radio</label>{" "}
			<label><input type="radio" name="sample"/> another</label>
		</p>

		<p>
			<button type="button">Enabled</button>{" "}
			<button type="button" disabled>Disabled</button>
		</p>

	</>;
}

/**
 * Creates the theming section.
 *
 * Shows the two ways an interface is restyled without a component change: assigning the anchors to a subtree, which
 * everything derived from them follows, and pinning a colour scheme to a subtree, which a media query cannot express.
 *
 * @returns The theming section
 */
export function Theming() {
	return <>

		<p>Assigning the anchors inline restyles a subtree, and everything derived from them follows, with no component
			change:</p>

		<pre><code>{`<section style={css({ colorStrong: "#06C" })}>`}</code></pre>

		<div class="themed" style={css({

			colorSubtle: "#264",
			colorStrong: "#06C"

		})}>

			<p>The <a href="#theming">link</a> takes the resting accent, and the strong one under the pointer; the
				rejected value keeps the failure colour, which derives from no accent.</p>

			<p>
				<input type="email" value="still not an address"/>{" "}
				<button type="button">Button</button>
			</p>

		</div>

		<h3>Colour scheme</h3>

		<p>An interface follows the platform scheme on its own. An app that has to pin one sets <code>data-theme</code>
			to <code>light</code> or <code>dark</code>, on the root element or on any subtree that has to differ from
			the page around it, which a media query cannot express:</p>

		<pre><code>{`<aside data-theme="dark">`}</code></pre>

		<div class="themed" data-theme="dark">

			<p>This panel is pinned dark whatever scheme the page around it is in, and everything derived from the anchors
				follows: the <a href="#theming">link</a>, the rules, the fields and the striped rows.</p>

			<p>
				<input type="email" value="still not an address"/>{" "}
				<button type="button">Button</button>
			</p>

		</div>

		<p>Only the custom properties follow a pinned subtree. Native controls, scrollbars and the caret answer
			to <code>color-scheme</code>, which the stylesheet states alongside, so the widgets above are drawn dark
			too.</p>

	</>;
}
