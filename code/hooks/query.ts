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

import { useEffect } from "preact/hooks";
import { useDelta } from "./delta";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface Query {

	readonly [parameter: string]: boolean | number | string | ReadonlyArray<boolean | number | string>

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function useQuery<Q extends Query>(initial: Q): [typeof initial, (delta: Partial<typeof initial>) => void] {

	const [state, putState]=useDelta({ ...initial, ...query() });

	useEffect(() => { query(state, initial); });

	return [state, putState];
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function query(query?: Query, defaults?: Query): Query {
	if ( query ) {

		const params=new URLSearchParams();

		Object.entries(query)

			.filter(([key, value]) => // not a default value
				!(defaults && value === defaults[key])
			)

			.filter(([, value]) => // not a blank value
				!(value === undefined || value === null || value === "" || Array.isArray(value) && value.length === 0)
			)

			.forEach(([key, value]) =>
				(Array.isArray(value) ? value : [value]).forEach(value => { params.append(key, String(value)); })
			);

		const search=params.toString();

		history.replaceState(history.state, document.title,
			search ? `${location.pathname}?${search}` : location.pathname
		);

		return query;

	} else {

		const query: Query={};

		new URLSearchParams(location.search.substring(1)).forEach((value, key) => {

			const current=(query as any)[key];

			(query as any)[key]=current === undefined ? value
				: Array.isArray(current) ? [...current, value]
					: [current, value];

		});

		return query;

	}
}
