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
 * Type samples.
 *
 * @module
 */

import { css, type Property, tile } from "@metreeca/tile";
import "./index.css";
import "./type.css";


/**
 * A typography token, the name a reader knows its role by and what the role is responsible for.
 */
type Role = readonly [Property, string, string]


const faces: ReadonlyArray<Role> = [

	[ tile.fontFamily, "Body", "copy, controls and everything not named below" ],
	[ tile.fontFamilyHeading, "Heading", "titles and headings, condensed to hold a long title on one line" ],
	[ tile.fontFamilyMono, "Mono", "code spans, and figures aligning down a column" ]

];

const sizes: ReadonlyArray<Role> = [

	[ tile.fontSizeLarge, "Large", "the page heading and a lead paragraph" ],
	[ tile.fontSizeHeading, "Heading", "every heading level below the first" ],
	[ tile.fontSize, "Body", "running text, relative to the reader's own setting" ],
	[ tile.fontSizeSmall, "Small", "small print, captions and table text" ]

];

const weights: ReadonlyArray<Role> = [

	[ tile.fontWeight, "Regular", "text at rest: copy and controls" ],
	[ tile.fontWeightStrong, "Strong", "anything marked out: links, labels, headings, tabs and strong looks" ]

];


const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 & ? ! @ ( ) { } → €";

const pangram = "Quick zephyrs blow, vexing daft Jim, while five big jet planes zoom over the quay";


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates the type section.
 *
 * Shows the type an interface is written in as it reads rather than as a list of values: the three faces with the
 * characters each carries, the size ladder set as lines of text, the two weights side by side, the leading a passage
 * of running text is set on, and the whole of it composed into a page the way plain markup takes it.
 *
 * @returns The type section
 */
export function Type() {
	return <>

		<p>Type is set from a handful of tokens: three faces, four sizes, two weights and one leading. Each is shown
			here doing its job, so retuning a token in the theming section shows its effect on every sample below.</p>

		<h3>Faces</h3>

		<p>Each face is a brand face ahead of a generic stack covering it until it loads, so an app supplying a face of
			its own keeps the fallbacks by restating them.</p>

		<div class="faces">{faces.map(([ property, name, role ]) =>

			<figure key={property} style={{ fontFamily: css.var(property) }}>
				<span class="letters">Aa</span>
				<span class="charset">{charset}</span>
				<figcaption>
					<strong>{name}</strong> {role}
					<code>{property}</code>
				</figcaption>
			</figure>
		)}</div>

		<h3>Sizes</h3>

		<p>The body size is stated in <code>rem</code>, so a page holds its rhythm wherever it is embedded, and grows
			by an eighth from a laptop window to a desktop one; the other steps are relative to whatever they sit in. Headings below the first share one size, their hierarchy
			carried by the face, the weight and the room around them.</p>

		<ol class="sizes">{sizes.map(([ property, name, role ]) =>

			<li key={property}>
				<span class="meta">
					<strong>{name}</strong>
					<span>{role}</span>
					<code>{property}</code>
				</span>
				<span class="line" style={{ fontSize: css.var(property) }}>{pangram}</span>
			</li>
		)}</ol>

		<h3>Weights</h3>

		<p>Two weights carry every text, set far enough apart to tell at a glance: one at rest and one marking a thing
			out, so emphasis reads the same in a passage, a label, a tab or a table header.</p>

		<div class="weights">{weights.map(([ property, name, role ]) =>

			<figure key={property} style={{ fontWeight: css.var(property), counterReset: `weight ${css.var(property)}` }}>
				<span class="letters">Aa</span>
				<span class="charset">{pangram}.</span>
				<figcaption>
					<strong>{name}</strong> <span class="value"/> {role}
					<code>{property}</code>
				</figcaption>
			</figure>
		)}</div>

		<h3>Leading</h3>

		<p>Every line of text is set on one leading, shown here as a band per line box, at the measure a passage of
			body copy is read at:</p>

		<figure class="leading">

			<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
				dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
				ex ea commodo consequat. Duis aute irure dolor in <a href="#type">reprehenderit in voluptate</a> velit
				esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
				culpa qui officia deserunt mollit anim id est laborum.</p>

			<p>Curabitur pretium tincidunt lacus, nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra,
				est eros bibendum elit, nec luctus magna felis sollicitudin mauris. <strong>Integer in mauris eu nibh
					euismod gravida.</strong> Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a
				elit, <em>etiam tempor</em> ut ullamcorper ligula, eu tempor congue eros est eu sapien.</p>

			<figcaption><code>{tile.lineHeight}</code></figcaption>

		</figure>

		<h3>Composition</h3>

		<p>Plain markup takes all of the above with no class on anything, so a page written as ordinary HTML reads as
			the interface around it. Headings add the tracking <code>{tile.letterSpacingHeading}</code> sets, neutral
			until a brand face asks otherwise:</p>

		<article class="composition">

			<h1 role="presentation">Field notes on the northern survey</h1>

			<p class="lead">A season spent mapping the coastal moors, and what the records say about how the ground
				has changed since the last survey was taken.</p>

			<h2 role="presentation">Method</h2>

			<p>Each plot was walked twice, once in spring and once at the end of summer, and every <strong>marked
				species</strong> was logged against the grid reference of the plot. The full dataset is
				in <a href="#type">the appendix</a>, and the grid itself follows the <code>OSGB36</code> datum.</p>

			<h3 role="presentation">Coverage</h3>

			<p>Coverage held for <em>most</em> of the northern sector; the eastern plots were reached only once, and
				are flagged wherever they appear.</p>

			<p><small>Figures rounded to the nearest whole plot. Last revised at the end of the season.</small></p>

		</article>

	</>;
}
