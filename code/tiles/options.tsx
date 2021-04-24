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

import { label, model, Value } from "../graphs";
import { useTerms } from "../hooks/entry";
import { Custom } from "./custom";
import "./options.css";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface Props {

	id?: string
	path: string

	state: [{ [key: string]: any }, (delta: Partial<{ [key: string]: any }>) => void]

}

export function ToolOptions({

	id="",
	path,

	state: [state, putState]

}: Props) {

	const baseline=useTerms(id, path); // computed ignoring all facets

	const matching=useTerms(id, path, Object // computed ignoring this facet
		.getOwnPropertyNames(state)
		.filter(key => key !== path && key !== `?${path}`)
		.reduce((object, key, index, keys) => {

			(object as any)[key]=state[key];

			return object;

		}, {})
	);

	return <Custom tag="tool-options">{baseline.then(baseline => matching.data(matching => {

		const selected=Object
			.getOwnPropertyNames(state)
			.filter(key => key === path || key === `?${path}`)
			.map(key => state[key])
			.flatMap(value => Array.isArray(value) ? value : [value])
			.map(value);

		const available=matching.terms
			.map(term => term.value)
			.map(value);

		return <>

			{matching.terms // selected/available
				.filter(term => selected.includes(value(term.value)))
				.map(term => option(term.value, term.count, true, true, () => {

					putState({ [path]: selected.filter(v => v !== value(term.value)), ".offset": 0 });

				}))
			}


			{baseline.terms // selected/unavailable
				.filter(term => selected.includes(value(term.value)))
				.filter(term => !available.includes(value(term.value)))
				.map(term => option(term.value, 0, true, false, () => {

					putState({ [path]: selected.filter(v => v !== value(term.value)), ".offset": 0 });

				}))
			}


			{matching.terms  // unselected/available
				.filter(term => !selected.includes(value(term.value)))
				.map(term => option(term.value, term.count, false, true, () => {

					putState({ [path]: [...selected, value(term.value)], ".offset": 0 });

				}))
			}


			{baseline.terms  // unselected unavailable options
				.filter(term => !selected.includes(value(term.value)))
				.filter(term => !available.includes(value(term.value)))
				.map(term => option(term.value, 0, false, false, () => {

					putState({ [path]: [...selected, value(term.value)], ".offset": 0 });

				}))
			}


		</>;

	}))}</Custom>;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function option(value: any, count: number, selected: boolean, available: boolean, action: () => void) {

	const key: Value=model(value) ? value.id : value; // !!! handle structured literals

	return <label key={key} className={available ? "avaliable" : "unavailable"}>

		<input type="checkbox" checked={selected} onChange={action}/>

		{model(value) ? <a href={value.id}>{label(value)}</a> : <span>{value}</span>}

		<span>{count}</span>

	</label>;
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function value(value: any): Value {  // !!! handle structured literals
	return model(value) ? value.id : value;
}
