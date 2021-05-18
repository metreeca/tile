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

import { ComponentChildren, createElement } from "preact";
import { useState } from "preact/hooks";
import { focus, frame, string } from "../graphs";
import { Options, OptionsUpdater } from "../hooks/entry";
import { X } from "./icon";
import "./options.css";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function ToolOptions({

	label,

	options: [options, { set, clear }]

}: {

	label: string | ComponentChildren,

	options: [Options, OptionsUpdater]

}) {

	const [collapsed, setCollapsed]=useState(false);

	return createElement("tool-options", { className: collapsed ? "collapsed" : "expanded" }, <>

		<header>
			<button title="Toggle" onClick={() => setCollapsed(!collapsed)}>{label}</button>
			<button title="Clear" disabled={!options.some(({ selected }) => selected)} onClick={clear}><X/></button>
			{/* !!! spinner */}
		</header>


		{!collapsed && <>

			{options.filter(({ selected }) => selected).map(entry => option(entry, set))}
			{options.filter(({ selected }) => !selected).map(entry => option(entry, set))}

		</>}

	</>);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function option({ selected, value, count }: Options[number], set: (value: {}, selected: boolean) => void) {

	const key=focus(value);
	const name=count ? "available" : "unavailable";

	return <>

		<input type="checkbox" checked={selected} onChange={e => set(value, e.currentTarget.checked)}/>

		{frame(value)
			? <a key={key} className={name} href={value.id}>{string(value)}</a>
			: <span key={key} className={name}>{value}</span>
		}

		<var className={name}>{count}</var>

	</>;
}