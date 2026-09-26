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

import { boolean, isBoolean } from "@metreeca/core/boolean";
import { date, isDate } from "@metreeca/core/date";
import { dateTime, isDateTime } from "@metreeca/core/dateTime";
import { decimal, isDecimal } from "@metreeca/core/decimal";
import { entry, isEntry } from "@metreeca/core/entry";
import { frame, isFrame } from "@metreeca/core/frame";
import { integer, isInteger } from "@metreeca/core/integer";
import { isString, string } from "@metreeca/core/string";
import { isText, text } from "@metreeca/core/text";
import { isTime, time } from "@metreeca/core/time";
import { isValue, Value } from "@metreeca/core/value";
import { isYear, year } from "@metreeca/core/year";


/**
 * @type <V> the JSON value type
 * @type <T> the native value type
 */
export interface Type<V extends Value=any, T=V> {

	readonly label: string;
	readonly model: V;


	/**
	 * Encodes a native value into a JSON value.
	 *
	 * @param value the native value to be encoded
	 */
	encode(value: T): V;

	/**
	 * Decodes a JSON value into a native value.
	 *
	 * @param value the JSON value to be decoded
	 */
	decode(value: V): T;


	/**
	 * Converts a native value into an editable textual representation.
	 *
	 * @param value the native value to be converted
	 */
	write(value: T): string;

	/**
	 * Converts an editable textual representation into a native string.
	 *
	 * @param string the textual representation to be converted
	 */
	parse(string: string): T;


	/**
	 * Converts a native value into a read-only localized textual representation.
	 *
	 * @param value the native value to be converted
	 * @param locales a string with a BCP 47 language tag, or an array of such strings
	 */
	format(value: T, locales?: Intl.LocalesArgument): string;


	cast(type: Type): Type<V, T>;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function isType<V extends Value, T>(value: unknown): value is Type<V, T> { // parametric types are functions
	return isFunction(value) && isType({ ...value }) || isObject(value)
		&& isString(value.label)
		&& isValue(value.model)
		&& isFunction(value.encode)
		&& isFunction(value.decode);
}

export function toType(model: unknown): Type {
	return isBoolean(model) ? boolean

		: isInteger(model) && Object.is(model, -0) ? integer // ;( see integer.ts#integer.model
			: isDecimal(model) ? decimal

				: isYear(model) ? year
					: isDate(model) ? date
						: isTime(model) ? time
							: isDateTime(model) ? dateTime

								: isString(model) ? string
									: isText(model) ? text

										: isEntry(model) ? entry
											: isFrame(model) ? frame

												: error(`unknown type for model value <${model}>`);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function malformed<V>(type: Type, value: unknown): V {
	return error(new TypeError(`value <${value}> is not a <${type.label}> string`));
}

export function inconvertible<V>(type: Type, cast: Type): V {
	return error(new TypeError(`unsupported <${type.label}> cast from type <${cast.label}>`));
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Defines a model entry that that is not always returned by the server.
 *
 * Useful to specify on-demand entries conditionally included in requests or labelled table fields.
 *
 * @param value
 */
export function virtual<T>(value: T): T {
	return undefined as any;
}

export function union<T extends (Value | Type)[]>(...values: T): T[number] {
	return values.map(model) as any;
}


export function required<V extends Value, T>(value: V | Type<V, T>): V {
	return model(value);
}

export function optional<V extends Value, T>(value: V | Type<V, T>): undefined | V {
	return model(value);
}

export function repeatable<V extends Value, T>(value: V | Type<V, T>): V[] {
	return [model(value)];
}

export function multiple<V extends Value, T>(value: V | Type<V, T>): undefined | V[] {
	return [model(value)];
}


function model<V extends Value, T>(value: V | Type<V, T>): V {
	return isType<V, T>(value) ? value.model : value;
}
