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

import { InternalServerError, NotFound } from "@metreeca/http";
import { app, host } from "@metreeca/tile";
import { Fault } from "@metreeca/tile-cell/fault";
import { Button } from "@metreeca/tile-cell/button";
import { Icon } from "@metreeca/tile-cell/icon";
import { Logo } from "@metreeca/tile-cell/logo";
import { Note } from "@metreeca/tile-cell/note";
import { Fetch, useFetch } from "@metreeca/tile-data/fetch";
import { Page } from "@metreeca/tile-hive/page";
import { Style } from "@metreeca/tile-hive/style";
import { Tabs } from "@metreeca/tile-hive/tabs";
import { css, type Property, tile } from "@metreeca/tile-skin";
import "@metreeca/tile-skin/index.css";
import { type ComponentChild, Fragment, render } from "preact";
import { useState } from "preact/hooks";
import "./index.css";


/**
 * The custom property of a token and what the token is responsible for.
 */
type Entry = readonly [Property, string]

/**
 * The custom property of a scale step or a series slot and the position it stands for.
 */
type Stop = readonly [Property, string]

/**
 * The custom properties a colour is drawn in and filled with, and what the two of them stand for.
 */
type Pair = readonly [Property, Property, string]

/**
 * The name of an icon role and the glyph standing for it.
 */
type Glyph = readonly [string, Icon.LucideIcon]

/**
 * How loud a button appears.
 */
type Look = NonNullable<Parameters<typeof Button>[0]["look"]>

/**
 * What activating a button will do.
 */
type Mode = NonNullable<Parameters<typeof Button>[0]["mode"]>

/**
 * A mode, the action standing for it, and the glyph marking that action.
 */
type Action = readonly [Mode, string, Icon.LucideIcon]

/**
 * The name of a form a button is carried in and the sample drawing an action in that form.
 */
type Form = readonly [string, (look: Look, action: Action) => ComponentChild]


const page: ReadonlyArray<Entry> = [

	[ tile.color, "the text the page is written in" ],
	[ tile.backgroundColor, "the canvas it is written on" ],
	[ tile.backgroundColorEdit, "a field open to editing" ],
	[ tile.backgroundColorStripe, "a striped row, a quoted block" ],
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

const looks: ReadonlyArray<Look> = [ "subtle", "normal", "strong" ];

const actions: ReadonlyArray<Action> = [

	[ "normal", "Close", Icon.Close ],
	[ "safe", "OK", Icon.Accept ],
	[ "commit", "Save", Icon.Save ],
	[ "alert", "Overwrite", Icon.Alert ],
	[ "danger", "Delete", Icon.Delete ]

];

const forms: ReadonlyArray<Form> = [

	[ "label and glyph", (look, [ mode, label, Glyph ]) =>
		<Button look={look} mode={mode} icon={<Glyph/>} label={label}/> ],

	[ "label", (look, [ mode, label ]) =>
		<Button look={look} mode={mode} label={label}/> ],

	[ "glyph", (look, [ mode, label, Glyph ]) =>
		<Button look={look} mode={mode} icon={<Glyph/>} name={label}/> ]

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
	[ tile.spacing150, "the space between blocks, and the indent of a list" ]

];

const sizes: ReadonlyArray<Entry> = [

	[ tile.fontSizeSmall, "small print and table text" ],
	[ tile.fontSize, "body copy, relative to the reader's own setting" ],
	[ tile.fontSizeLarge, "the page heading" ]

];

const weights: ReadonlyArray<Entry> = [

	[ tile.fontWeight, "body copy" ],
	[ tile.fontWeightStrong, "headings, links, terms and strong words" ],
	[ tile.fontWeightHeavy, "table headers" ]

];

const scalings: ReadonlyArray<Entry> = [

	[ tile.scaling075, "a mark subordinate to its text, a dot or a caret" ],
	[ tile.scaling090, "a mark set a shade below the text" ],
	[ tile.scaling100, "an icon beside a label" ],
	[ tile.scaling110, "a mark set a shade above it" ],
	[ tile.scaling125, "a roundel or a swatch" ],
	[ tile.scaling150, "a glyph standing without a label" ],
	[ tile.scaling200, "a mark heading a panel" ],
	[ tile.scaling250, "a display mark on an empty or failed screen" ]

];

const tints: ReadonlyArray<Entry> = [

	[ tile.color, "a mark in the text colour, which it takes by inheritance" ],
	[ tile.colorEnabled, "a mark on an enabled control" ],
	[ tile.colorHover, "a mark under the pointer" ],
	[ tile.colorLabel, "a mark beside secondary text" ],
	[ tile.colorDisabled, "a mark on a control taking no input" ],
	[ tile.colorFail, "a mark telling a failure" ]

];

const borders: ReadonlyArray<Entry> = [

	[ tile.borderRadius, "fields, panels and buttons" ],
	[ tile.borderRadius025, "a softly rounded mark" ],
	[ tile.borderRadius050, "a roundel, a swatch or an avatar" ],
	[ tile.borderRadius075, "a lozenge leaning towards the round" ],
	[ tile.borderRadius100, "a mark rounded to its own edges" ]

];

const areas: ReadonlyArray<readonly [string, ReadonlyArray<Glyph>]> = [

	[ "Session", [
		[ "LogIn", Icon.LogIn ],
		[ "LogOut", Icon.LogOut ]
	] ],

	[ "Navigation", [
		[ "Link", Icon.Link ],
		[ "Open", Icon.Open ],
		[ "Back", Icon.Back ]
	] ],

	[ "Disclosure", [
		[ "Expand", Icon.Expand ],
		[ "Collapse", Icon.Collapse ]
	] ],

	[ "Search", [
		[ "Search", Icon.Search ],
		[ "Clear", Icon.Clear ]
	] ],

	[ "Ordering", [
		[ "Sort", Icon.Sort ],
		[ "Increasing", Icon.Increasing ],
		[ "Decreasing", Icon.Decreasing ]
	] ],

	[ "Collections", [
		[ "Insert", Icon.Insert ],
		[ "Remove", Icon.Remove ]
	] ],

	[ "Records", [
		[ "Create", Icon.Create ],
		[ "Update", Icon.Update ],
		[ "Save", Icon.Save ],
		[ "Delete", Icon.Delete ]
	] ],

	[ "Confirmation", [
		[ "Accept", Icon.Accept ],
		[ "Cancel", Icon.Cancel ],
		[ "Close", Icon.Close ]
	] ],

	[ "Modes", [
		[ "Menu", Icon.Menu ],
		[ "Done", Icon.Done ]
	] ],

	[ "Notices", [
		[ "About", Icon.About ],
		[ "Info", Icon.Info ],
		[ "Alert", Icon.Alert ],
		[ "Help", Icon.Help ]
	] ],

	[ "Failures", [
		[ "Unauthorized", Icon.Unauthorized ],
		[ "Forbidden", Icon.Forbidden ],
		[ "NotFound", Icon.NotFound ],
		[ "Error", Icon.Error ]
	] ]

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

const thresholds: ReadonlyArray<Entry> = [

	[ tile.viewportSmall, "a phone held upright, from 30rem" ],
	[ tile.viewportMedium, "a tablet or a split window, from 48rem" ],
	[ tile.viewportLarge, "a laptop, from 64rem" ],
	[ tile.viewportXlarge, "a desktop, from 90rem" ]

];

const strokes: ReadonlyArray<number> = [ 1, 1.5, 2, 3 ];


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * What the sampler shows, keyed by the label the section is chosen by.
 */
const panels: Readonly<Record<string, ComponentChild>> = {

	Colours: <Colours/>,
	Surfaces: <Surfaces/>,
	Palettes: <Palettes/>,
	Scales: <Scales/>,
	Icons: <Icons/>,
	Text: <Text/>,
	Tables: <Tables/>,
	Forms: <Forms/>,
	Widgets: <Widgets/>,
	Theming: <Theming/>

};


/**
 * Stands in for the network, so that waiting is shown without anything to reach: every exchange takes the same
 * couple of seconds and comes back empty.
 */
async function stall() {

	await new Promise(resolve => setTimeout(resolve, 2000));

	return new Response("{}", { headers: { "Content-Type": "application/json" } });

}


render(<Fetch fetch={stall}><Specimen/></Fetch>, host("tile-specimen"));


/**
 * The sampler, laid out in the frame every screen of an app is laid out in, so that the frame is shown by being used
 * rather than by being described: the two flags it is tuned with are worked from the page itself.
 */
function Specimen() {

	const fetch = useFetch();

	const [lock, setLock] = useState(false);
	const [wide, setWide] = useState(false);

	return <Page

		lock={lock}
		wide={wide}

		logo={<Style css={{ fontSize: "fontSizeLarge" }}><Logo>{app.name}</Logo></Style>}
		meta={<small>v{VERSION}</small>}

		head={"!!!"}

		menu={<Button
			icon={lock ? <Icon.Expand/> : <Icon.Collapse/>}
			look="subtle"
			name={lock ? "Release the tray" : "Lock the tray"}
			onClick={() => setLock(!lock)}
		/>}

		tray={<>

			<h1>Sections</h1>

			{Object.keys(panels).map(label => <h2 key={label}>{label}</h2>)}

			<hr/>

			<h1>Layout</h1>

			<h2>
				<Button
					icon={wide ? <Icon.Collapse/> : <Icon.Expand/>}
					label={wide ? "Cap the measure" : "Take the width"}
					look="subtle"
					onClick={() => setWide(!wide)}
				/>
			</h2>

			<hr/>

			<h1>Waiting</h1>

			<h2>
				<Button
					icon={<Icon.Search/>}
					label="Run an exchange"
					look="subtle"
					onClick={() => { void fetch(app.base); }}
				/>
			</h2>

		</>}

		info={<small>{app.copy}</small>}
		copy={<small>Apache 2.0</small>}

	>

		<p>{app.info} This page is both its documentation and its proof, styled by nothing but the stylesheet it
			describes.</p>

		<Tabs name={app.name} panels={panels}/>

	</Page>;

}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Colours() {
	return <>

		<p>Every colour an interface paints with stands on the page pair and the two accents, and is derived from them,
			so an app that retunes those four carries the whole interface along. The four steps of the meaning scale stand
			apart, keeping values of their own, so an outcome reads as itself whatever an app brands with.</p>

		<h3>Page</h3>

		<p>What everything else is measured against, and the quiet marks the page itself is ruled and shaded with, each
			mixed towards the canvas so it carries no meaning of its own.</p>

		<Samples entries={page} sample={token =>
			<span class="roundel" style={{ backgroundColor: `var(${ token })` }}/>
		}/>

		<h3>Accents</h3>

		<p>The brand pair states an emphasis relative to each other and nothing else: which elements read them, and in
			which state, is the business of the roles derived from them. An app supplies a quieter value and a louder one,
			of any hue or lightness, and everything standing on them follows.</p>

		<Samples entries={accents} sample={token =>
			<span class="roundel" style={{ backgroundColor: `var(${ token })` }}/>
		}/>

		<h3>Meaning</h3>

		<p>Four steps, one unjudged and three of a verdict getting worse, shared by everything a widget has to say: how
			much attention a passage deserves, what activating a control will do, what the system says happened. Each step
			comes as a pair, one colour to draw the glyph and the rule in and one to fill the notice with, and a step is
			never told in colour alone.</p>

		<Pairs pairs={steps}/>

		<h3>Text</h3>

		<p>What text that is not body copy takes.</p>

		<Samples entries={texts} sample={token =>
			<span style={{ color: `var(${ token })` }}>Aa</span>
		}/>

		<h3>Controls</h3>

		<p>Each shown in the same bordered field, so the four read against one another: whether a control answers, what
			it shows while empty, and what the keyboard has reached. The focus colour is a ring rather than text, holding
			the 3:1 a boundary owes rather than the 4.5:1 a sentence does.</p>

		<Samples entries={controls} sample={token =>
			<span class={token === tile.colorFocus ? "field focused" : "field"} style={

				token === tile.colorFocus ? {} : { color: `var(${ token })` }

			}>Value</span>
		}/>

		<h3>States</h3>

		<p>What the pointer and an earlier choice leave behind, each as a pair: a control colouring its text takes the
			first, one filling its whole box takes the second, and the two are never combined on the same element, which
			would state the emphasis twice.</p>

		<Pairs pairs={states}/>

	</>;
}

function Surfaces() {
	return <>

		<p>A thing lifted off the page takes a surface and the shadow that goes with it, together: a surface alone
			reads as a flat patch of a slightly different colour, and a shadow alone lets the page show through
			wherever an element inherits its background.</p>

		<h3>Surfaces</h3>

		<p>The surfaces are derived by lightening the page, so one derivation serves both schemes. On a light scheme
			whose page is already white they resolve to the page itself and the shadow carries the whole separation,
			which is what the samples below show; on a dark scheme they lighten as expected.</p>

		<Samples entries={surfaces} sample={token =>
			<span class="card" style={{ backgroundColor: `var(${ token })` }}/>
		}/>

		<h3>Shadows</h3>

		<Samples entries={shadows} sample={token =>
			<span class="card" style={{ boxShadow: `var(${ token })` }}/>
		}/>

		<h3>Layering</h3>

		<p>The stacking order settles which of two things overlapping the page wins. A value is compared only against
			its siblings in the same stacking context, so a menu opened inside a dialog keeps the menu step and still
			paints above it, and no widget adds a step to clear an ancestor.</p>

		<Samples entries={stack} sample={token =>
			<code>{`var(${ token })`}</code>
		}/>

		<h3>Opacity</h3>

		<p>Fading the container carries its border, its glyph and whatever it encloses along, which a colour role
			cannot reach. A faded thing is exempt from the contrast budget only because it is also inert.</p>

		<Samples entries={fades} sample={token =>
			<span class="box" style={{ opacity: `var(${ token })` }}/>
		}/>

		<h3>Viewport</h3>

		<p>A media feature cannot read a custom property, so a breakpoint is not a width token: the stylesheet runs the
			four queries once and hands the answers on. A rule branches on the answer through a style query and never
			repeats the width, and the flags are floors, so a wider viewport leaves the narrower ones standing. Resize
			the window and watch the marks fill.</p>

		<Samples entries={thresholds} sample={token =>
			<span class={`flag ${ token.slice("--tile--".length) }`}/>
		}/>

	</>;
}

function Palettes() {
	return <>

		<p>A palette answers for a colour that stands for a position or for a thing rather than for a role: a cell in a
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

		<p>The heat ramp carries literals of its own, cool blue through green and red to a violet extremum standing for
			a measure past the top of its range. Its hue carries the reading and its lightness does not, so a step means
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

function Scales() {
	return <>

		<p>Spacing, type and border tokens are stated in <code>em</code>, so a subtree that changes size takes its
			rhythm along.</p>

		<h3>Spacing</h3>

		<Samples entries={spacings} sample={token =>
			<span class="bar" style={{ width: `var(${ token })` }}/>
		}/>

		<h3>Type</h3>

		<Samples entries={sizes} sample={token =>
			<span style={{ fontSize: `var(${ token })` }}>Aa</span>
		}/>

		<Samples entries={weights} sample={token =>
			<span style={{ fontWeight: `var(${ token })` }}>Aa</span>
		}/>

		<h3>Scaling</h3>

		<p>The scaling ladder sizes what is measured against the text rather than spaced from it: a glyph, a spinner,
			a swatch or a dot.</p>

		<Samples entries={scalings} sample={token =>
			<span class="box" style={{ width: `var(${ token })`, height: `var(${ token })` }}/>
		}/>

		<h3>Borders</h3>

		<p>The radius palette is stated as a share of the box, so a mark rounds with whatever size it is given. Each
			sample rounds two opposite corners: where the radii on one side add up to more than the side itself, the
			browser scales them down to fit, and every share above a half draws the same roundel.</p>

		<Samples entries={borders} sample={token =>
			<span class="box" style={{ borderRadius: `var(${ token }) 0` }}/>
		}/>

		<h3>Motion</h3>

		<p>A duration says what kind of change it carries rather than how many milliseconds it lasts, so a whole
			interface slows down or speeds up from one place. Every duration collapses to zero for a reader who asked
			for less motion, which is the reason to state one as a token rather than as a literal.</p>

		<Samples entries={durations} sample={token =>
			<span class="slide" style={{ transitionDuration: `var(${ token })` }}/>
		}/>

		<p>The entering curve decelerates and the leaving one accelerates, so the two read as opposite halves of the
			same gesture.</p>

		<Samples entries={easings} sample={token =>
			<span class="slide" style={{ transitionTimingFunction: `var(${ token })` }}/>
		}/>

	</>;
}

function Icons() {
	return <>

		<p>An icon is asked for by the role it plays rather than by the shape it draws, so every control doing the same
			thing carries the same glyph, and repointing a role restyles all of them at once.</p>

		<h3>Roles</h3>

		<dl class="areas">{areas.map(([ area, marks ]) => <Fragment key={area}>

			<dt>{area}</dt>

			<dd class="glyphs">{marks.map(([ name, Mark ]) =>
				<span key={name}><Mark/> <code>{name}</code></span>
			)}</dd>

		</Fragment>)}</dl>

		<h3>Size</h3>

		<p>A glyph is drawn at <code>{tile.scaling100}</code>, so it rides with the text around it; any other step of
			the ladder sizes it deliberately.</p>

		<Samples entries={scalings} sample={token =>
			<Icon.Rocket style={{ width: `var(${ token })`, height: `var(${ token })` }}/>
		}/>

		<h3>Stroke</h3>

		<p>Every glyph is stroked at <code>{tile.strokeWidth}</code>, in user units of the icon viewport, so the weight
			holds whatever size the glyph is drawn at.</p>

		<div class="glyphs">{strokes.map(width =>
			<span key={width}>
				<Icon.Alert style={{

					width: `var(${ tile.scaling200 })`,
					height: `var(${ tile.scaling200 })`,
					strokeWidth: width

				}}/>{" "}<code>{width}</code>
			</span>
		)}</div>

		<h3>Colour</h3>

		<p>A glyph strokes <code>currentColor</code>, so it takes the colour of whatever it sits in and stays pinned to
			its label through every state.</p>

		<Samples entries={tints} sample={token =>
			<Icon.Alert style={{ color: `var(${ token })` }}/>
		}/>

	</>;
}

function Text() {
	return <>

		<p>Plain document markup is styled as it stands: an app writes ordinary HTML and gets the type scale, the
			rhythm and the inline treatments without a class on anything.</p>

		<p>Body copy sets the measure: a <a href="#colours">link</a>, some <strong>strong</strong> words,
			an <em>emphatic aside</em>, a <code>code span</code> and a trailing <small>note in small print</small>.</p>

		<blockquote>
			<p>A quotation sits on the stripe background, so it reads as set apart without a border.</p>
			<p>A second paragraph keeps the tighter rhythm of the block.</p>
		</blockquote>

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

function Tables() {
	return <>

		<p>Rows alternate against the stripe background, cells are padded from the spacing scale, and a trailing empty
			header takes up the slack.</p>

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

function Forms() {
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

function Widgets() {
	return <>

		<p>A widget renders the same plain markup the rules above style, adding what markup cannot carry on its own:
			the name a control is read by, the states it moves through, and the gestures it answers to.</p>

		<h3>Buttons</h3>

		<p>A button is the native control, so the role, the activation by <code>Enter</code> and <code>Space</code>,
			the tab stop, the focus ring and the greyed disabled state all come from the platform and from the rules
			above. It shows a glyph, a label, or both, and takes every event handler a button accepts.</p>

		<div class="controls">
			<Button icon={<Icon.Create/>} label="New Item"/>
			<Button label="Plain"/>
			<Button icon={<Icon.Close/>} name="Close"/>
			<Button disabled icon={<Icon.Delete/>} label="Disabled"/>
		</div>

		<p>A button showing a label is named by it; one standing on a glyph alone states its name itself, which the
			type asks for. Whatever it carries, a button holds the smallest target a pointer is asked to hit, so a
			glyph standing alone is reached as comfortably as a label.</p>

		<p>How loud a button appears is set by <code>look</code>, told in room, weight and rule and never in colour,
			so the ladder holds in an interface printed in one ink.</p>

		<p>What activating a button will do is set by <code>mode</code>, told in colour on the four-step scale, and
			the two compose without meeting: a table below for each of the three forms a button is carried in, running
			every mode against every look. The four steps are built alike, a tinted fill ordered by hue, so a row of
			them is read by colour rather than by loudness. Since no step is told by colour alone, every button here
			states the same thing in its glyph and its label.</p>

		{forms.map(form => <Buttons key={form[0]} form={form}/>)}

		<p>A disabled button leaves its mode behind and takes the greyed colour every inactive control shares, since
			a control that answers nothing has nothing to say about what it would do.</p>

		<p>A button stating no look takes the one the area around it is written in, from <code>{tile.look}</code>.
			The row below wraps its controls in a <code>Style</code> area assigning it once, and holds three buttons
			that ask for nothing, plus one that asks to be loud and stays loud.</p>

		<div class="controls">
			<Style css={{ look: "subtle" }}>
				<Button icon={<Icon.Create/>} label="New Item"/>
				<Button label="Plain"/>
				<Button mode="danger" icon={<Icon.Delete/>} label="Delete"/>
				<Button look="strong" mode="commit" icon={<Icon.Save/>} label="Save"/>
			</Style>
		</div>

		<h3>Notes</h3>

		<p>A note fills an area a screen has nothing else to put in, marked with the glyph matching what it has to
			say: an aside, a failure, or a question the reader answers by activating the head.</p>

		<div class="notes">
			<Note><div>Nothing to show here</div></Note>
			<Note warning><div>{"The resource you're\nlooking for is missing"}</div></Note>
			<Note text="Discard the changes?" onAccept={() => {}}/>
		</div>

		<p>A note given a headline sets the mark beside it; one given none sets the mark above what the body carries.
			A failure is told by the weight of the head and the colour of the mark together.</p>

		<h3>Faults</h3>

		<p>A fault shows problem details as a note: a failure the reader can act on is told in their own terms and
			left at that, while an unexpected one carries the explanation, what to do about it, and the data the
			source sent along.</p>

		<div class="notes">

			<Fault status={NotFound}/>

			<Fault detail="The request could not be completed." report={{

				instance: "/products/42",
				trace: "java.lang.IllegalStateException"

			}} status={InternalServerError} title="Internal Server Error"/>

		</div>

	</>;
}

function Theming() {
	return <>

		<p>Assigning the anchors inline restyles a subtree, and everything derived from them follows, with no component
			change:</p>

		<pre><code>{`<section style={css({ colorStrong: "#06C" })}>`}</code></pre>

		<div class="themed" style={css({

			colorSubtle: "#264",
			colorStrong: "#06C"

		})}>

			<p>The <a href="#theming">link</a> takes the resting accent, and the strong one under the pointer; the
				rejected value keeps the error colour, which no accent feeds.</p>

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

			<p>This panel is pinned dark whatever the page around it is doing, and everything derived from the anchors
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


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Ramp({ chips, stops }: {

	readonly chips?: boolean;
	readonly stops: ReadonlyArray<Stop>;

}) {

	return <ol class={chips ? "ramp chips" : "ramp"}>{stops.map(([ token, step ]) => <li key={token}>

		<span style={{ backgroundColor: `var(${ token })` }}/>
		<code>{step}</code>

	</li>)}</ol>;

}

function Samples({ entries, sample }: {

	readonly entries: ReadonlyArray<Entry>;
	readonly sample: (property: Property) => ComponentChild;

}) {

	return <table class="samples">

		<tbody>{entries.map(([ token, note ]) => <tr key={token}>

			<td class="sample">{sample(token)}</td>
			<td><code>{token}</code></td>
			<td>{note}</td>

		</tr>)}</tbody>

	</table>;

}

function Buttons({ form: [ form, sample ] }: {

	readonly form: Form;

}) {

	return <table class="buttons">

		<thead>
			<tr>
				<th>{form}</th>
				{looks.map(look => <th key={look}><code>look="{look}"</code></th>)}
			</tr>
		</thead>

		<tbody>{actions.map(action => <tr key={action[0]}>

			<td><code>mode="{action[0]}"</code></td>
			{looks.map(look => <td key={look}>{sample(look, action)}</td>)}

		</tr>)}</tbody>

	</table>;

}

function Pairs({ pairs }: {

	readonly pairs: ReadonlyArray<Pair>;

}) {

	return <table class="samples">

		<tbody>{pairs.map(([ color, background, note ]) => <tr key={color}>

			<td class="sample">
				<span class="pair">
					<span class="roundel" style={{ backgroundColor: `var(${ color })` }}/>
					<span class="card" style={{

						borderColor: `var(${ color })`,
						backgroundColor: `var(${ background })`

					}}>Aa</span>
				</span>
			</td>

			<td><code>{color}</code><br/><code>{background}</code></td>
			<td>{note}</td>

		</tr>)}</tbody>

	</table>;

}
