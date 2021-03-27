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

import { useContext, useEffect, useReducer } from "preact/hooks";
import { Entry, Model, Query, Slice, Stats, Terms } from "../graphs/index";
import { Graph } from "../index";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function useTerms<E extends Model=any>(
	id: string, path: string, query?: Query, slice?: Slice
): Readonly<Entry<typeof Terms, E>> {

	return useEntry<typeof Terms, E>(id, Terms, {
		...query, ".terms": path, ".order": undefined, ".offset": undefined, ".limit": undefined, ...slice
	});

}

export function useStats<E extends Model=any>(
	id: string, path: string, query?: Query, slice?: Slice
): Readonly<Entry<typeof Stats, E>> {

	return useEntry<typeof Stats, E>(id, Stats, {
		...query, ".stats": path, ".order": undefined, ".offset": undefined, ".limit": undefined, ...slice
	});

}

export function useEntry<V extends Model, E extends Model=any>(
	id: string, model: V, query?: Query
): Readonly<Entry<typeof model, E>> {

	const entry=useContext(Graph).entry<V, E>(id || location.pathname, model, query);

	const [, update]=useReducer(v => v+1, 0);

	useEffect(() => entry.observe(update), [entry]);

	return entry;

}