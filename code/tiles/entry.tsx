/*
 * Copyright © 2020-2021 Metreeca srl
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

import { ComponentChild, createElement } from "preact";
import { useState } from "preact/hooks";
import { classes } from "../index";
import "./entry.css";

export function ToolEntry({

	rule=false,
	edit=false,

	icon,
	name,
	menu

}: {

	rule?: boolean
	edit?: boolean

	icon?: ComponentChild
	name: ComponentChild | string
	menu?: ComponentChild

}) {

	const [focused, setFocused]=useState(false);

	return createElement("tool-entry", {
		class: classes({

			"rule": rule,
			"edit": edit,

			"focused": focused

		})
	}, <>

		<nav>{icon}</nav>

		<span

			onFocusCapture={e => setFocused((e.target as any)?.tagName === "INPUT")}
			onBlurCapture={e => setFocused(false)}

		>{name}</span>

		<nav>{menu}</nav>

	</>);
}