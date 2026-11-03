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
 * Instant values.
 *
 * @module
 */

import { isString } from "@metreeca/core";
import { immutable } from "@metreeca/core/values";
import type { Configurable } from "./index.js";
import { configurable, malformed, mismatched, pad, toInstant, toLocalDay } from "./index.core.js";


/**
 * Wall-clock times as a `datetime-local` input yields them, to the minute and optionally to the millisecond.
 */
const Local = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?$/;


/**
 * Instant presentation.
 */
export type InstantOpts = {

	/**
	 * The localised date style; numeric with a full year if omitted, as in `3/5/2024`.
	 */
	readonly dateStyle?: Intl.DateTimeFormatOptions["dateStyle"]

	/**
	 * The localised time style; defaults to `short`, as in `2:30 PM`.
	 */
	readonly timeStyle?: Intl.DateTimeFormatOptions["timeStyle"]

}


/**
 * Instant type.
 *
 * Shows `xsd:dateTime` values as the localised date and time they fall on in the runtime time zone, and moves them to
 * and from the wall-clock `YYYY-MM-DDTHH:MM:SS` form a `datetime-local` input works on, which carries no offset.
 *
 * Instants are stored pinned to UTC with millisecond precision, as in `2024-03-05T13:30:00.000Z`; an instant stated
 * without an offset is taken as UTC. Text handed to an input carries milliseconds only for fractional seconds.
 */
export const instant: Configurable<InstantOpts, string> = configurable(({

	dateStyle,
	timeStyle = "short"

}) => immutable({

	label: "instant",

	format(value, { locales } = {}) {
		return isString(value)
			? dateStyle === undefined
				? toNumeric(locales, timeStyle, toInstant("instant", value))
				: new Intl.DateTimeFormat(locales, { dateStyle, timeStyle }).format(toInstant("instant", value))
			: mismatched("instant", value);
	},

	write(value) {

		const date = isString(value) ? toInstant("instant", value) : mismatched("instant", value);

		const day = toLocalDay(date);
		const time = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
		const fraction = date.getMilliseconds() === 0 ? "" : `.${pad(date.getMilliseconds(), 3)}`;

		return `${day}T${time}${fraction}`;

	},

	parse(text) {

		const date = Local.test(text) ? new Date(text) : undefined; // no offset, so read as local time

		return date === undefined || Number.isNaN(date.getTime()) ? malformed("instant", text) : date.toISOString();

	}

}));


/**
 * Formats an instant with a numeric date carrying the full year, as no date style does in every locale.
 *
 * @param locales The locales to format for
 * @param timeStyle The localised time style
 * @param moment The instant to format
 *
 * @returns `moment` as the `short` date style shows it, with its year widened to the full digits the locale writes
 */
function toNumeric(locales: Intl.LocalesArgument, timeStyle: Intl.DateTimeFormatOptions["timeStyle"], moment: Date): string {

	const year = new Intl.DateTimeFormat(locales, { year: "numeric" })
		.formatToParts(moment)
		.find(({ type }) => type === "year")?.value;

	return new Intl.DateTimeFormat(locales, { dateStyle: "short", timeStyle })
		.formatToParts(moment)
		.map(({ type, value }) => type === "year" && year !== undefined ? year : value)
		.join("");

}
