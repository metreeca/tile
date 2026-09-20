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

import { app } from "@metreeca/tile";
import { Icon } from "@metreeca/tile-cell/icon";
import { Tabs } from "@metreeca/tile-hive/tabs";
import { css, type Property, tile } from "@metreeca/tile-skin";
import "@metreeca/tile-skin/index.css";
import { type ComponentChild, Fragment, render } from "preact";
import "./index.css";


/**
 * The custom property of a token and what the token is responsible for.
 */
type Entry = readonly [Property, string]

/**
 * The name of an icon role and the glyph standing for it.
 */
type Glyph = readonly [string, Icon.LucideIcon]


const anchors: ReadonlyArray<Entry> = [

	[ tile.color, "the text the page is written in" ],
	[ tile.backgroundColor, "the canvas it is written on" ],
	[ tile.colorAccentSubtle, "the accent an interface carries at rest" ],
	[ tile.colorAccentStrong, "the accent marking a thing out" ],
	[ tile.colorInvalid, "the colour a failure is told in" ]

];

const roles: ReadonlyArray<Entry> = [

	[ tile.colorEnabled, "links and enabled controls" ],
	[ tile.colorHover, "links and buttons under the pointer" ],
	[ tile.colorFocus, "focus rings and controls being pressed" ],
	[ tile.colorDisabled, "controls that take no input" ],
	[ tile.colorLabel, "labels and secondary text" ],
	[ tile.colorPlaceholder, "the text a field shows while empty" ],
	[ tile.colorFaint, "hairlines and decorative marks" ],
	[ tile.borderColor, "borders and table rules" ],
	[ tile.backgroundColorEdit, "fields open to editing" ],
	[ tile.backgroundColorStripe, "striped rows and quoted blocks" ]

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
	[ tile.colorInvalid, "a mark telling a failure" ]

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

const strokes: ReadonlyArray<number> = [ 1, 1.5, 2, 3 ];


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

render((

	<main>

		<h1>{app.icon && <img alt="" src={app.icon}/>}{app.name}</h1>

		<p>{app.info} This page is both its documentation and its proof, styled by nothing but the stylesheet it
			describes.</p>

		<Tabs name={app.name} panels={{

			Colours: <Colours/>,
			Scales: <Scales/>,
			Icons: <Icons/>,
			Text: <Text/>,
			Tables: <Tables/>,
			Forms: <Forms/>,
			Theming: <Theming/>

		}}/>

		<footer><small>{app.copy}</small></footer>

	</main>

), document.body.appendChild(document.createElement(
	"tile-specimen"
)));


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Colours() {
	return <>

		<p>Five anchors carry the page, the accents standing in for a brand until an app supplies one, and the colour a
			failure is told in. Every other colour is derived from them, so an app that retunes the anchors carries the
			whole interface along, and the page follows the platform colour scheme without a second palette to
			maintain.</p>

		<h3>Anchors</h3>

		<Samples entries={anchors} sample={token =>
			<span class="roundel" style={{ backgroundColor: `var(${ token })` }}/>
		}/>

		<h3>Roles</h3>

		<p>A role names what a colour is for, not what it looks like: a component reads the role and inherits whatever
			the anchors make of it.</p>

		<Samples entries={roles} sample={token =>
			<span class="roundel" style={{ backgroundColor: `var(${ token })` }}/>
		}/>

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
					<td><code>{tile.colorAccentStrong}</code></td>
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

function Theming() {
	return <>

		<p>Assigning the anchors inline restyles a subtree, and everything derived from them follows, with no component
			change:</p>

		<pre><code>{`<section style={css({ colorAccentStrong: "#06C" })}>`}</code></pre>

		<div class="themed" style={css({

			colorAccentSubtle: "#264",
			colorAccentStrong: "#06C"

		})}>

			<p>The <a href="#theming">link</a> takes the resting accent, and the strong one under the pointer; the
				rejected value keeps the error colour, which no accent feeds.</p>

			<p>
				<input type="email" value="still not an address"/>{" "}
				<button type="button">Button</button>
			</p>

		</div>

	</>;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
