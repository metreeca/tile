/*
 * Copyright © 2020-2025 Metreeca srl
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

import { type ComponentChildren, createElement } from "preact";
import "./tabs.css";


/**
 * Creates a tabbed layout panel.
 *
 * Presents each section under its own label, in the order the sections are given.
 */
export function TileTabs({

	sections

}: {

	sections: { [label: string]: ComponentChildren }

}) {

	return createElement("tile-tabs", {}, Object.entries(sections).map(([label, content]) =>
		<section key={label}>

			<label>{label}</label>
			<div>{content}</div>

		</section>
	));

}
