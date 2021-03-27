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

import { useCallback } from "preact/hooks";
import { trailing } from "../index";
import { Custom } from "./custom";
import { Search, XCircle } from "./icon";
import "./search.less";

const DelayDefault=500;


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface Props {

	/**
	 * The URL of the target container to be filtered.
	 */
	id?: string

	/**
	 * The property path to be filtered.
	 */
	path: string

	/**
	 * The DelayDefault in ms before changes are auto-submitted after the last edit; 0 to disable.
	 *
	 * @defaultValue [[DelayDefault]]
	 */
	delay?: number

	/**
	 * The input placeholder string.
	 */
	placeholder?: string

	state: [{ [key: string]: any }, (delta: Partial<{ [key: string]: any }>) => void]

}

export function ToolSearch({

	id="",
	path,

	placeholder="",
	delay=DelayDefault,

	state: [state, setState]

}: Props) {

	const filter=`~${path}`;

	const keywords=state[filter];
	const setKeywords=(keywords: string) => setState({ [filter]: keywords.trim() });

	// const input=useRef<HTMLInputElement>();
	// useEffect(() => input.current?.focus());
	// <input ref={input}/>

	return (
		<Custom tag="tool-search">

			<button disabled><Search/></button>

			<input autofocus type="text" placeholder={placeholder} value={keywords} onInput={useCallback(trailing(
				delay, e => setKeywords((e.target as HTMLInputElement).value)
			), [])}/>

			{keywords
				? <button title="Clear" onClick={() => setKeywords("")}><XCircle/></button>
				: <span/>
			}

		</Custom>
	);
}
