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
 * Note samples.
 *
 * @module
 */

import { Note } from "@metreeca/tile-cell/note";
import "./index.css";


/**
 * Creates the notes section.
 *
 * Shows the notices a screen fills an empty area with, and how the body it is given is laid out.
 *
 * @returns The notes section
 */
export function Notes() {
	return <>

		<p>A note fills an area a screen has nothing else to put in, marked with the glyph matching what it has to
			say: an aside, a failure, or a question the reader answers by activating the head.</p>

		<div class="notes">
			<Note><div>Nothing to show here</div></Note>
			<Note level="critical"><div>{"The resource you're\nlooking for is missing"}</div></Note>
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

	</>;
}
