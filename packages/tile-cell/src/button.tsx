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

import { type ComponentChildren, createElement } from "preact";
import "./button.css";
import { type Handlers } from "./index.js";


/**
 * Creates a button.
 *
 * Shows a glyph, a label, or a glyph followed by a label, on a native control, so the button role, the activation by
 * `Enter` and `Space`, the single tab stop, the focus ring and the greyed disabled state come with it rather than
 * having to be asked for. A button states a label, a name, or both: a glyph standing alone is named by `name`, which
 * the type requires.
 *
 * The glyph is kept out of the accessibility tree, leaving the label or `name` to name the control on its own, and
 * the control is drawn at least as large as the smallest target a pointer is asked to hit, label or no label.
 *
 * Every event handler a `<button>` accepts is passed on unchanged, so a gesture beyond activation is wired without
 * wrapping the widget in an element of its own.
 *
 * @param options The widget configuration
 *
 * @returns The button
 *
 * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/button/ ARIA Authoring Practices: Button Pattern}
 */
export function Button({

	disabled,

	icon,
	label,
	name,
	type = "button",

	...handlers

}: {

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
	 * The text the button shows, naming it unless `name` states otherwise; omitted only where `name` names a glyph
	 * standing alone.
	 */
	label?: string

	/**
	 * The accessible name, required where a glyph stands alone and no text names the button; where a label is shown as
	 * well, it must include the text of that label, so that a reader asking for the control by what they see reaches
	 * it.
	 */
	name?: string

	/**
	 * What the button does to the form it sits in: `submit` sends it, `reset` restores it, and `button`, the default,
	 * leaves it alone, so that a button inside a form behaves as one outside it unless asked otherwise.
	 */
	type?: "button" | "submit" | "reset"

} & ({ label: string } | { name: string }) & Handlers<"button">) {

	// the element states what it carries, a stylesheet having no way to tell a label from a glyph standing alone

	return createElement("tile-button", {

		labelled: label !== undefined

	}, <button

		disabled={disabled}

		aria-label={name}
		type={type}

		{...handlers}

	>{icon}{label}</button>);

}
