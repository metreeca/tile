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
import { X } from "preact-feather";
import { useState } from "preact/hooks";
import { label, model, Value } from "../graphs";
import { useTerms } from "../hooks/entry";
import "./options.css";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface Props {

	label: string | ComponentChildren,

	id?: string
	path: string

	state: [{ [key: string]: any }, (delta: Partial<{ [key: string]: any }>) => void]

}

export function ToolOptions({

	label,

	id="",
	path,

	state: [query, putQuery]

}: Props) {

	const [collapsed, setCollapsed]=useState(false);

	const baseline=useTerms(id, path); // computed ignoring all facets

	const matching=useTerms(id, path, Object // computed ignoring this facet
		.getOwnPropertyNames(query)
		.filter(key => key !== path && key !== `?${path}`)
		.reduce((object, key, index, keys) => {

			(object as any)[key]=query[key];

			return object;

		}, {})
	);

	return h("tool-options", { className: collapsed ? "collapsed" : "expanded" }, <>

		<header>
			<button title="Toggle" onClick={() => setCollapsed(!collapsed)}>{label}</button>
			<button title="Clear" disabled={!query[path]?.length} onClick={() => putQuery({ [path]: [] })}><X/></button>
		</header>

		{!collapsed && baseline.then(baseline => matching.data(matching => {

			const selected=Object
				.getOwnPropertyNames(query)
				.filter(key => key === path || key === `?${path}`)
				.map(key => query[key])
				.flatMap(value => Array.isArray(value) ? value : [value])
				.map(value);

			const available=matching.terms
				.map(term => term.value)
				.map(value);

			return <>

				{matching.terms // selected/available
					.filter(term => selected.includes(value(term.value)))
					.map(term => option(term.value, term.count, true, true, () => {

						putQuery({ [path]: selected.filter(v => v !== value(term.value)), ".offset": 0 });

					}))
				}


				{baseline.terms // selected/unavailable
					.filter(term => selected.includes(value(term.value)))
					.filter(term => !available.includes(value(term.value)))
					.map(term => option(term.value, 0, true, false, () => {

						putQuery({ [path]: selected.filter(v => v !== value(term.value)), ".offset": 0 });

					}))
				}


				{matching.terms  // unselected/available
					.filter(term => !selected.includes(value(term.value)))
					.map(term => option(term.value, term.count, false, true, () => {

						putQuery({ [path]: [...selected, value(term.value)], ".offset": 0 });

					}))
				}


				{baseline.terms  // unselected unavailable options
					.filter(term => !selected.includes(value(term.value)))
					.filter(term => !available.includes(value(term.value)))
					.map(term => option(term.value, 0, false, false, () => {

						putQuery({ [path]: [...selected, value(term.value)], ".offset": 0 });

					}))
				}


			</>;

		}))}

	</>);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function option(value: any, count: number, selected: boolean, available: boolean, action: () => void) {

	const key: Value=model(value) ? value.id : value; // !!! handle structured literals
	const name=available ? "available" : "unavailable";

	return <>

		<input type="checkbox" checked={selected} onChange={action}/>

		{model(value)
			? <a key={key} className={name} href={value.id}>{label(value)}</a>
			: <span key={key} className={name}>{value}</span>
		}

		<var className={name}>{count}</var>

	</>;
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function value(value: any): Value {  // !!! handle structured literals
	return model(value) ? value.id : value;
}
