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


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const Terms=freeze({

	id: "", "@id": "",

	terms: [{

		value: {},

		count: 0

	}]

});

export const Stats=freeze({

	id: "", "@id": "",

	count: 0,

	min: {},
	max: {},

	stats: [{

		id: "", "@id": "",

		count: 0,

		min: {},
		max: {}

	}]

});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export type Query=Readonly<Partial<{

	".terms": string
	".stats": string

	[path: string]: Value | Value[]

}>> & Slice

export type Slice=Readonly<Partial<{

	".order": string | string[]
	".offset": number
	".limit": number

}>>

export type Value=boolean | number | string | Readonly<{ [key: string]: string }>


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface Graph {

	entry<V extends Frame, E extends Frame>(id: string, model: V, query?: Query): Readonly<Entry<typeof model, E>>;

}

export interface Probe<V extends Frame, E extends Frame, R> {

	readonly value?: R | ((value: V, model: V) => R | undefined);
	readonly error?: R | ((error: E, model: V) => R | undefined);

	readonly blank?: R | ((abort: () => void, model: V) => R | undefined);
	readonly other?: R | ((abort: () => void, model: V) => R | undefined);

}

export interface Frame { // !!! exclusive id/@id

	readonly id?: string
	readonly "@id"?: string

	readonly label?: string
	readonly image?: string
	readonly comment?: string

	readonly [field: string]: undefined | Value | Frame | ReadonlyArray<Value | Frame>

}


/**
 * Graph entry point.
 */
export abstract class Entry<V extends Frame, E extends Frame> {

	private readonly observers=new Set<(entry: Entry<V, E>) => void>();


	public abstract get(): Readonly<Entry<V, E>>;

	public abstract patch(patch: Partial<V>): Readonly<Entry<V, E>>;


	public abstract probe<R>(probe: Probe<V, E, R>): R | undefined;


	public then<R>(value: (value: V) => R): R | undefined {
		return this.get().probe({ value: value });
	}

	public data<R>(value: (value: V) => R): R {
		return <R>this.get().probe({ value: value, other: (abort, model) => value(model) });
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

export function frame(object: any): object is Frame {
	return object && object.hasOwnProperty("id");
}


/**
 * Guesses a resource label from its id.
 *
 * @param id the resource id
 *
 * @returns a label guessed from `id` or an empty string, if unable to guess
 */
export function label(id: string): string;

/**
 * Retrieves a resource label.
 *
 * @param frame the resource whose label is to be retrieved
 *
 * @returns the resource label, if present and not falsy; a label {@link label guessed} from the resource id, otherwise
 */
export function label(frame: Frame): string;

export function label(resource: string | Frame): string {
	return frame(resource) ? resource.label || label(resource.id || resource["@id"] || "") : resource
		.replace(/^.*?(?:[/#:]([^/#:]+))?(?:\/|#|#_|#id|#this)?$/, "$1") // extract label
		.replace(/([a-z-0-9])([A-Z])/g, "$1 $2") // split camel-case words
		.replace(/[-_]+/g, " ") // split kebab-case words
		.replace(/\b[a-z]/g, $0 => $0.toUpperCase()); // capitalize words
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

export function clean<T>(model: any): any { // !!! generic type
	if ( Array.isArray(model) ) {

		return [];

	} else if ( typeof model === "object" ) {

		return Object.getOwnPropertyNames(model).reduce((object: any, key) => {

			object[key]=clean(model[key]);

			return object;

		}, {});

	} else {

		return model;

	}
}
