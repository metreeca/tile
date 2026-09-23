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
 * Button samples.
 *
 * @module
 */

import { tile } from "@metreeca/tile";
import { Button } from "@metreeca/tile-cell/button";
import { Icon } from "@metreeca/tile-cell/icon";
import { Style } from "@metreeca/tile-hive/style";
import { type ComponentChild } from "preact";
import "./index.css";
import "./buttons.css";


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
 * Creates the buttons section.
 *
 * Shows the name a control is read by and the two axes a button is set on: how loud it appears and what activating it
 * will do.
 *
 * @returns The buttons section
 */
export function Buttons() {
	return <>

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

		{forms.map(([ form, sample ]) => <Matrix key={form} form={form} sample={sample}/>)}

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
function Matrix({ form, sample }: {

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
