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

/**
 * Value type assembly.
 *
 * The building blocks every value type module shares: the configurable form a type takes, the uniform failures raised
 * for values and text that don't fit a type, and the reading of temporal values as moments.
 *
 * @module
 */

import { error, isArray, isObject, isString } from "@metreeca/core";
import { instant, type StringShape } from "@metreeca/blue/string";
import type { Dictionary } from "@metreeca/qest/state";
import type { Configurable, Type } from "./index.js";


/**
 * A trailing offset, either `Z` or signed hours and minutes.
 */
export const Offset = /(?:Z|[+-]\d{2}:\d{2})$/;

/**
 * The numeric day, month and full year dates are shown as when no date style is configured, as in `3/5/2024`.
 */
export const NumericDate: Readonly<Intl.DateTimeFormatOptions> = {
	year: "numeric",
	month: "numeric",
	day: "numeric"
};


/**
 * Makes a type configurable.
 *
 * @param factory The factory creating a type variant from its configuration
 *
 * @returns A type presenting values as `factory` does with no configuration, and callable with one to obtain the
 *     variant `factory` creates from it, so a configured type is always the same kind of value as a default one
 */
export function configurable<C extends object, V>(factory: (config: Partial<C>) => Type<V>): Configurable<C, V> {
	return Object.freeze(Object.assign( // assigning onto a function created here, never onto a caller's value
		(config: C) => factory(config),
		factory({})
	));
}


/**
 * Rejects a value that doesn't fit a type.
 *
 * @throws {@link !TypeError TypeError} Always
 */
export function mismatched(label: string, value: unknown): never {
	return error(new TypeError(`mismatched ${label} value <${JSON.stringify(value)}>`));
}

/**
 * Rejects text that is not well-formed for a type.
 *
 * @throws {@link !SyntaxError SyntaxError} Always
 */
export function malformed(label: string, text: string): never {
	return error(new SyntaxError(`malformed ${label} <${text}>`));
}


/**
 * Checks if a value is language-tagged text.
 */
export function isDictionary(value: unknown): value is Dictionary {
	return isObject(value, value => isString(value) || isArray(value, isString));
}

/**
 * Creates a check for the lexical form a blue string shape admits.
 *
 * @param shape The shape whose pattern values are checked against
 *
 * @returns A predicate accepting the strings matching the pattern of `shape`
 */
export function lexical(shape: StringShape): (value: string) => boolean {

	const pattern = new RegExp(shape.pattern ?? "");

	return value => pattern.test(value);

}

/**
 * Reads a temporal value as a moment.
 *
 * @param label The name of the type, for messages
 * @param valid The check for the lexical form of the type
 * @param value The value to be read
 * @param moment The `Date` string the value stands for, once known to be well-formed
 *
 * @returns The moment `value` stands for
 *
 * @throws {@link !SyntaxError SyntaxError} If `value` fails `valid`, or names a day missing from the calendar
 */
export function toMoment(
	label: string,
	valid: (value: string) => boolean,
	value: string,
	moment: (value: string) => string
): Date {
	return isMoment(valid, value, moment) ? new Date(moment(value)) : malformed(label, value);
}

/**
 * Checks if a temporal value names a moment.
 *
 * @param valid The check for the lexical form of the type
 * @param value The value to be checked
 * @param moment The `Date` string the value stands for, once known to be well-formed
 *
 * @returns `true` if `value` passes `valid` and names a moment found in the calendar; `false` otherwise
 */
export function isMoment(valid: (value: string) => boolean, value: string, moment: (value: string) => string): boolean {
	return valid(value) && isCalendarDay(moment(value).slice(0, 10)) && !Number.isNaN(new Date(moment(value)).getTime());
}

/**
 * Checks if a `YYYY-MM-DD` day is found in the calendar, as `2024-02-30` is not, though `Date` rolls it over.
 */
function isCalendarDay(day: string): boolean {

	const date = new Date(`${day}T00:00:00Z`);

	return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === day;

}

/**
 * Reads an instant.
 *
 * @param label The name of the type, for messages
 * @param value The instant in `xsd:dateTime` lexical form, taken as UTC where it states no offset
 *
 * @returns The moment `value` stands for
 *
 * @throws {@link !SyntaxError SyntaxError} If `value` is not a well-formed `xsd:dateTime`
 */
export function toInstant(label: string, value: string): Date {
	return toMoment(label, Instant, value, value => Offset.test(value) ? value : `${value}Z`);
}

const Instant = lexical(instant());

/**
 * Names the local day a moment falls on.
 *
 * @returns The day `date` falls on in the runtime time zone, in the `YYYY-MM-DD` form a `date` input works on
 */
export function toLocalDay(date: Date): string {
	return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
}

/**
 * Pads a number with leading zeros.
 */
export function pad(amount: number, digits: number = 2): string {
	return String(amount).padStart(digits, "0");
}
