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

import { error, immutable, inconvertible, isArray, isObject, Type } from "@metreeca/core/index";
import { isString } from "@metreeca/core/string";


export interface Text {

	readonly [lang: string]: string; // !!! string arrays?

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const text: Type<Text> & ((model: Text) => Type<Text>)=Object.freeze(Object.assign(
	(model: Text) => immutable({ ...text, model }), immutable<Type<Text>>({

		label: "text",
		model: { "*": "" },


		encode(value) {
			return value;
		},

		decode(value) {
			return isText(value) ? value
				: error(new TypeError(`<${typeof value}> value <${value}> is not a <${text.label}>`));
		},


		write(value) {
			return toTextString(value);
		},

		parse(value) {
			return { [navigator.languages[0] ?? ""]: value }; // !!! review
		},


		format(value, locales) {
			return toTextString(value, { locales });
		},


		cast(type: Type): typeof text {
			return inconvertible(text, type);
		}

	})
));


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function isText(value: unknown): value is Text {
	return isObject(value) && !("id" in value) && Object.entries(value).every(([key, value]) =>
		isString(key) && /^|\*|[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/.test(key)
		&& isString(value) // !!! string arrays?
	);
}

export function asText(value: unknown): undefined | Text {
	return isText(value) ? value : undefined;
}


export function toTextString(text: Text, {

	locales

}: {

	locales?: Intl.LocalesArgument

}={

	locales: navigator.languages

}): string {

	return (isArray<any>(locales) ? locales.map(locale => {

			function matches(locale: string, range: string): boolean {

				const r=range.toLowerCase();
				const l=locale.toLowerCase();

				return l === r || l.startsWith(r + "-");
			}

			return (Object.entries(text)
				.filter(([, v]) => v)
				.filter(([l]) => matches(locale.toString(), l))
				.map(([, v]) => v))
				[0];

		})[0] : undefined)
		?? text.en
		?? Object.values(text)[0]
		?? "";

}