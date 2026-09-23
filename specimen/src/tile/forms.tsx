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
 * Form samples.
 *
 * @module
 */

import "./index.css";


/**
 * Creates the forms section.
 *
 * Shows the states a native control is given before a component adds anything of its own: what the keyboard has
 * reached, what a field standing empty shows, what a rejected value looks like, and what takes no input at all.
 *
 * @returns The forms section
 */
export function Forms() {
	return <>

		<p>Fields and buttons carry the focus, invalid and disabled roles, so the state of a control is legible before
			a component adds anything of its own.</p>

		<p>
			<input type="text" value="an editable value"/>{" "}
			<input type="text" placeholder="a placeholder" readOnly/>{" "}
			<input type="email" value="not an address"/>
		</p>

		<p>
			<label><input type="checkbox" checked/> checkbox</label>{" "}
			<label><input type="radio" name="sample" checked/> radio</label>{" "}
			<label><input type="radio" name="sample"/> another</label>
		</p>

		<p>
			<button type="button">Enabled</button>{" "}
			<button type="button" disabled>Disabled</button>
		</p>

	</>;
}
