/*
 * Copyright © 2025-2026 Metreeca srl
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

import { css, tile, type Token } from "@metreeca/tile";
import "@metreeca/tile/index.css";
import { render } from "preact";
import "./index.css";


const anchors: ReadonlyArray<Token> = [

	tile.color,
	tile.backgroundColor,
	tile.colorAccentLite,
	tile.colorAccentDark

];

const roles: ReadonlyArray<Token> = [

	tile.colorLight,
	tile.colorLabel,
	tile.colorPlaceholder,
	tile.colorEnabled,
	tile.colorDisabled,
	tile.colorInvalid,
	tile.colorHover,
	tile.colorFocus,
	tile.borderColor,
	tile.backgroundColorEdit,
	tile.backgroundColorStripe

];

const spacings: ReadonlyArray<Token> = [

	tile.spacing025,
	tile.spacing050,
	tile.spacing075,
	tile.spacing100,
	tile.spacing150

];

const sizes: ReadonlyArray<Token> = [ tile.fontSizeSmall, tile.fontSize, tile.fontSizeLarge ];

const weights: ReadonlyArray<Token> = [ tile.fontWeight, tile.fontWeightStrong, tile.fontWeightHeavy ];

const radii: ReadonlyArray<Token> = [ tile.borderRadius, tile.borderRadiusRound ];


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Swatch({ token }: { readonly token: Token }) {
	return <li>
		<span class="swatch" style={{ backgroundColor: `var(${ token })` }}/>
		<code>{token}</code>
	</li>;
}

function Spacing({ token }: { readonly token: Token }) {
	return <li>
		<span class="bar" style={{ width: `var(${ token })` }}/>
		<code>{token}</code>
	</li>;
}

function Size({ token }: { readonly token: Token }) {
	return <li>
		<span style={{ fontSize: `var(${ token })` }}>Aa</span>
		<code>{token}</code>
	</li>;
}

function Weight({ token }: { readonly token: Token }) {
	return <li>
		<span style={{ fontWeight: `var(${ token })` }}>Aa</span>
		<code>{token}</code>
	</li>;
}

function Radius({ token }: { readonly token: Token }) {
	return <li>
		<span class="box" style={{ borderRadius: `var(${ token })` }}/>
		<code>{token}</code>
	</li>;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Tokens() {
	return <section>

		<h2>Tokens</h2>

		<p>Four anchors carry the brand and the page; every other colour is mixed from them, in whichever colour scheme
			the platform asks for.</p>

		<h3>Anchors</h3>

		<ul class="swatches">{anchors.map(token => <Swatch key={token} token={token}/>)}</ul>

		<h3>Roles</h3>

		<ul class="swatches">{roles.map(token => <Swatch key={token} token={token}/>)}</ul>

		<h3>Spacing</h3>

		<ul class="scale">{spacings.map(token => <Spacing key={token} token={token}/>)}</ul>

		<h3>Type</h3>

		<ul class="scale">{sizes.map(token => <Size key={token} token={token}/>)}</ul>
		<ul class="scale">{weights.map(token => <Weight key={token} token={token}/>)}</ul>

		<h3>Borders</h3>

		<ul class="scale">{radii.map(token => <Radius key={token} token={token}/>)}</ul>

	</section>;
}

function Text() {
	return <section>

		<h2>Text</h2>

		<h3>Headings and prose</h3>

		<p>Body copy sets the measure: a <a href="#tokens">link</a>, some <strong>strong</strong> words, an <em>emphatic
			aside</em>, a <code>code span</code> and a trailing <small>note in small print</small>.</p>

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

	</section>;
}

function Table() {
	return <section>

		<h2>Tables</h2>

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
					<td><code>{tile.colorAccentLite}</code></td>
					<td>anchor</td>
					<td>odd rows take the stripe background</td>
				</tr>
				<tr>
					<td><code>{tile.colorHover}</code></td>
					<td>derived</td>
					<td>even rows take the page background</td>
				</tr>
				<tr>
					<td><code>{tile.spacing050}</code></td>
					<td>scale</td>
					<td>cells are padded from the spacing scale</td>
				</tr>
			</tbody>

		</table>

	</section>;
}

function Form() {
	return <section>

		<h2>Forms</h2>

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

	</section>;
}

function Theming() {
	return <section>

		<h2>Theming</h2>

		<p>Assigning the anchors inline restyles a subtree and everything mixed from them follows, with no component
			change:</p>

		<div class="themed" style={css({

			[tile.colorAccentLite]: "#06C",
			[tile.colorAccentDark]: "#264"

		})}>

			<p>A <a href="#theming">link</a> takes the slate anchor, an invalid field the other one.</p>

			<p>
				<input type="email" value="still not an address"/>{" "}
				<button type="button">Button</button>
			</p>

		</div>

	</section>;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

render((

	<article>

		<h1>{NAME}</h1>

		<Tokens/>
		<Text/>
		<Table/>
		<Form/>
		<Theming/>

	</article>

), document.body.firstElementChild!);
