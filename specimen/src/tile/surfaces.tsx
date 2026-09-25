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
 * Surface samples.
 *
 * @module
 */

import { css, tile } from "@metreeca/tile";
import { type Entry, Samples } from "./sample.js";
import "./index.css";
import "./surfaces.css";


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


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

		<h3>Boxes</h3>

		<p>The box tokens shape the one element they are assigned to, set from a step of the ladder each belongs
			to: <code>padding</code> from the spacing ladder, <code>borderRadius</code> from the radius ladder
			and <code>boxShadow</code> from the shadows above. No rule reads them, so they pad, round and lift that
			element and nothing inside it, whichever element a screen assigns them to:</p>

		<div class="boxed" style={css({
			backgroundColor: "backgroundColorRaised",
			boxShadow: "boxShadowRaised",
			borderRadius: "borderRadius050",
			padding: "spacing100"
		})}>
			<p>A plain element given a raised surface, its shadow, a rounding and a padding.</p>
		</div>

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
