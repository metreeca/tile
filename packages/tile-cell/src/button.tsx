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
 * Button.
 *
 * Offers the control an action is taken with, shown as a glyph, a label, or both, with the activation, the focus
 * handling and the disabled state the platform already carries on a native button.
 *
 * @module
 */

import { type ComponentChildren, createElement, type TargetedMouseEvent } from "preact";
import "./button.css";


/**
 * Creates a button.
 *
 * Shows a glyph, a label, or a glyph followed by a label, on a native control, so the button role, the activation by
 * `Enter` and `Space`, the single tab stop, the focus ring and the greyed disabled state come with it rather than
 * having to be asked for. A button states a label, a name or a hint, and the type requires one of them: a glyph
 * standing alone is named by `name` or, failing that, by `title`; a hint offered beside a label or a name speaks to a
 * resting pointer alone and names nothing.
 *
 * The glyph is kept out of the accessibility tree, leaving the label, `name` or `title` to name the control, and
 * the control is drawn at least as large as the smallest target a pointer is asked to hit, label or no label.
 *
 * @param options The widget configuration
 *
 * @returns The button
 *
 * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/button/ ARIA Authoring Practices: Button Pattern}
 */
export function Button({

	name,

	disabled,

	icon,
	label,
	title,

	look, // deliberately left undefaulted, so an unstated look falls through to the ambient `--tile--look`
	mode = "normal",
	type = "button",

	onClick

}: {

	/**
	 * The accessible name, required where a glyph stands alone and no `title` names the button; where a label is shown
	 * as well, it must include the text of that label, so that a reader asking for the control by what they see
	 * reaches it.
	 */
	name?: string

	/**
	 * Whether the button is inactive, greyed and out of the tab order as the platform leaves a disabled control; live
	 * if omitted.
	 */
	disabled?: boolean

	/**
	 * The glyph marking the action, shown before the label and kept out of the accessibility tree, unless it carries
	 * a label of its own, so that the button is named once.
	 */
	icon?: ComponentChildren

	/**
	 * The text the button shows, naming it unless `name` states otherwise; omitted only where `name` or `title` names a
	 * glyph standing alone.
	 */
	label?: string

	/**
	 * The hint the platform shows on resting the pointer on the button, such as the shortcut it answers to or what a
	 * glyph stands for at greater length than its name; no hint if omitted.
	 *
	 * Beside a label or a `name` it names nothing. On a glyph standing alone with no `name` it names the button, and is
	 * then spoken as a name rather than as an aside, so it states what the button does before any shortcut. Either
	 * way it reaches neither a reader who never rests the pointer nor one on a touch screen, so whatever a reader has
	 * to take in to use the control belongs in the label or beside it rather than here.
	 */
	title?: string

	/**
	 * How loud the button appears, told in weight, rule and room rather than in colour, so it stays legible wherever
	 * colour does not reach: `subtle` keeps no rule and reads as part of the text around it, `strong` is bounded and
	 * set heaviest, and `normal` sits between the two. The appearance is independent of what the button means, which
	 * `mode` states.
	 *
	 * A button stating nothing takes the look the area around it is written in, from the `--tile--look` token the
	 * design system carries, which is `normal` where nothing assigns it. Stating a look here answers to that alone,
	 * so one loud control in a quietened toolbar stays loud.
	 */
	look?: "subtle" | "normal" | "strong"

	/**
	 * What activating the button will do, told in colour on the four-step scale every meaning in the interface lands
	 * on: `safe` is the harmless one where another destroys (`info`), `commit` makes a change stick (`pass`), `alert`
	 * asks for a second thought (`warn`), `danger` destroys (`fail`), and `normal`, the default, says nothing in
	 * particular and takes no colour at all. The four are built alike, a tinted fill ordered by hue, so none of them
	 * shouts past its neighbours and how loud the button appears stays `look`'s business. A mode is never told in
	 * colour alone, so a button carrying one says the same thing in its label or its glyph.
	 */
	mode?: "normal" | "safe" | "commit" | "alert" | "danger"

	/**
	 * What the button does to the form it sits in: `submit` sends it, `reset` restores it, and `button`, the default,
	 * leaves it alone, so that a button inside a form behaves as one outside it unless asked otherwise.
	 */
	type?: "button" | "submit" | "reset"

	/**
	 * What activating the button is handed to, whether the activation comes from a pointer, from `Enter` or from
	 * `Space`; a button whose work is done by the form it submits or resets if omitted. The activation event is handed
	 * over as it stands, so a handler may read the modifier keys it carries or stop a `submit` or `reset` from
	 * reaching the form.
	 *
	 * @param event The activation event
	 */
	onClick?: (event: TargetedMouseEvent<HTMLButtonElement>) => void

} & ({

	name: string

} | {

	label: string

} | {

	title: string

})) {

	/*
	 * The element states what it carries, a stylesheet having no way to tell a label from a glyph standing alone, and
	 * the two attributes it is styled by: they sit on the wrapper rather than on the control, so a rule reads them
	 * without competing with the states the platform sets on the button itself.
	 *
	 * A look the consumer leaves out leaves the attribute off the element as well, which is what lets the stylesheet
	 * tell a button asking for the ordinary step from one taking whatever the area around it is written in.
	 */

	return createElement("tile-button", {

		labelled: label !== undefined,

		look,
		mode

	}, <button

		disabled={disabled}

		aria-label={name}
		title={title}
		type={type}

		onClick={onClick}

	>{icon}{label}</button>);

}
