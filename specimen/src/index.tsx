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
import { Tabs } from "@metreeca/tile-hive/tabs";
import { css, tile, type Token } from "@metreeca/tile-skin";
import "@metreeca/tile-skin/index.css";
import { type ComponentChild, render } from "preact";
import "./index.css";


/**
 * A token and what it is responsible for.
 */
type Entry = readonly [Token, string]


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

const borders: ReadonlyArray<Entry> = [

	[ tile.borderRadius, "fields and panels" ],
	[ tile.borderRadiusRound, "buttons" ]

];


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

render((

	<main>

		<h1>{app.icon && <img alt="" src={app.icon}/>}{app.name}</h1>

		<p>{app.info} This page is both its documentation and its proof, styled by nothing but the stylesheet it
			describes.</p>

		<Tabs name={app.name} panels={{

			Colours: <Colours/>,
			Scales: <Scales/>,
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

		<h3>Borders</h3>

		<Samples entries={borders} sample={token =>
			<span class="box" style={{ borderRadius: `var(${ token })` }}/>
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

		<pre><code>{`<section style={css({ [tile.colorAccentStrong]: "#06C" })}>`}</code></pre>

		<div class="themed" style={css({

			[tile.colorAccentSubtle]: "#264",
			[tile.colorAccentStrong]: "#06C"

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
	readonly sample: (token: Token) => ComponentChild;

}) {

	return <table class="samples">

		<tbody>{entries.map(([ token, note ]) => <tr key={token}>

			<td class="sample">{sample(token)}</td>
			<td><code>{token}</code></td>
			<td>{note}</td>

		</tr>)}</tbody>

	</table>;

}
