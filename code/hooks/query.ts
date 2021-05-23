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

import { StateUpdater, useEffect, useState } from "preact/hooks";
import { Query } from "../graphs";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function useQuery(initial: Query): [Query, StateUpdater<Query>] {

	const [state, setState]=useState({ ...initial, ...query() });

	useEffect(() => { query(state, initial); });

	return [state, setState];
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function query(query?: Query, defaults?: Query): Query {
	if ( query === undefined ) {

		const query: Query={};

		new URLSearchParams(location.search.substring(1)).forEach((value, key) => {

			const current=(query as any)[key];

			(query as any)[key]=current === undefined ? value
				: Array.isArray(current) ? [...current, value]
					: [current, value];

		});

		return query;

	} else {

		const params=new URLSearchParams();

		Object.entries(query)
			.flatMap(([key, value]) => (Array.isArray(value) ? value : [value]))
			.filter(([key, value]) => !(defaults && value === defaults[key]))
			.filter(([key, value]) => !(key.startsWith(".") && !value))
			.forEach(([key, value]) => params.append(key, String(value)));

		const search=params.toString();

		history.replaceState(history.state, document.title,
			search ? `${location.pathname}?${search}${location.hash}` : `${location.pathname}${location.hash}`
		);

		return query;

	}
}
