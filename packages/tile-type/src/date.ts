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
 * Date values.
 *
 * @module
 */

import { isString } from "@metreeca/core";
import { date as shape } from "@metreeca/blue/string";
import { immutable } from "@metreeca/core/values";
import type { Configurable } from "./index.js";
import {
	configurable,
	isMoment,
	lexical,
	malformed,
	mismatched,
	NumericDate,
	toInstant,
	toLocalDay,
	toMoment
} from "./index.core.js";


const valid = lexical(shape());

/**
 * Days as a `date` input yields them.
 */
const Day = /^\d{4}-\d{2}-\d{2}$/;


/**
 * How stored values hold the day they stand for.
 */
type Storage = {

	/**
	 * The time zone days are read in, the runtime one if undefined.
	 */
	readonly zone?: "UTC"

	/**
	 * Reads a stored value as a moment falling on its day in {@link zone}.
	 */
	read(value: string): Date

	/**
	 * Names the day a moment falls on in {@link zone}, in `YYYY-MM-DD` form.
	 */
	day(moment: Date): string

	/**
	 * Stores a `YYYY-MM-DD` day.
	 */
	store(day: string): string

}

/**
 * `xsd:date` values, read as the UTC midnight of the day they state, so they are shown as stated whatever their offset.
 */
const Dates: Storage = {
	zone: "UTC",
	read: value => toMoment("date", valid, value, value => `${value.slice(0, 10)}T00:00:00Z`),
	day: moment => moment.toISOString().slice(0, 10),
	store: day => day
};

/**
 * `xsd:dateTime` instants, read as the local day they fall on and stored as the instant of its local midnight.
 */
const Instants: Storage = {
	read: value => toInstant("date", value),
	day: toLocalDay,
	store: day => new Date(`${day}T00:00:00`).toISOString()
};


/**
 * Date presentation.
 */
export type DateOpts = {

	/**
	 * The localised date style; numeric with a full year if omitted, as in `3/5/2024`.
	 */
	readonly style?: Intl.DateTimeFormatOptions["dateStyle"]

	/**
	 * Whether values are stored as `xsd:dateTime` instants rather than `xsd:date` values; defaults to `false`.
	 *
	 * Instants are shown and edited as the day they fall on in the runtime time zone, and a day read back from an input
	 * is stored as the instant of its local midnight, dropping whatever time of day the instant held before.
	 */
	readonly instant?: boolean

}


/**
 * Date type.
 *
 * Shows `xsd:date` values as the localised day they state, whatever their offset, and moves them to and from the
 * `YYYY-MM-DD` form a `date` input works on, rejecting days missing from the calendar.
 */
export const date: Configurable<DateOpts, string> = configurable(({ style, instant = false }) => {

	const storage = instant ? Instants : Dates;
	const presentation = style === undefined ? NumericDate : { dateStyle: style };

	return immutable({

		label: "date",

		format(value, { locales } = {}) {
			return isString(value)
				? new Intl.DateTimeFormat(locales, { ...presentation, timeZone: storage.zone }).format(storage.read(value))
				: mismatched("date", value);
		},

		write(value) {
			return isString(value) ? storage.day(storage.read(value)) : mismatched("date", value);
		},

		parse(text) {
			return Day.test(text) && isMoment(valid, text, text => `${text}T00:00:00Z`)
				? storage.store(text)
				: malformed("date", text);
		}

	});

});
