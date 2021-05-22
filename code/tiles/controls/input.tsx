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

import { ComponentChild } from "preact";
import { useRef } from "preact/hooks";
import { useValue } from "../../hooks/value";
import { normalize } from "../../index";
import { ToolEntry } from "../combos/entry";
import { Search, XCircle } from "../icon";


const search=<Search style={{ color: "#999", transform: "translateY(5%)" }}/>;


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function ToolInput({

	icon,

	placeholder,

	menu,

	delay=0,

	value: [value, setValue]

}: {

	icon?: boolean | ComponentChild

	/**
	 * The input placeholder string.
	 */
	placeholder?: string

	menu?: ComponentChild

	/**
	 * The delay in ms before changes are auto-submitted after the last edit; 0 to disable.
	 */
	delay?: number

	value: [string, (value: string) => void]

}) {

	const [state, setState]=useValue(normalize(value));

	const input=useRef<HTMLInputElement>();

	// !!! delay? useCallback(trailing(delay, e => setValue(normalize(e.currentTarget.value))), []) : () => {};


	function focus() {
		input.current.focus();
	}

	function clear() {

		setState("");
		setValue("");

		input.current.focus();

	}

	return <ToolEntry edit

		icon={icon === true
			? <button title={"Search"} onClick={() => focus()}>{search}</button>
			: icon
		}

		name={<input ref={input} type="text" placeholder={placeholder} value={state}

			onFocus={e => e.currentTarget.select()}
			onInput={e => setState(e.currentTarget.value)}
			onChange={e => setValue(normalize(e.currentTarget.value))}

		/>}

		menu={state ? <button title="Clear" onClick={clear}><XCircle/></button> : menu}

	/>;

}