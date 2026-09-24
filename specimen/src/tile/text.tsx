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
 * Text samples.
 *
 * @module
 */

import logo from "../index.svg";
import "./index.css";


/**
 * Creates the text section.
 *
 * Shows what plain document markup is given as it stands, with no class on anything: the measure body copy sets, the
 * inline treatments a passage carries, the heading levels an outline is built from, the blocks set apart from the
 * text around them, the images a reader enlarges with a click, and the lists and definitions a page is structured
 * with.
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
			+ ` fontSizeLarge: "1.5em", spacing100: "1.25em", borderRadius025: "0.25em" });`
		}</code></pre>

		<hr/>

		<h3>Images</h3>

		<p>An image is enlarged over the whole page by a click, and restored by another click, by <kbd>Escape</kbd> or
			as soon as the focus moves:</p>

		<p><img src={logo} alt="The Metreeca logo" width={96} height={96}/></p>

		<p>An image inside a link is left to the link, so a click follows it instead:</p>

		<p><a href="https://www.metreeca.com/"><img src={logo} alt="Metreeca" width={96} height={96}/></a></p>

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
