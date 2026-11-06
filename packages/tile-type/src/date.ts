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
import { immutable } from "@metreeca/core/values";
import type { Type } from "./index.js";
import { fromDay, toDate, toUTCDay } from "./_/core/temporal.js";
import { malformed, mismatched, inconvertible } from "./index.core.js";
import { year } from "./year.js";


/**
 * Date presentation.
 */
export type DateOpts = {

	/**
	 * The localised date style; numeric with a full year if omitted, as in `3/5/2024`.
	 */
	readonly style?: Intl.DateTimeFormatOptions["dateStyle"]

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Date type.
 *
 * Shows `xsd:date` values as the localised day they state, whatever their offset, and moves them to and from the
 * `YYYY-MM-DD` form a `date` input works on, rejecting days missing from the calendar.
 *
 * Shown as {@link "year"!year year} through {@link dateYear}, dates are shown and edited as the year they fall in.
 */
export const date: Type<string, DateOpts> = immutable({

	label: "date",


	format(value, { locales, style } = {}) {

		const day = isString(value) ? toDate(value) ?? malformed("date", value) : mismatched("date", value);

		return new Intl.DateTimeFormat(locales, {
			...(style === undefined ? { year: "numeric", month: "numeric", day: "numeric" } : { dateStyle: style }),
			timeZone: "UTC"
		}).format(day);

	},

	write(value) {

		return isString(value) ? toUTCDay(toDate(value) ?? malformed("date", value)) : mismatched("date", value);

	},

	parse(text) {

		return fromDay(text) ? text : malformed("date", text);

	},


	as(type) {

		return type === date ? type
			: type === year ? dateYear
				: inconvertible("date", type);

	}

});

/**
 * Date-as-year type.
 *
 * Shows `xsd:date` values as the localised year they fall in, whatever their offset, and moves them to and from the
 * four digits a `number` input works on, dropping whatever offset the stored date states.
 *
 * A year read back is stored as its first day, or as its last day if read as the upper bound of a range.
 *
 * Returned by `date.as(year)`.
 */
export const dateYear: Type<string> = immutable({

	label: "year",


	format(value, options) {

		return year.format(dateYear.write(value), options);

	},

	write(value) {

		return date.write(value).slice(0, 4);

	},

	parse(text, { upper } = {}) {

		return `${year.write(year.parse(text))}-${upper ? "12-31" : "01-01"}`;

	},


	as(type) {

		return date.as(type);

	}

});
