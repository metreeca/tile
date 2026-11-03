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
 * Time values.
 *
 * @module
 */

import { isString } from "@metreeca/core";
import { time as shape } from "@metreeca/blue/string";
import { immutable } from "@metreeca/core/values";
import type { Configurable } from "./index.js";
import { configurable, isMoment, lexical, malformed, mismatched, Offset, toMoment } from "./index.core.js";


const valid = lexical(shape());

/**
 * Times stated to the minute, as a `time` input yields them unless it shows seconds.
 */
const Minutes = /^\d{2}:\d{2}$/;


/**
 * The moment a time falls on at the UTC epoch, so it is shown as stated whatever its offset.
 */
function epoch(value: string): string {
	return `1970-01-01T${value.replace(Offset, "")}Z`;
}


/**
 * Time presentation.
 */
export type TimeOpts = {

	/**
	 * The localised time style; defaults to `short`, as in `2:30 PM`.
	 */
	readonly style?: Intl.DateTimeFormatOptions["timeStyle"]

}


/**
 * Time type.
 *
 * Shows `xsd:time` values as the localised time of day they state, whatever their offset, and moves them to and from
 * the `HH:MM:SS` form a `time` input works on; input stated to the minute is stored with zero seconds.
 */
export const time: Configurable<TimeOpts, string> = configurable(({ style = "short" }) => immutable({

	label: "time",

	format(value, { locales } = {}) {
		return isString(value)
			? new Intl.DateTimeFormat(locales, { timeStyle: style, timeZone: "UTC" })
				.format(toMoment("time", valid, value, epoch))
			: mismatched("time", value);
	},

	write(value) {
		return !isString(value) ? mismatched("time", value)
			: isMoment(valid, value, epoch) ? value.replace(Offset, "")
				: malformed("time", value);
	},

	parse(text) {

		const value = Minutes.test(text) ? `${text}:00` : text;

		return isMoment(valid, value, epoch) ? value : malformed("time", text);

	}

}));
