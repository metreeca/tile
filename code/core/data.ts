/*
 * Copyright © 2020-2025 Metreeca srl
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

/**
 * Localized strings.
 *
 * https://www.rfc-editor.org/rfc/rfc5646.html#section-2.2.9
 *
 * @module
 */

import { error, immutable, inconvertible, isObject, Type } from "@metreeca/core/index";
import { isString } from "@metreeca/core/string";


export interface Data {

	readonly "@value": string,
	readonly "@type": string

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const data: Type<Data> & ((model: Data) => Type<Data>)=Object.freeze(Object.assign(
	(model: Data) => immutable({ ...data, model }), immutable<Type<Data>>({

		label: "data",
		model: { "@value": "", "@type": "app:/" },


		encode(value) {
			return value;
		},

		decode(value) {
			return isData(value) ? value
				: error(new TypeError(`<${typeof value}> value <${value}> is not a <${data.label}>`));
		},


		write(value) {
			return toDataString(value);
		},

		parse(value) { // !!! resolve datatype URIs

			const match=value.match(/(?<value>.*?)\^\^(?<type>\S+)/);

			return match && match.groups
				? { "@value": match.groups.value, "@type": match.groups.type }
				: error(new TypeError(`malformed <${data.label}> value <${value}>`));
		},


		format(value) {
			return toDataString(value);
		},


		cast(type: Type): typeof data {
			return inconvertible(data, type);
		}

	})
));


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function isData(value: unknown): value is Data {
	return isObject(value) && !("id" in value) && Object.entries(value).every(([key, value]) =>
		isString(key) && /^([a-zA-Z][a-zA-Z0-9+.-]*:)?\/?[^ ]*$/.test(key) // keys are possibly relative URIs
		&& isString(value) // !!! string arrays?
	);
}

export function asData(value: unknown): undefined | Data {
	return isData(value) ? value : undefined;
}


export function toDataString(data: Data, {

	base

}: {

	base?: URL

}={}): string {

	return JSON.stringify(data); // !!! relativize datatype URIs

}