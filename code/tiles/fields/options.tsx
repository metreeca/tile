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

import { createElement } from "preact";
import { focus, frame, string, Value } from "../../graphs";
import { Options, OptionsUpdater } from "../../nests/connector";
import "./options.css";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function ToolOptions({

	value: [options, { set }]

}: {

	value: [Options, OptionsUpdater]

}) {

	return createElement("tool-options", {}, <>

		{options.filter(({ selected }) => selected).map(entry => option(entry, set))}
		{options.filter(({ selected }) => !selected).map(entry => option(entry, set))}

	</>);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function option({ selected, value, count }: Options[number], set: (value: Value, selected: boolean) => void) {

	const key=focus(value);
	const name=count ? "available" : "unavailable";

	return <>

		<input type="checkbox" checked={selected} onChange={e => set(value, e.currentTarget.checked)}/>

		{frame(value)
			? <a key={key} className={name} href={value.id}>{string(value)}</a>
			: <span key={key} className={name}>{string(value)}</span>
		}

		<var className={name}>{count}</var>

	</>;
}