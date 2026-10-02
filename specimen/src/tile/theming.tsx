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
 * Theming samples.
 *
 * @module
 */

import { css } from "@metreeca/tile";
import "./theming.css";


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

		<p>The pinned subtree takes the dark side of every anchor, the app's own overrides included, since the
			stylesheet settles it through <code>color-scheme</code>. Native controls, scrollbars and the caret answer
			to the same property, so the widgets above are drawn dark too.</p>

	</>;
}
