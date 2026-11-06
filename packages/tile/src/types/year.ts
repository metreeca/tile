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
import { immutable } from "@metreeca/core/values";
import type { Type } from "./index.js";
import { toUTCYear, toYear } from "../_/core/temporal.js";
import { malformed, mismatched, inconvertible } from "./index.core.js";


/**
 * Year type.
 *
 * Shows `xsd:gYear` values as the localised year they state, whatever their offset, and moves them to and from the
 * four digits a `number` input works on, dropping the offset on the way to the input.
 */
export const year: Type<string> = immutable({

	label: "year",


	format(value, { locales } = {}) {

		const start = isString(value) ? toYear(value) ?? malformed("year", value) : mismatched("year", value);

		return new Intl.DateTimeFormat(locales, { year: "numeric", timeZone: "UTC" }).format(start);

	},

	write(value) {

		return isString(value) ? toUTCYear(toYear(value) ?? malformed("year", value)) : mismatched("year", value);

	},

	parse(text) {

		return toYear(text) ? text : malformed("year", text);

	},


	as(type) {

		return type === year ? type
			: inconvertible("year", type);

	}

});
