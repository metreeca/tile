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

import { ComponentChild, ComponentChildren, createElement } from "preact";
import { classes } from "..";
import { useValue } from "../hooks/value";
import { ToolEntry } from "./entry";
import { ChevronDown, ChevronRight } from "./icon";
import "./panel.css";

export function ToolPanel({

	nest=false,
	ease=false,
	rule=false,

	open=false,

	name,

	menu,

	children

}: {

	nest?: boolean
	ease?: boolean
	rule?: boolean

	open?: boolean | [boolean, (expanded: boolean) => void]

	name: ComponentChild | string

	menu?: ComponentChild,

	children?: ComponentChildren

}) {

	const [expanded, setExpanded]=(typeof open === "boolean") ? useValue(open) : open;

	function toggle() {
		setExpanded(!expanded);
	}

	return createElement("tool-panel", { class: classes({ "tree": nest, "ease": ease }) }, <>

		<ToolEntry line={rule}

			name={typeof name === "string" ? <button onClick={toggle}>{name}</button> : name}

			icon={<button disabled={!children} onClick={toggle}>{

				children && expanded ? <ChevronDown/> : <ChevronRight/>

			}</button>}

			menu={menu}

		/>

		{expanded && children}

	</>);

}