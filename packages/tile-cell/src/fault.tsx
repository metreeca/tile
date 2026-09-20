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
 * Fault.
 *
 * Offers the notice a screen shows in place of a resource an exchange failed to bring back, telling a reader what
 * they can act on in their own terms and handing them, where there is nothing to act on, what to pass on instead.
 *
 * @module
 */

import { isObject } from "@metreeca/core";
import { BadRequest, Forbidden, Gone, NotFound, Unauthorized } from "@metreeca/http";
import { type Problem } from "@metreeca/http/success";
import { type ComponentChildren } from "preact";
import { Icon } from "./icon.js";
import { Note } from "./note.js";


/**
 * The mark and the wording the failures a reader can make something of are told by, under the status standing for
 * each. Anything else is an unexpected failure, which no wording of ours improves on.
 *
 * The lines are broken where the sense breaks, rather than where the space happens to run out, each one standing
 * under the mark as a phrase the reader takes in whole.
 */
const Notices: Partial<Readonly<Record<number, readonly [Icon.LucideIcon, string]>>> = {

	[Unauthorized]: [ Icon.Unauthorized, "You're not signed in" ],
	[Forbidden]: [ Icon.Forbidden, "You're not authorized\nto access this resource" ],
	[NotFound]: [ Icon.NotFound, "The resource you're\nlooking for is missing" ],
	[Gone]: [ Icon.Gone, "The resource you're\nlooking for is gone" ]

};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a fault notice.
 *
 * Takes problem details as they are handed out by {@link @metreeca/http!success success} and shows them as a
 * warning note, so that a screen with nothing to render says why rather than staying blank.
 *
 * A failure the reader can act on is told in their own terms and left at that: an unidentified reader (401), one
 * denied access (403) and a resource missing (404) or withdrawn (410) are each answered by the reader themselves, so
 * the status, the explanation and the data the source sent along say nothing they can use.
 *
 * Anything else is an unexpected failure: the headline states the status and the summary the source gave it, and
 * everything else the source supplied stands beneath, the explanation first, then what the reader is asked to do
 * about it, then the machine-readable data, so that a report reaching whoever maintains the interface carries what
 * they need to place it.
 *
 * The standing wording is English, which `text` and the children replace where an interface speaks to its readers in
 * a language or a register of its own.
 *
 * @param options The widget configuration
 *
 * @returns The fault notice
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc9457 RFC 9457 - Problem Details for HTTP APIs}
 */
export function Fault({

	status,
	title,
	detail,
	report,

	text,

	children

}: Problem & {

	/**
	 * The wording the failure is told by, standing under the mark in place of the standing wording for the status at
	 * hand; a line break in it is shown where it is written.
	 */
	text?: string

	/**
	 * What the reader is asked to do about an unexpected failure, shown beneath the explanation; a standing request
	 * to report it if omitted, and never shown at all for a failure the reader can act on themselves.
	 */
	children?: ComponentChildren

}) {

	const notice = status === undefined ? undefined : Notices[status];

	const heading = status !== undefined && status >= BadRequest ? `Unexpected error ${status}` : "Unexpected error";

	const [ Mark, wording ] = notice ?? [ Icon.Error, title === undefined ? heading : `${heading}\n${title}` ];

	const $text = text ?? wording;

	const data = report !== undefined && !isObject(report, {}) // an empty payload states nothing worth showing
		? JSON.stringify(report, null, 2)
		: undefined;

	// the mark stands over the wording rather than beside it, the note stacking what it is given no headline for

	return <Note warning icon={<Mark/>}>

		<div>{$text}</div>

		{!notice && <>

			{detail && <div>{detail}</div>}

			<div>{children ?? "Please report. Thanks!"}</div>

			{data && <code>{data}</code>}

		</>}

	</Note>;

}
