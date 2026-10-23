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

import { type ComponentChildren } from "preact";
import logo from "../index.svg";
import "./index.css";
import "./text.css";


/**
 * Creates the text section.
 *
 * Shows what plain document markup is given as it stands, with no class on anything: the inline treatments a passage
 * carries, the heading levels an outline is built from, the blocks set apart from the text around them, the lists and
 * definitions a page is structured with, and the images a reader enlarges with a click. Each group is set in a frame
 * of its own, tagged with the elements it carries, so a sample is never read as part of the notes around it.
 *
 * @returns The text section
 */
export function Text() {
	return <>

		<p>Plain document markup is styled as it stands: an app writes ordinary HTML and gets the type scale, the
			rhythm and the inline treatments without a class on anything. Each frame below holds markup exactly as an
			app would write it.</p>

		<h3>Inline</h3>

		<Frame tags={[ "a", "strong", "em", "code", "small" ]}>

			<p>A passage carries a <a href="#text">link</a> leading somewhere, a few <strong>strong words</strong> marked
				out from it, an <em>emphatic aside</em>, a <code>code span</code> naming one thing, and a trailing
				<small> note in small print</small>.</p>

		</Frame>

		<h3>Headings</h3>

		<p>The first level stands alone and every level below it shares one size, the hierarchy being carried by the
			face, the weight and the room around a heading rather than by a ladder of sizes.</p>

		{/* The samples are marked presentational, so they show how a heading is styled without joining the outline a
		 reader navigates the page by. */}

		<Frame tags={[ "h1", "h2", "h3" ]}>

			<h1 role="presentation">A first-level heading</h1>
			<p>The paragraph under a heading shows the room the heading keeps from the text it introduces.</p>

			<h2 role="presentation">A second-level heading</h2>
			<p>A second level opens a section within the page.</p>

			<h3 role="presentation">A third-level heading</h3>
			<p>A third level names a part of that section.</p>

		</Frame>

		<h3>Blocks</h3>

		<p>A quotation and a preformatted block sit on the stripe, set apart from the text around them without a
			border. Preformatted text keeps the lines it was given, so what runs past the measure is scrolled.</p>

		<Frame tags={[ "blockquote", "pre", "hr" ]}>

			<blockquote>
				<p>A quotation reads as set apart without a border.</p>
				<p>A second paragraph keeps the tighter rhythm of the block.</p>
			</blockquote>

			<pre><code>{
				`const style = css({ colorSubtle: "#345", colorStrong: "#D60", fontFamily: "Inter, sans-serif",`
				+ ` fontSizeLarge: "1.5em", spacing100: "1.25em", borderRadius025: "0.25em" });`
			}</code></pre>

			<p>A rule closes one passage before the next.</p>

			<hr/>

			<p>And the passage after it opens on the far side.</p>

		</Frame>

		<h3>Lists</h3>

		<Frame tags={[ "ul", "ol", "dl" ]} columns>

			<ul>
				<li>an unordered item</li>
				<li>
					another, with a nested list
					<ul>
						<li>nested once</li>
						<li>nested twice</li>
					</ul>
				</li>
				<li>and a last one</li>
			</ul>

			<ol>
				<li>an ordered item</li>
				<li>the one after it</li>
				<li>and the last one</li>
			</ol>

			<dl>
				<dt>Definition term</dt>
				<dd>The description explaining it.</dd>
				<dt>Another term</dt>
				<dd>And what it stands for.</dd>
			</dl>

		</Frame>

		<h3>Images</h3>

		<p>An image is enlarged over the whole page by a click, and restored by another click,
			by <kbd>Escape</kbd> or as soon as the focus moves. An image inside a link is left to the link.</p>

		<Frame tags={[ "img", "a > img" ]} columns>

			<figure>
				<p class="plate"><img src={logo} alt="The Metreeca logo" width={128} height={128}/></p>
				<figcaption>
					<strong>Plain image</strong>
					<span>Click to enlarge it over the page</span>
				</figcaption>
			</figure>

			<figure>
				<p class="plate"><a href="https://www.metreeca.com/">
					<img src={logo} alt="Metreeca" width={128} height={128}/>
				</a></p>
				<figcaption>
					<strong>Linked image</strong>
					<span>Click to follow its link instead</span>
				</figcaption>
			</figure>

		</Frame>

	</>;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Sets a markup sample in a frame of its own, tagged with the elements it carries.
 */
function Frame({ columns, tags, children }: {

	readonly columns?: boolean;
	readonly tags: ReadonlyArray<string>;

	readonly children: ComponentChildren;

}) {
	return <figure class="markup">

		<div class={columns ? "columns" : undefined}>{children}</div>

		<figcaption>{tags.map(tag => <code key={tag}>{`<${tag}>`}</code>)}</figcaption>

	</figure>;
}
