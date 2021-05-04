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
import { useCallback } from "preact/hooks";
import { useStats } from "../hooks/entry";
import { trailing } from "../index";
import "./range.css";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface Props {

	id?: string
	path: string

	state: [{ [key: string]: any }, (delta: Partial<{ [key: string]: any }>) => void]

	format?: (value: any) => string

}

export function ToolRange({

	id="",
	path,

	state: [state, putState],

	format=value => value === undefined ? "" : String(value)

}: Props) {

	const stats=useStats(id, path, state); // !!! switch representation according to datatypes (dates, times, …)

	const lower=useCallback(trailing(500, e => {

		const target=e.target as HTMLInputElement;

		if ( target.checkValidity() ) {
			putState({ [`>=${path}`]: target.value, ".offset": 0 });
		}

	}), []);

	const upper=useCallback(trailing(500, e => {

		const target=e.target as HTMLInputElement;

		if ( target.checkValidity() ) {
			putState({ [`<=${path}`]: target.value, ".offset": 0 });
		}

	}), []);

	return createElement("tool-range", {}, stats.data(stats => <>

		<input type="search" pattern="\d+(\.\d+)?" placeholder={format(stats.min)} value={state[`>=${path}`]} onInput={lower}/>
		<input type="search" pattern="\d+(\.\d+)?" placeholder={format(stats.max)} value={state[`<=${path}`]} onInput={upper}/>

	</>));

}