/*
 * Copyright © 2023-2026 Metreeca srl
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

import { error, immutable, inconvertible, Type } from "../Core/src/index.js";
import { Frame, isFrame, toFrameString } from "@metreeca/core/frame";
import { isString } from "@metreeca/core/string";
import { Text } from "@metreeca/core/text";


/**
 * Graph entry point.
 */
export interface Entry extends Frame {

	readonly id: string;

	readonly label?: string | Text;
	readonly comment?: string | Text;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const entry: Type<Entry> & ((model: Entry) => Type<Entry>)=Object.freeze(Object.assign(
	(model: Entry) => immutable({ ...entry, model }), immutable<Type<Entry>>({

		label: "entry",
		model: { id: "", label: "" },


		encode(value) {
			return value;
		},

		decode(value) {
			return isEntry(value) ? value
				: error(new TypeError(`<${typeof value}> value <${JSON.stringify(value)}> is not a <${entry.label}>`));
		},


		write(value) {
			return value.id;
		},

		parse(value) {
			return { id: value };
		},


		format(value, locales) {
			return toEntryString(value, { locales });
		},


		cast(type: Type): typeof entry {
			return inconvertible(entry, type);
		}

	})
));


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function isEntry(value: unknown): value is Entry {
	return isFrame(value) && isString(value.id);
}

export function asEntry(value: unknown): undefined | Entry {
	return isEntry(value) ? value : undefined;
}


export function toEntryString(value: Entry, {

	locales

}: {

	locales?: Intl.LocalesArgument

}={

	locales: navigator.languages

}): string {

	return toFrameString(value, { locales });

}

export function entryCompare(x: Entry, y: Entry) {
	return toEntryString(x).localeCompare(toEntryString(y));
}
