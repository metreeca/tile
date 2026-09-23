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
 * Shell samples.
 *
 * @module
 */


/**
 * Creates the shell section.
 *
 * Shows the frame a screen is laid out in by pointing at the one this page stands in, rather than nesting a second
 * frame inside it.
 *
 * @returns The shell section
 */
export function Shells() {
	return <>

		<p>The frame around this page is a shell: a tray of standing controls beside the content of the moment, each
			column carrying a header that stays in view as it scrolls and a footer beneath what it holds. A screen
			states what goes in each slot and leaves the arrangement to the shell, and a slot left out takes no
			room.</p>

		<table>

			<thead>
				<tr>
					<th>Slot</th>
					<th>Holds</th>
					<th>On this page</th>
				</tr>
			</thead>

			<tbody>
				<tr><td><code>logo</code></td><td>the mark the app is recognised by</td><td>the lockup, leading home</td></tr>
				<tr><td><code>meta</code></td><td>what stands opposite the mark</td><td>the lock toggle</td></tr>
				<tr><td><code>tray</code></td><td>the standing controls</td><td>the links to this section's pages</td></tr>
				<tr><td><code>info</code></td><td>the foot of the tray</td><td>the reader signed in, or the way in</td></tr>
				<tr><td><code>head</code></td><td>what the content is called</td><td>the frame toggles and the package links</td></tr>
				<tr><td><code>menu</code></td><td>the end of the content header</td><td>the release and the exchange control</td></tr>
				<tr><td><code>foot</code></td><td>the foot of the content</td><td>the copyright</td></tr>
			</tbody>

		</table>

		<p>Three switches reshape the frame, and the controls in the headers above work them on this very page:</p>

		<ul>
			<li><code>lock</code> takes the tray out of reach for pointer and keyboard alike; the padlock sets it for a
				second</li>
			<li><code>main</code> leaves the tray out of the frame altogether; the panel toggle sets it</li>
			<li><code>wide</code> lifts the reading measure the content is otherwise capped at; the chevrons set it</li>
		</ul>

		<p>Waiting is stated by the shell itself: while the shared client has exchanges in flight, the frame fades and a
			turning mark stands at the end of the content header. The search control runs an exchange against a mock
			answering after a second, so the whole of it can be watched.</p>

	</>;
}
