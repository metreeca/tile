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
import { date, type DateOpts } from "./date.js";
import type { Type } from "./index.js";
import {
	fromLocalDateTime,
	fromLocalDay,
	fromLocalDayEnd,
	toInstant,
	toLocalDateTime,
	toNumericDateTime
} from "./_/core/temporal.js";
import { malformed, mismatched, inconvertible } from "./index.core.js";
import { year } from "./year.js";


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


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Instant type.
 *
 * Shows `xsd:dateTime` values as the localised date and time they fall on in the runtime time zone, and moves them to
 * and from the wall-clock `YYYY-MM-DDTHH:MM:SS` form a `datetime-local` input works on, which carries no offset.
 *
 * Instants are stored pinned to UTC with millisecond precision, as in `2024-03-05T13:30:00.000Z`; an instant stated
 * without an offset is taken as UTC. Text handed to an input carries milliseconds only for fractional seconds.
 *
 * Shown as {@link "date"!date date} or {@link "year"!year year} through {@link instantDate} and {@link instantYear},
 * instants are shown and edited as the day or year they fall in within the runtime time zone.
 */
export const instant: Type<string, InstantOpts> = immutable({

	label: "instant",


	format(value, { locales, dateStyle, timeStyle = "short" } = {}) {

		const moment = isString(value) ? toInstant(value) ?? malformed("instant", value) : mismatched("instant", value);

		return dateStyle === undefined
			? toNumericDateTime(locales, timeStyle, moment)
			: new Intl.DateTimeFormat(locales, { dateStyle, timeStyle }).format(moment);

	},

	write(value) {

		return isString(value)
			? toLocalDateTime(toInstant(value) ?? malformed("instant", value))
			: mismatched("instant", value);

	},

	parse(text) {

		return (fromLocalDateTime(text) ?? malformed("instant", text)).toISOString();

	},


	as(type) {

		return type === instant ? type
			: type === date ? instantDate
				: type === year ? instantYear
					: inconvertible("instant", type);

	}

});

/**
 * Instant-as-date type.
 *
 * Shows `xsd:dateTime` values as the localised day they fall on in the runtime time zone, and moves them to and from
 * the `YYYY-MM-DD` form a `date` input works on, so a reader picks a day without stating a time of day.
 *
 * A day read back is stored as its local midnight, or as its last millisecond if read as the upper bound of a range.
 *
 * Returned by `instant.as(date)`.
 */
export const instantDate: Type<string, DateOpts> = immutable({

	label: "date",


	format(value, options) {

		return date.format(instantDate.write(value), options);

	},

	write(value) {

		return instant.write(value).slice(0, 10);

	},

	parse(text, { upper } = {}) {

		const day = date.parse(text);

		return (upper ? fromLocalDayEnd(day) : fromLocalDay(day)).toISOString();

	},


	as(type) {

		return instant.as(type);

	}

});

/**
 * Instant-as-year type.
 *
 * Shows `xsd:dateTime` values as the localised year they fall in, in the runtime time zone, and moves them to and from
 * the four digits a `number` input works on, so a reader picks a year without stating a day or a time of day.
 *
 * A year read back is stored as the instant it starts at, or as its last millisecond if read as an upper bound.
 *
 * Returned by `instant.as(year)`.
 */
export const instantYear: Type<string> = immutable({

	label: "year",


	format(value, options) {

		return year.format(instantYear.write(value), options);

	},

	write(value) {

		return instant.write(value).slice(0, 4);

	},

	parse(text, { upper } = {}) {

		const digits = year.write(year.parse(text));

		return (upper ? fromLocalDayEnd(`${digits}-12-31`) : fromLocalDay(`${digits}-01-01`)).toISOString();

	},


	as(type) {

		return instant.as(type);

	}

});
