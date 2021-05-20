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

import { clean, Entry, Frame, freeze, Graph, Probe, prune, Query } from ".";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function LinkGraph(): Graph {

	const cache: { [url: string]: Readonly<Entry<any, any>> }={}; // !!! TTL / size limits / …

	return {

		entry<V extends Frame, E extends Frame>(id: string, model: V, query?: Query): Entry<typeof model, E> {

			const key=url(id, query || {});

			return (cache[key] || (cache[key]=entry(key, <Frame>freeze(prune(model))))) as Entry<typeof model, E>;

		}

	};

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function url(id: string, query: Query) {

	const search=clean(query);

	return Object.getOwnPropertyNames(search).length ? `${id}?${encodeURIComponent(JSON.stringify(search))}` : id;
}

function entry<V extends Frame, E extends Frame>(url: string, model: V): Readonly<Entry<V, E>> {

	let value: V | undefined;
	let error: E | undefined;

	let abort: (() => void) | undefined;

	return Object.freeze(new class extends Entry<V, E> {

		get(): Entry<V, E> {

			if ( value || error || abort ) { return this; } else {

				const controller=new AbortController();

				abort=controller.abort;

				fetch(url, { signal: controller.signal })

					.then(response => response.json())

					.then(json => {

						value=freeze({ ...model, ...json }); // fill missing properties from model

						this.notify();

					})

					.catch(reason => {

						error=freeze(reason); // !!! handle network/abort responses

						this.notify();

					})

					.finally(() => {

						abort=undefined;

					});

				return this;

			}

		}

		patch(patch: Partial<V>): Entry<V, E> {

			this.notify();

			throw ";( to be implemented"; // !!!

		}


		probe<R>(probe: Probe<V, E, R>): R | undefined {
			if ( value ) {

				return probe.value instanceof Function ? probe.value(value, model) : "value" in probe ? probe.value
					: probe.other instanceof Function ? probe.other(() => {}, model) : probe.other;


			} else if ( error ) {

				return probe.error instanceof Function ? probe.error(error, model) : "error" in probe ? probe.error
					: probe.other instanceof Function ? probe.other(() => {}, model) : probe.other;

			} else if ( abort ) {

				return probe.blank instanceof Function ? probe.blank(abort, model) : "blank" in probe ? probe.blank
					: probe.other instanceof Function ? probe.other(abort, model) : probe.other;

			} else {

				return undefined;

			}
		}

	});
}

