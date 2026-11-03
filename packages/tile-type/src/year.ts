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
 * Year values.
 *
 * @module
 */

import { isString } from "@metreeca/core";
import { year as shape } from "@metreeca/blue/string";
import { immutable } from "@metreeca/core/values";
import type { Type } from "./index.js";
import { lexical, malformed, mismatched, pad, toMoment } from "./index.core.js";


const valid = lexical(shape());

/**
 * Reads a year as the UTC moment it starts at, so it is shown as stated whatever its offset.
 */
function toYear(value: string): Date {
	return toMoment(year.label, valid, value, value => `${value.slice(0, 4)}-01-01T00:00:00Z`);
}


/**
 * Year type.
 *
 * Shows `xsd:gYear` values as the localised year they state, whatever their offset, and moves them to and from the
 * four digits a `number` input works on, dropping the offset on the way to the input.
 */
export const year: Type<string> = immutable({

	label: "year",

	format(value, { locales } = {}) {
		return isString(value)
			? new Intl.DateTimeFormat(locales, { year: "numeric", timeZone: "UTC" }).format(toYear(value))
			: mismatched(year.label, value);
	},

	write(value) {
		return isString(value) ? pad(toYear(value).getUTCFullYear(), 4) : mismatched(year.label, value);
	},

	parse(text) {
		return valid(text) ? text : malformed(year.label, text);
	}

});
