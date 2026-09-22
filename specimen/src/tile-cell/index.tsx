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
 * Widget samples.
 *
 * Shows what `@metreeca/tile-cell` offers a screen: the glyphs an interface asks for by role, and the controls and
 * notices built on them, each rendering the same plain markup the design system already styles.
 *
 * @module
 */

import { InternalServerError, NotFound } from "@metreeca/http";
import { scalings } from "@metreeca/specimen/tile";
import { type Entry, Samples } from "@metreeca/specimen/tile/sample";
import { css, tile } from "@metreeca/tile";
import { Button } from "@metreeca/tile-cell/button";
import { Fault } from "@metreeca/tile-cell/fault";
import { Icon } from "@metreeca/tile-cell/icon";
import { Logo } from "@metreeca/tile-cell/logo";
import { Note } from "@metreeca/tile-cell/note";
import { app } from "@metreeca/tile-data";
import { Style } from "@metreeca/tile-hive/style";
import { type ComponentChild, Fragment } from "preact";
import "./index.css";


/**
 * The name of an icon role and the glyph standing for it.
 */
type Glyph = readonly [string, Icon.LucideIcon]

/**
 * The name of an area of the interface and the roles it answers for.
 */
type Area = readonly [string, ReadonlyArray<Glyph>]

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

/**
 * Creates the widgets section.
 *
 * Shows what a widget adds over the markup the design system already styles: the lockup an app is recognised by, the
 * name a control is read by, the two axes a button is set on, and the notices a screen fills an empty or failed area
 * with.
 *
 * @returns The widgets section
 */
export function Widgets() {
	return <>

		<p>A widget renders the same plain markup the rules above style, adding what markup cannot carry on its own:
			the name a control is read by, the states it moves through, and the gestures it answers to.</p>

		<h3>Logos</h3>

		<p>A logo takes the app mark from what the document already states and sets it in a row with whatever names the
			app beside it, so a screen places the lockup rather than a mark and a name it has to keep together. The mark
			stands exactly as tall as the capitals around it and sits on their baseline, so it takes the size of the
			line it is set in rather than carrying a measure of its own.</p>

		<div class="controls">
			<Logo>{app.name}</Logo>
			<Logo name={app.name}/>
			<Style css={{ fontSize: "fontSizeLarge" }}><Logo>{app.name}</Logo></Style>
			<Style css={{ fontSize: "fontSizeSmall" }}><Logo>{app.name}</Logo></Style>
		</div>

		<p>A logo standing beside the app name leaves the mark decorative, read once through the name; one standing on
			the mark alone states what it stands for, as the second above does. A document stating no icon leaves the
			row holding only what it was given.</p>

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
			every mode against every look. The four steps are painted alike, a tinted fill told apart by hue, so they
			read as four meanings rather than as four degrees of loudness. Since no step is told by colour alone, every
			button here states the same thing in its glyph and its label.</p>

		{forms.map(([ form, sample ]) => <Buttons key={form} form={form} sample={sample}/>)}

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

		<p>The body is plain markup, and the element it is written as says how the column takes it: a block of wording
			centred and broken where the wording breaks it, a paragraph reading as one of a stack, or a section
			scrolling within the note rather than stretching it.</p>

		<div class="notes">

			<Note text="Nothing matched the filter">
				<p>Widen the range or drop a constraint to bring results back.</p>
				<p>The filters already set are kept, so nothing has to be stated twice.</p>
			</Note>

			<Note text="Release notes" onAccept={() => {}}>
				<section>
					<p>Tokens carry the values behind every colour, measure and duration.</p>
					<p>Widgets read them rather than stating values of their own.</p>
					<p>An app overrides a token to restyle everything that reads it.</p>
					<p>A colour scheme is pinned on the root element or on any subtree.</p>
					<p>A breakpoint is answered by a flag rather than asked as a width.</p>
				</section>
			</Note>

		</div>

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


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a button matrix.
 *
 * Runs every mode against every look in one form a button is carried in, so the two axes are read as composing
 * without meeting: a column says how loud a button is, a row says what activating it will do.
 *
 * @param options The widget configuration
 *
 * @returns The button matrix
 */
function Buttons({ form, sample }: {

	/**
	 * The name of the form the buttons are carried in, heading the matrix.
	 */
	readonly form: string;

	/**
	 * How a button is drawn in that form.
	 *
	 * @param look How loud the button appears
	 * @param action The mode the button carries, with the action and the glyph standing for it
	 */
	readonly sample: (look: Look, action: Action) => ComponentChild;

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
