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
 * Icon samples.
 *
 * @module
 */

import { scalings } from "@metreeca/specimen/tile/scales";
import { type Entry, Samples } from "@metreeca/specimen/tile/sample";
import { css, tile } from "@metreeca/tile";
import { Icon } from "@metreeca/tile-cell/icon";
import { Fragment } from "preact";
import "./icons.css";


/**
 * The name of an icon role and the glyph standing for it.
 */
type Glyph = readonly [string, Icon.LucideIcon]

/**
 * The name of an area of the interface and the roles it answers for.
 */
type Area = readonly [string, ReadonlyArray<Glyph>]


const areas: ReadonlyArray<Area> = [

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

const strokes: ReadonlyArray<number> = [ 1, 1.5, 2, 3 ];

const tints: ReadonlyArray<Entry> = [

	[ tile.color, "a mark in the text colour, which it takes by inheritance" ],
	[ tile.colorEnabled, "a mark on an enabled control" ],
	[ tile.colorHover, "a mark under the pointer" ],
	[ tile.colorLabel, "a mark beside secondary text" ],
	[ tile.colorDisabled, "a mark on a control taking no input" ],
	[ tile.colorFail, "a mark telling a failure" ]

];


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates the icons section.
 *
 * Shows the roles a glyph is asked for by, grouped by the area of the interface each answers for, and what a glyph
 * takes from the text around it: the step of the scaling ladder it is drawn at, the weight it is stroked at, and the
 * colour it inherits.
 *
 * @returns The icons section
 */
export function Icons() {
	return <>

		<p>An icon is asked for by the role it plays rather than by the shape it draws, so every control doing the same
			thing carries the same glyph, and pointing a role at another glyph changes all of them at once.</p>

		<h3>Roles</h3>

		<dl class="areas">{areas.map(([ area, marks ]) => <Fragment key={area}>

			<dt>{area}</dt>

			<dd class="glyphs">{marks.map(([ name, Mark ]) =>
				<span key={name}><Mark/> <code>{name}</code></span>
			)}</dd>

		</Fragment>)}</dl>

		<h3>Size</h3>

		<p>A glyph is drawn at <code>{tile.scaling100}</code>, so it rides with the text around it; any other step of
			the ladder is a size stated on purpose.</p>

		<Samples entries={scalings} sample={property =>
			<Icon.Rocket style={{ width: css.var(property), height: css.var(property) }}/>
		}/>

		<h3>Stroke</h3>

		<p>Every glyph is stroked at <code>{tile.strokeWidth}</code>, in user units of the icon viewport, so the weight
			holds whatever size the glyph is drawn at.</p>

		<div class="glyphs">{strokes.map(width =>
			<span key={width}>
				<Icon.Alert style={{

					width: css.var(tile.scaling200),
					height: css.var(tile.scaling200),
					strokeWidth: width

				}}/>{" "}<code>{width}</code>
			</span>
		)}</div>

		<h3>Colour</h3>

		<p>A glyph strokes <code>currentColor</code>, so it takes the colour of whatever it sits in and matches its
			label through every state.</p>

		<Samples entries={tints} sample={property =>
			<Icon.Alert style={{ color: css.var(property) }}/>
		}/>

	</>;
}
