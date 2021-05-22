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


import { ComponentChildren, createContext, createElement } from "preact";
import { StateUpdater, useContext, useEffect, useReducer } from "preact/hooks";
import { Entry, focus, Frame, Graph, Query, Slice, Stats, string, Terms, value, Value } from "../graphs";
import { LinkGraph } from "../graphs/link";
import { normalize } from "../index";

const context=createContext(LinkGraph());


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function useConnector() {
	return useContext(context);
}

export function Connector(props: {

	value: Graph

	children: ComponentChildren

}) {

	return createElement(context.Provider, props);

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function useEntry<V extends Frame, E extends Frame>(id: string, model: V, query?: Query): Entry<typeof model, E> {

	const entry=useConnector().entry<V, E>(id || location.pathname, model, query);

	const [, update]=useReducer(v => v+1, 0);

	useEffect(() => entry.observe(update), [entry]);

	return entry;

}

export function useTerms<E extends Frame>(id: string, path: string, query?: Query, slice?: Slice): Entry<typeof Terms, E> {

	return useEntry<typeof Terms, E>(id, Terms, {
		...query, ".terms": path, ".order": undefined, ".offset": undefined, ".limit": undefined, ...slice
	});

}

export function useStats<E extends Frame>(id: string, path: string, query?: Query, slice?: Slice): Entry<typeof Stats, E> {

	return useEntry<typeof Stats, E>(id, Stats, {
		...query, ".stats": path, ".order": undefined, ".offset": undefined, ".limit": undefined, ...slice
	});

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function useKeywords(path: string, [query, setQuery]: [Query, StateUpdater<Query>]): [string, (keywords: string) => void] {

	const like=`~${path}`;

	const keywords=string(query[like]);

	return [normalize(keywords), (keywords: string) =>
		setQuery({ ...query, [like]: normalize(keywords) })
	];

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface Range {

	readonly type?: string

	readonly min?: Value
	readonly max?: Value

	readonly lower?: Value
	readonly upper?: Value

}

export interface RangeUpdater {

	set(lower: undefined | Value, upper: undefined | Value): void

	clear(): void

}


export function useRange(id: string, path: string, [query, setQuery]: [Query, StateUpdater<Query>]): [Range, RangeUpdater] {

	const gte=`>=${path}`;
	const lte=`<=${path}`;

	const lower=value(query[gte]);
	const upper=value(query[lte]);

	const stats=useStats(id, path, query);

	const range=stats.data(({ stats: [stat] }) => ({
		type: stat?.id, min: stat?.min, max: stat?.max, lower, upper
	}));

	return [range, {

		set(lower, upper) {
			setQuery({ ...query, [lte]: lower, [gte]: upper, ".offset": 0 });
		},

		clear() {
			setQuery({ ...query, [lte]: undefined, [gte]: undefined, ".offset": 0 });
		}

	}];

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface Options extends ReadonlyArray<{

	selected: boolean
	value: Value
	count: number

}> {}

export interface OptionsUpdater {

	set(value: Value, selected: boolean): void

	clear(): void

}


export function useOptions(id: string, path: string, [query, setQuery]: [Query, StateUpdater<Query>]): [Options, OptionsUpdater] {

	const any=`?${path}`;

	const selection=new Set(Object
		.getOwnPropertyNames(query)
		.filter(key => key === path || key === any)
		.map(key => query[key])
		.flatMap(value => Array.isArray(value) ? value : [value])
		.map(focus)
	);


	const baseline=useTerms(id, path); // computed ignoring all facets

	const matching=useTerms(id, path, Object // computed ignoring this facet
		.getOwnPropertyNames(query)
		.filter(key => key !== path && key !== any)
		.reduce((object, key, index, keys) => {

			(object as any)[key]=query[key];

			return object;

		}, {})
	);


	const options=baseline.data(({ terms: baseline }) => matching.data(({ terms: matching }) => [

		...(matching
			.map(term => ({ ...term, selected: selection.has(focus(term.value)) }))),

		...(baseline
			.filter(term => !matching.some(match => focus(term.value) === focus(match.value)))
			.map(term => ({ ...term, selected: selection.has(focus(term.value)) })))

	]));

	return [options, {

		set(value, selected) {

			const update: Set<Value>=new Set(selection);

			if ( selected ) {
				update.add(focus(value));
			} else {
				update.delete(focus(value));
			}

			setQuery({ ...query, [path]: [...update], [any]: undefined, ".offset": 0 });

		},

		clear() {
			setQuery({ ...query, [path]: undefined, [any]: undefined, ".offset": 0 });
		}

	}];

}

