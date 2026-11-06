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
import { immutable } from "@metreeca/core/values";
import type { Type } from "./index.js";
import { dropOffset, fromTime, toTime } from "./_/core/temporal.js";
import { malformed, mismatched, inconvertible } from "./index.core.js";


/**
 * Time presentation.
 */
export type TimeOpts = {

	/**
	 * The localised time style; defaults to `short`, as in `2:30 PM`.
	 */
	readonly style?: Intl.DateTimeFormatOptions["timeStyle"]

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Time type.
 *
 * Shows `xsd:time` values as the localised time of day they state, whatever their offset, and moves them to and from
 * the `HH:MM:SS` form a `time` input works on; input stated to the minute is stored with zero seconds.
 */
export const time: Type<string, TimeOpts> = immutable({

	label: "time",


	format(value, { locales, style = "short" } = {}) {

		return isString(value)
			? new Intl.DateTimeFormat(locales, { timeStyle: style, timeZone: "UTC" })
				.format(toTime(value) ?? malformed("time", value))
			: mismatched("time", value);

	},

	write(value) {

		return !isString(value) ? mismatched("time", value)
			: toTime(value) ? dropOffset(value)
				: malformed("time", value);

	},

	parse(text) {

		const value = fromTime(text);

		return toTime(value) ? value : malformed("time", text);

	},


	as(type) {

		return type === time ? type
			: inconvertible("time", type);

	}

});
