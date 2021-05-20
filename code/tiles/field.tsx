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

import { ComponentChildren } from "preact";
import { useState } from "preact/hooks";
import { normalize } from "..";
import { X, XCircle } from "./icon";
import { ToolPanel } from "./panel";

enum Mode { Collapsed, Selecting, Configuring}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function ToolField({

	searchable=false,

	name,

	selector,
	settings

}: {

	searchable?: boolean

	name: string

	selector: ComponentChildren
	settings?: ComponentChildren

}) {

	const [mode, setMode]=useState(Mode.Collapsed);
	const [filter, setFilter]=useState("");

	const collapsed=mode === Mode.Collapsed;
	const expanded=mode !== Mode.Collapsed;

	const active=searchable && mode === Mode.Selecting;


	function select() {
		setMode(Mode.Selecting);
	}

	function expand() {
		setMode(settings ? Mode.Configuring : Mode.Selecting);
	}

	function collapse() {
		setMode(Mode.Collapsed);
	}


	return <ToolPanel ease edit={active}

		open={[expanded, open => open ? select() : collapse()]}

		name={collapsed ? <button onClick={expand}>{name}</button>
			: active ?
				<input placeholder={name} value={filter} onInput={e => setFilter(normalize(e.currentTarget.value))}/>
				: <button onClick={collapse}>{name}</button>
		}

		menu={filter ? <button><XCircle/></button> : <button>{<X/>}</button>}

	>{mode === Mode.Selecting ? selector : mode === Mode.Configuring ? settings : <div/>}</ToolPanel>;

}