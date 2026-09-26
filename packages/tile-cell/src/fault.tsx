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

import { isObject, opt } from "@metreeca/core";
import { BadRequest, Forbidden, Gone, NotFound, Unauthorized } from "@metreeca/http";
import { type Problem } from "@metreeca/http/success";
import { Icon } from "./icon.js";
import { Note } from "./note.js";


/**
 * The mark and the standing wording the failures a reader can make something of are told by, under the status standing
 * for each. Anything else is an unexpected failure, which no wording of ours improves on.
 *
 * The lines break where the sense breaks, so each stands under the mark as a phrase the reader takes in whole.
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
 * note telling of a failure, so that a screen with nothing to render says why rather than staying blank. The notice
 * is read out as soon as it reaches the page, the failure arriving where the reader expected what they asked for.
 *
 * A failure the reader can act on is told in their own terms and left at that: an unidentified reader (401), one
 * denied access (403) and a resource missing (404) or withdrawn (410) are each answered by the reader themselves. Such
 * a fault is raised by the interface itself, and its `detail` is the wording the reader is told, standing under the
 * mark with its line breaks shown where they are written; a standing English wording for the status if omitted. The
 * summary and the data carried along say nothing the reader can use, and are left out.
 *
 * Anything else is an unexpected failure, a technical error raised by the source: the headline states the status
 * and the summary the source gave it, and everything else the source supplied stands beneath, the explanation first,
 * then the machine-readable data, so that whoever maintains the interface finds what they need to place the failure.
 *
 * @param options The widget configuration
 *
 * @returns The fault notice
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc9457 RFC 9457 - Problem Details for HTTP APIs}
 */
export function Fault({

	title,
	status,
	detail,
	report

}: Problem) {

	const notice = opt(status, status => Notices[status]);

	const heading = status !== undefined && status >= BadRequest ? `Unexpected error ${status}` : "Unexpected error";

	const [ Mark, wording ] = notice
		? [ notice[0], detail ?? notice[1] ]
		: [ Icon.Error, opt(title, title => `${heading}\n${title}`, heading) ];

	const data = report !== undefined && !isObject(report, {}) // an empty payload states nothing worth showing
		? JSON.stringify(report, null, 2)
		: undefined;

	// the mark stands over the wording rather than beside it, the note stacking what it is given no headline for

	return <Note icon={<Mark/>} level="critical">

		<div>{wording}</div>

		{!notice && <>

			{detail && <div>{detail}</div>}

			{data && <code>{data}</code>}

		</>}

	</Note>;

}
