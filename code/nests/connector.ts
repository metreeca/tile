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
import { Entry, focus, Frame, Graph, Plain, Query, Slice, Stats, string, Terms, Value } from "../graphs";
import { LinkGraph } from "../graphs/link";
import { normalize } from "../index";

const ConnectorContext=createContext<Graph>(LinkGraph());


function single(value: undefined | Value | ReadonlyArray<Value>): undefined | Plain {
	return value === undefined || value instanceof Array ? undefined : focus(value);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function useConnector(): Graph {
	return useContext(ConnectorContext);
}

export function Connector(props: {

	value: Graph

	children: ComponentChildren

}) {

	return createElement(ConnectorContext.Provider, props);

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

export type Keywords=string;

export type KeywordsUpdater=(keywords: string) => void;


export function useKeywords(path: string, [query, setQuery]: [Query, StateUpdater<Query>]): [Keywords, KeywordsUpdater] {

	const like=`~${path}`;

	const keywords=string(single(query[like]) || "");

	return [normalize(keywords), (keywords: string) =>
		setQuery({ ...query, [like]: normalize(keywords) })
	];

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export type Options=ReadonlyArray<{

	readonly selected: boolean
	readonly value: Value
	readonly count: number

}>

export type OptionsUpdater=(option?: { value: Value, selected: boolean }) => void


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


	const options=matching.data(({ terms: matching }) => baseline.data(({ terms: baseline }) => [

		...matching, ...baseline
			.filter(term => !matching.some(match => focus(term.value) === focus(match.value)))
			.map(term => ({ ...term, count: 0 }))

	])).map(term => ({ ...term, selected: selection.has(focus(term.value)) }));

	return [options, option => {

		if ( option === undefined ) { // clear

			setQuery({ ...query, [path]: undefined, [any]: undefined, ".offset": 0 });

		} else { // set

			const update: Set<Plain>=new Set(selection);

			if ( option.selected ) {
				update.add(focus(option.value));
			} else {
				update.delete(focus(option.value));
			}

			setQuery({ ...query, [path]: [...update], [any]: undefined, ".offset": 0 });

		}

	}];

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export type Range={

	readonly type?: string

	readonly min?: Value
	readonly max?: Value

	readonly lower?: Value
	readonly upper?: Value

}

export type RangeUpdater=(range?: { lower?: Value, upper?: Value }) => void


export function useRange(id: string, path: string, [query, setQuery]: [Query, StateUpdater<Query>]): [Range, RangeUpdater] {

	const gte=`>=${path}`;
	const lte=`<=${path}`;

	const lower=single(query[gte]);
	const upper=single(query[lte]);

	const stats=useStats(id, path, query);

	const range=stats.data(({ stats: [stat] }) => ({

		type: stat?.id,

		min: stat?.min,
		max: stat?.max,

		lower,
		upper

	}));

	return [range, range => {

		if ( range === undefined ) { // clear

			setQuery({ ...query, [lte]: undefined, [gte]: undefined, ".offset": 0 });

		} else { // set

			console.log(query);

			const xxx={ ...query, [lte]: single(range.lower), [gte]: single(range.upper), ".offset": 0 };
			console.log(xxx);
			setQuery(xxx);

		}

	}];

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export type Order=undefined | boolean

export type OrderUpdater=(order?: Order) => void


export function useOrder(path: string, [query, setQuery]: [Query, StateUpdater<Query>]): [Order, OrderUpdater] {

	const ascending=`+${path}`;
	const descending=`-${path}`;

	const criterion=(query[".order"]);
	const criteria=Array.isArray(criterion) ? criterion : [criterion];

	const order=criteria.some(criterion => criterion === path || criterion === ascending) ? true
		: criteria.some(criterion => criterion === descending) ? false
			: undefined;

	return [order, order => {
		if ( order === undefined ) { // clear

			setQuery({ ...query, ".order": undefined, ".offset": 0 });

		} else { // set

			setQuery({
				...query, ".order": order ? ascending : descending, ".offset": 0
			});

		}
	}];

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface Page {

	offset: number
	limit: number

	count: number

	prev?: number
	next?: number

}

export interface PageUpdater {

	(offset?: number): void

}


export function usePage([query, setQuery]: [Query, StateUpdater<Query>]): [Page, PageUpdater] {

	const count=useStats("", "", query).data(stats => stats.count);

	const offset=Math.max(0, query[".offset"] || 0);
	const limit=Math.max(1, query[".limit"] || 0);

	const prev=offset-limit;
	const next=offset+limit;

	const slice={

		offset,
		limit,

		count,

		prev: prev >= 0 ? prev : undefined,
		next: next <= count ? next : undefined

	};

	return [slice, (offset=0) =>
		setQuery({ ...query, ".offset": Math.max(0, Math.min(offset-offset%limit, count)) })
	];

}

