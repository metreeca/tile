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
import { focus, frame, string } from "../../graphs";
import { Options, OptionsUpdater } from "../../nests/connector";
import "./options.css";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function ToolOptions({

	value: [options, setOptions]

}: {

	value: [Options, OptionsUpdater]

}) {

	function sort(x: Options[number], y: Options[number]): number {
		return x.selected && !y.selected ? -1 : !x.selected && y.selected ? +1
			: x.count > y.count ? -1 : x.count < y.count ? +1
				: string(x.value).toUpperCase().localeCompare(string(y.value).toUpperCase());

	}

	return createElement("tool-options", {},
		(options as Options[number][]).sort(sort).map(entry => option(entry, setOptions))
	);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function option({ selected, value, count }: Options[number], set: OptionsUpdater) {

	const key=focus(value);
	const name=count ? "available" : "unavailable";

	return <>

		<input type="checkbox" checked={selected} disabled={!count}
			onChange={e => set({ value, selected: e.currentTarget.checked })}
		/>

		{frame(value)
			? <a key={key} className={name} href={value.id}>{string(value)}</a>
			: <span key={key} className={name}>{string(value)}</span>
		}

		<var className={name}>{count}</var>

	</>;
}