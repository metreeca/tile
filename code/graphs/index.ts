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


export const Terms: { id: string, terms: ReadonlyArray<Term> }=freeze({

	id: "",

	terms: [<Term>{

		value: {},

		count: 0

	}]

});

export const Stats: { id: string, stats: ReadonlyArray<Stat> }=freeze({

	id: "",

	count: 0,

	min: {},
	max: {},

	stats: [{

		id: "",

		count: 0,

		min: {},
		max: {}

	}]

});


export function local(value: undefined | Value): value is Local {
	return typeof value === "object" && Object.keys(value).every(key => key.match(/[a-z]+(-[a-z]+)*/i));
}

export function frame(value: undefined | Value): value is Frame {
	return typeof value === "object" && value?.hasOwnProperty("id") === true;
}

export function blank(value: undefined | Value): value is Blank {
	return typeof value === "object" && !local(value) && !frame(value);
}


export function focus(value: Value): Value {
	return (blank(value) || frame(value)) && value.id || value;
}

export function value(value: undefined | Value | ReadonlyArray<Value>): undefined | Value {
	return value instanceof Array ? undefined : value;
}

export function string(value: undefined | Value | ReadonlyArray<Value>): string {
	return value === undefined ? ""
		: value instanceof Array ? "[]" // !!! review
			: blank(value) || frame(value) ? value.label || label(value.id || "{}") // !!! review
				: local(value) ? value["en"] || "" // !!! preferred language
					: typeof value === "number" ? value.toLocaleString()
						: value.toString();
}

/**
 * Guesses a resource label from its id.
 *
 * @param id the resource id
 *
 * @returns a label guessed from `id` or an empty string, if unable to guess
 */
export function label(id: string) {
	return id
		.replace(/^.*?(?:[/#:]([^/#:]+))?(?:\/|#|#_|#id|#this)?$/, "$1") // extract label
		.replace(/([a-z-0-9])([A-Z])/g, "$1 $2") // split camel-case words
		.replace(/[-_]+/g, " ") // split kebab-case words
		.replace(/\b[a-z]/g, $0 => $0.toUpperCase()); // capitalize words
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export type Query=Readonly<Partial<{

	".terms": string
	".stats": string

	[path: string]: Value | ReadonlyArray<Value>

}>> & Slice

export type Slice=Readonly<Partial<{

	".order": string | ReadonlyArray<string>
	".offset": number
	".limit": number

}>>


export type Value=boolean | number | string | Local | Blank | Frame


export interface Local {

	readonly [field: string]: string

}

export interface Blank {

	readonly id?: string

	readonly label?: string
	readonly image?: string
	readonly comment?: string

	readonly [field: string]: undefined | Value | ReadonlyArray<Value>

}

export interface Frame extends Blank {

	readonly id: string

}


export interface Term extends Frame {

	value: Value

	count: number

}

export interface Stat extends Frame {

	id: string

	count: number

	min: Value
	max: Value

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface Graph {

	entry<V extends Frame, E extends Frame>(id: string, model: V, query?: Query): Entry<typeof model, E>;

}

export interface Probe<V extends Frame, E extends Frame, R> {

	readonly value?: R | ((value: V, model: V) => R | undefined);
	readonly error?: R | ((error: E, model: V) => R | undefined);

	readonly blank?: R | ((abort: () => void, model: V) => R | undefined);
	readonly other?: R | ((abort: () => void, model: V) => R | undefined);

}


/**
 * Graph entry point.
 */
export abstract class Entry<V extends Frame, E extends Frame> {

	private readonly observers=new Set<(entry: Entry<V, E>) => void>();


	public abstract get(): Readonly<Entry<V, E>>;

	public abstract patch(patch: Partial<V>): Readonly<Entry<V, E>>;


	public abstract probe<R>(probe: Probe<V, E, R>): R | undefined;


	public wait<R>(blank: R | ((abort: () => void, model: V) => R | undefined)): R | undefined {
		return this.get().probe({ blank });
	}

	public then<R>(value: (value: V) => R): R | undefined {
		return this.get().probe({ value });
	}

	public data<R>(value: (value: V) => R): R {
		return <R>this.get().probe({ value, other: (abort, model) => value(model) });
	}


	public observe(observer: (entry: Readonly<Entry<V, E>>) => void): () => void {

		this.observers.add(observer);

		return () => this.observers.delete(observer);

	}

	protected notify(): void {
		this.observers.forEach(observer => observer(this));
	}

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function freeze<T>(value: T): Readonly<T> { // !!! deep readonly
	if ( typeof value === "object" ) {

		return Object.freeze(Object.getOwnPropertyNames(value as any).reduce((object: any, key) => {

			(object as any)[key]=freeze((value as any)[key]);

			return object;

		}, Array.isArray(value) ? [] : {}));

	} else {

		return value;

	}
}

export function prune<T>(model: any): any { // !!! generic type
	if ( Array.isArray(model) ) {

		return [];

	} else if ( typeof model === "object" ) {

		return Object.getOwnPropertyNames(model).reduce((object: any, key) => {

			object[key]=prune(model[key]);

			return object;

		}, {});

	} else {

		return model;

	}
}

export function clean(query: Query): Query {

	const clean: any={};

	function scan(value: undefined | Value | ReadonlyArray<Value>): undefined | Value | ReadonlyArray<Value> {
		return Array.isArray(value) ? value.length && value.map(scan).filter(v => v !== undefined) as ReadonlyArray<Value>
			: value ? value : undefined;
	}

	Object.getOwnPropertyNames(query).forEach(key => {

		const value=scan(query[key]);

		if ( key.startsWith(".") ? value : value !== undefined ) {
			clean[key]=value;
		}

	});

	return clean;
}
