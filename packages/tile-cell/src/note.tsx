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
 * Note.
 *
 * Offers the notice a screen shows where it has nothing else to put, whether an aside, a failure or a question,
 * centred in the space it is given and marked with a glyph unless the reader is asked to answer it.
 *
 * @module
 */

import { type ComponentChildren, createElement } from "preact";
import { Icon } from "./icon.js";
import "./note.css";


/**
 * Creates a note.
 *
 * Shows a glyph and a headline, with whatever detail is given beneath them, centred in the space the note is handed,
 * so a screen fills an area it has nothing else to put in without laying one out for the purpose.
 *
 * A note given a headline sets the mark beside it, on the one line a passing remark asks for; one given none sets the
 * mark on its own, above what the body carries.
 *
 * Where the reader is asked something, `onAccept` turns the head into a native control, so the activation by `Enter`
 * and `Space`, the tab stop and the focus ring come with it rather than having to be asked for. The head then stands
 * on its wording alone, the box around it saying that it answers to a click where a glyph would say it twice.
 *
 * A note telling of a failure is read out as soon as it reaches the page, so a reader who does not see it learns of
 * the failure where they expected the answer; an aside waits to be come upon in reading order.
 *
 * @param options The widget configuration
 *
 * @returns The note
 */
export function Note({

	level = "normal",

	icon,
	text,

	onAccept,

	children

}: {

	/**
	 * How much attention the passage deserves, told in the weight of the headline and the colour of the mark on the
	 * four-step scale every meaning in the interface lands on: `info` states something no verdict has been passed on
	 * (`info`), `highlight` singles out a passage worth having (`pass`), `warning` carries a caveat the reader is to
	 * weigh (`warn`), `critical` tells of a failure (`fail`), and `normal`, the default, says nothing in particular
	 * and takes no colour at all. A level is never told in colour alone, so a note carrying one says the same thing
	 * in its mark and its wording.
	 *
	 * A note telling of a failure is read out as soon as it reaches the page rather than waiting to be come upon.
	 */
	level?: "normal" | "info" | "highlight" | "warning" | "critical"


	/**
	 * The glyph marking the notice, kept out of the accessibility tree unless it carries a label of its own, so that
	 * the note is read by its headline; the mark matching the kind of notice if omitted, that is an alert where the
	 * passage carries a caution or tells of a failure and an information mark otherwise. A note the reader answers
	 * shows no mark at all, so what is given here plays no part alongside `onAccept`.
	 */
	icon?: ComponentChildren

	/**
	 * The headline the notice is read by, required where `onAccept` makes the head a control, which carries no mark
	 * to name it by. It is kept on the one line the head occupies, so wording asking for more room belongs in the
	 * body.
	 */
	text?: string


	/**
	 * What the reader's answer is handed to: supplying it turns the head into a control, boxed so that it reads as
	 * one before it is reached; a notice the reader only takes in if omitted.
	 *
	 * A screen taking the note away on the answer owes the reader somewhere to land, the control they were on going
	 * with it: only whoever removes the note knows what stands in its place, so the focus is theirs to hand on.
	 */
	onAccept?: () => void


	/**
	 * The detail shown beneath the head, in the column the note centres; plain markup, styled as the same markup is
	 * anywhere else on the page, with the element stating how the column is to take it: a `div` as a block of
	 * wording, centred and broken where the wording breaks it; a `p` as one paragraph of a stack; a `section` as a
	 * body scrolling within the note rather than stretching it; a `code` block as machine-readable detail set apart
	 * from the text above. An element left empty is dropped, so a detail rendered on a condition leaves no gap.
	 */
	children?: ComponentChildren

} & ({ onAccept?: undefined } | { text: string })) {

	const $icon = icon ?? (level === "warning" || level === "critical" ? <Icon.Alert/> : <Icon.Info/>);

	/*
	 * The element states the level, which a stylesheet has no other way to read.
	 *
	 * A note telling of a failure is read out as soon as it reaches the page, a failure being met where the reader
	 * expected what they asked for: a screen swapping one in for the content it could not show would otherwise
	 * leave a reader who does not see it waiting on an area that has already given its answer. An aside, which
	 * reports nothing, is met in reading order like any other passage.
	 */

	return createElement("tile-note", {

		role: level === "critical" ? "alert" : undefined,

		level

	}, <>

		{onAccept
			? <button type="button" onClick={onAccept}>{text}</button>
			: <span>{$icon}{text}</span>
		}

		{children}

	</>);

}
