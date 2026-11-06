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
 * Temporal value handling.
 *
 * The building blocks the temporal value types share: reading stored values as moments, rejecting days missing from
 * the calendar, moving moments to and from the forms native date and time inputs work on, and showing them, along with
 * taking durations apart into the units they span and putting them back together.
 *
 * @module
 */

import { error, type Optional } from "@metreeca/core";
import { malformed } from "../../index.core.js";


/**
 * A `YYYY-MM-DD` day.
 */
const day = String.raw`\d{4}-\d{2}-\d{2}`;

/**
 * An `HH:MM` clock reading.
 */
const clock = String.raw`\d{2}:\d{2}`;

/**
 * An `HH:MM:SS` time with optional fraction.
 */
const time = String.raw`${clock}:\d{2}(?:\.\d+)?`;

/**
 * An offset, either `Z` or signed hours and minutes.
 */
const offset = String.raw`(?:Z|[+-]${clock})`;

/**
 * The years, months and days of a duration, each optional.
 */
const datePart = String.raw`(?:(?<years>\d+)Y)?(?:(?<months>\d+)M)?(?:(?<days>\d+)D)?`;

/**
 * The hours, minutes and possibly fractional seconds of a duration, each optional.
 */
const timePart = String.raw`(?:(?<hours>\d+)H)?(?:(?<minutes>\d+)M)?(?:(?<seconds>\d+(?:\.\d+)?)S)?`;


/**
 * Stored years, as four digits with an optional offset.
 */
const Years = new RegExp(String.raw`^\d{4}${offset}?$`);

/**
 * Stored dates, as a `YYYY-MM-DD` day with an optional offset.
 */
const Dates = new RegExp(`^${day}${offset}?$`);

/**
 * Stored times, as `HH:MM:SS` with optional fraction and offset.
 */
const Times = new RegExp(`^${time}${offset}?$`);

/**
 * Stored instants, as a `YYYY-MM-DDTHH:MM:SS` stamp with optional fraction and offset.
 */
const Instants = new RegExp(`^${day}T${time}${offset}?$`);

/**
 * A trailing offset.
 */
const Offset = new RegExp(`${offset}$`);

/**
 * Days as a `date` input yields them.
 */
const Day = new RegExp(`^${day}$`);

/**
 * Times stated to the minute, as a `time` input yields them unless it shows seconds.
 */
const Minutes = new RegExp(`^${clock}$`);

/**
 * Wall-clock times as a `datetime-local` input yields them, to the minute and optionally to the millisecond.
 */
const Local = new RegExp(String.raw`^${day}T${clock}(?::\d{2}(?:\.\d{1,3})?)?$`);

/**
 * The components of a well-formed `xsd:duration` value, captured by unit in lexical order; at least one is stated, and
 * a time part marked by `T` states at least one of its own.
 */
const Components = new RegExp(String.raw`^(?<negative>-)?P(?!$)${datePart}(?:T(?=\d)${timePart})?$`);


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Duration components.
 *
 * The amount of each unit a duration spans, as written in its lexical form. Components are kept as given, never
 * normalised, so `PT90M` spans 90 minutes rather than 1 hour and 30 minutes, and a missing one spans none of its unit.
 */
export type Duration = {

	/**
	 * Whether the duration runs backwards in time.
	 */
	readonly negative?: boolean

	readonly years?: number
	readonly months?: number
	readonly days?: number
	readonly hours?: number
	readonly minutes?: number

	/**
	 * The seconds spanned, possibly fractional.
	 */
	readonly seconds?: number

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Reads a year as the UTC moment it starts at, so it is shown as stated whatever its offset.
 *
 * @param value The year in `xsd:gYear` lexical form
 *
 * @returns The moment `value` starts at, or `undefined` if `value` is not a well-formed `xsd:gYear`
 */
export function toYear(value: string): Optional<Date> {
	return Years.test(value) ? toMoment(`${value.slice(0, 4)}-01-01T00:00:00Z`) : undefined;
}

/**
 * Reads a date as the UTC midnight of the day it states, so it is shown as stated whatever its offset.
 *
 * @param value The date in `xsd:date` lexical form
 *
 * @returns The moment `value` starts at, or `undefined` if `value` is not a well-formed `xsd:date` in the calendar
 */
export function toDate(value: string): Optional<Date> {
	return Dates.test(value) ? toMoment(`${value.slice(0, 10)}T00:00:00Z`) : undefined;
}

/**
 * Reads a time as the moment it falls on at the UTC epoch, so it is shown as stated whatever its offset.
 *
 * @param value The time in `xsd:time` lexical form
 *
 * @returns The moment `value` falls on, or `undefined` if `value` is not a well-formed `xsd:time`
 */
export function toTime(value: string): Optional<Date> {
	return Times.test(value) ? toMoment(`1970-01-01T${dropOffset(value)}Z`) : undefined;
}

/**
 * Reads an instant.
 *
 * @param value The instant in `xsd:dateTime` lexical form, taken as UTC where it states no offset
 *
 * @returns The moment `value` stands for, or `undefined` if `value` is not a well-formed `xsd:dateTime`
 */
export function toInstant(value: string): Optional<Date> {
	return Instants.test(value) ? toMoment(Offset.test(value) ? value : `${value}Z`) : undefined;
}

/**
 * Drops the offset a time or instant states.
 *
 * @returns `value` with its trailing offset removed, if any
 */
export function dropOffset(value: string): string {
	return value.replace(Offset, "");
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Names the UTC year a moment falls in.
 *
 * @returns The year `moment` falls in, in the four-digit form a `number` input works on
 */
export function toUTCYear(moment: Date): string {
	return pad(moment.getUTCFullYear(), 4);
}

/**
 * Names the UTC day a moment falls on.
 *
 * @returns The day `moment` falls on in UTC, in the `YYYY-MM-DD` form a `date` input works on
 */
export function toUTCDay(moment: Date): string {
	return moment.toISOString().slice(0, 10);
}

/**
 * Names the local day a moment falls on.
 *
 * @returns The day `moment` falls on in the runtime time zone, in the `YYYY-MM-DD` form a `date` input works on
 */
export function toLocalDay(moment: Date): string {
	return `${pad(moment.getFullYear(), 4)}-${pad(moment.getMonth()+1)}-${pad(moment.getDate())}`;
}

/**
 * Names the local wall-clock time a moment falls on.
 *
 * @returns The date and time `moment` falls on in the runtime time zone, in the `YYYY-MM-DDTHH:MM:SS` form a
 *     `datetime-local` input works on, carrying milliseconds only for fractional seconds
 */
export function toLocalDateTime(moment: Date): string {

	const time = `${pad(moment.getHours())}:${pad(moment.getMinutes())}:${pad(moment.getSeconds())}`;
	const fraction = moment.getMilliseconds() === 0 ? "" : `.${pad(moment.getMilliseconds(), 3)}`;

	return `${toLocalDay(moment)}T${time}${fraction}`;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Reads a day yielded by a `date` input.
 *
 * @param text The `YYYY-MM-DD` day yielded by the input
 *
 * @returns The UTC midnight of `text`, or `undefined` if `text` is not a `YYYY-MM-DD` day found in the calendar
 */
export function fromDay(text: string): Optional<Date> {
	return Day.test(text) ? toDate(text) : undefined;
}

/**
 * Reads a day yielded by a `date` input as the moment of its local midnight.
 *
 * @param day The `YYYY-MM-DD` day yielded by the input
 *
 * @returns The moment the runtime time zone enters `day` at
 */
export function fromLocalDay(day: string): Date {
	return new Date(`${day}T00:00:00`);
}

/**
 * Reads a day yielded by a `date` input as the last moment before its local midnight ends it.
 *
 * @param day The `YYYY-MM-DD` day yielded by the input
 *
 * @returns The last millisecond the runtime time zone spends in `day`, whatever daylight saving shifts it
 */
export function fromLocalDayEnd(day: string): Date {

	const start = fromLocalDay(day);
	const next = new Date(start.getFullYear(), start.getMonth(), start.getDate()+1);

	return new Date(next.getTime()-1);

}

/**
 * Completes a time yielded by a `time` input with zero seconds where it is stated to the minute.
 *
 * @param text The `HH:MM` or `HH:MM:SS` time yielded by the input
 *
 * @returns `text` stated to the second at least
 */
export function fromTime(text: string): string {
	return Minutes.test(text) ? `${text}:00` : text;
}

/**
 * Reads a wall-clock time yielded by a `datetime-local` input.
 *
 * @param text The `YYYY-MM-DDTHH:MM` time yielded by the input, optionally with seconds and milliseconds
 *
 * @returns The moment `text` names in the runtime time zone, or `undefined` if `text` is not a wall-clock time
 */
export function fromLocalDateTime(text: string): Optional<Date> {

	const moment = new Date(text); // no offset, so read as local time

	return Local.test(text) && !Number.isNaN(moment.getTime()) ? moment : undefined;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Formats an instant with a numeric date carrying the full year, as no date style does in every locale.
 *
 * @param locales The locales to format for
 * @param timeStyle The localised time style
 * @param moment The instant to format
 *
 * @returns `moment` as the `short` date style shows it, with its year widened to the full digits the locale writes
 */
export function toNumericDateTime(
	locales: Intl.LocalesArgument,
	timeStyle: Intl.DateTimeFormatOptions["timeStyle"],
	moment: Date
): string {

	const year = new Intl.DateTimeFormat(locales, { year: "numeric" })
		.formatToParts(moment)
		.find(({ type }) => type === "year")?.value;

	return new Intl.DateTimeFormat(locales, { dateStyle: "short", timeStyle })
		.formatToParts(moment)
		.map(({ type, value }) => type === "year" && year !== undefined ? year : value)
		.join("");

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Takes a duration apart.
 *
 * @param value The duration in `xsd:duration` lexical form, as in `P1Y2M` or `-PT1.5S`
 *
 * @returns The components `value` spans, holding only the units it states
 *
 * @throws {@link !SyntaxError SyntaxError} If `value` is not a well-formed `xsd:duration`
 */
export function decodeDuration(value: string): Duration {

	const { negative, ...amounts } = Components.exec(value)?.groups ?? malformed("duration", value);

	return {
		...(negative ? { negative: true } : {}),
		...Object.fromEntries(Object.entries(amounts).flatMap(([unit, amount]) =>
			amount === undefined ? [] : [[unit, Number(amount)]]
		))
	};

}

/**
 * Puts a duration together.
 *
 * @param duration The components of the duration
 *
 * @returns The `xsd:duration` lexical form of `duration`, stating only the units it spans; `PT0S` if it spans none
 *
 * @throws {@link !RangeError RangeError} If a component is negative, not finite, or fractional outside seconds
 */
export function encodeDuration({ negative, years, months, days, hours, minutes, seconds }: Duration): string {

	const illegal = Object.entries({ years, months, days, hours, minutes, seconds }).find(([unit, amount]) =>
		amount !== undefined && !(Number.isFinite(amount) && amount >= 0 && (unit === "seconds" || Number.isInteger(amount)))
	);

	const stated = (amount: undefined | number, designator: string) => amount ? `${amount}${designator}` : "";

	const date = `${stated(years, "Y")}${stated(months, "M")}${stated(days, "D")}`;
	const time = `${stated(hours, "H")}${stated(minutes, "M")}${stated(seconds, "S")}`;

	return illegal ? error(new RangeError(`illegal duration ${illegal[0]} <${illegal[1]}>`))
		: date === "" && time === "" ? "PT0S"
			: `${negative ? "-" : ""}P${date}${time === "" ? "" : `T${time}`}`;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Reads a date-time stamp as a moment.
 *
 * @param stamp The stamp in the `YYYY-MM-DDTHH:MM:SS` form `Date` reads, optionally with fraction and offset
 *
 * @returns The moment `stamp` names, or `undefined` if it names a day missing from the calendar or no moment at all
 */
function toMoment(stamp: string): Optional<Date> {

	const moment = new Date(stamp);

	return isCalendarDay(stamp.slice(0, 10)) && !Number.isNaN(moment.getTime()) ? moment : undefined;

}

/**
 * Checks if a `YYYY-MM-DD` day is found in the calendar, as `2024-02-30` is not, though `Date` rolls it over.
 */
function isCalendarDay(day: string): boolean {

	const date = new Date(`${day}T00:00:00Z`);

	return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === day;

}

/**
 * Pads a number with leading zeros.
 */
function pad(amount: number, digits: number = 2): string {
	return String(amount).padStart(digits, "0");
}
