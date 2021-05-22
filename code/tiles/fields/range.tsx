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
import { trailing } from "../..";
import { Value } from "../../graphs";
import { Range, RangeUpdater } from "../../nests/connector";
import "./range.css";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function ToolRange({

	pattern="\\d+(\\.\\d+)?",
	format=String,

	value: [{ type, min, max, lower, upper }, { set }] // !!! switch representation according to type (dates, times, …)

}: {

	pattern?: string
	format?: (value: Value) => string

	value: [Range, RangeUpdater]

}) {

	function string(value?: Value) { return value ? format(value) : ""; }

	return createElement("tool-range", {}, <>

		<input type="search" pattern={pattern} placeholder={string(min)} value={string(lower)} onInput={trailing(500, e => {
			if ( e.currentTarget.checkValidity() ) { set(lower, e.currentTarget.value); }
		})}/>

		<input type="search" pattern={pattern} placeholder={string(max)} value={string(upper)} onInput={trailing(500, e => {
			if ( e.currentTarget.checkValidity() ) { set(e.currentTarget.value, upper); }
		})}/>

	</>);

}