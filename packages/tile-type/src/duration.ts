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
 * Duration values.
 *
 * @module
 */

import { isString } from "@metreeca/core";
import { immutable } from "@metreeca/core/values";
import { decodeDuration, encodeDuration } from "./_/core/temporal.js";
import { inconvertible, mismatched } from "./index.core.js";
import type { Type } from "./index.js";


/**
 * Duration type.
 *
 * Shows `xsd:duration` values as the localised list of the units they span, as in `1 hour, 30 minutes`, signing a
 * negative duration once, and moves them to and from their lexical form, which a text input edits as is.
 */
export const duration: Type<string> = immutable({

	label: "duration",


	format(value, { locales } = {}) {

		const { negative, ...components } = decodeDuration(isString(value) ? value : mismatched("duration", value));

		const spanned = Object.entries(components).filter(([, amount]) => amount > 0);
		const parts: readonly (readonly [string, number])[] = spanned.length > 0 ? spanned : [["seconds", 0]];

		const units = parts.map(([unit, amount], index) =>
			new Intl.NumberFormat(locales, { style: "unit", unit: unit.slice(0, -1), unitDisplay: "long" })
				.format(negative && index === 0 ? -amount : amount)
		);

		return new Intl.ListFormat(locales, { type: "unit", style: "long" }).format(units);

	},

	write(value) {

		return isString(value) ? duration.parse(value) : mismatched("duration", value);

	},

	parse(text) {

		return encodeDuration(decodeDuration(text));

	},


	as(type) {

		return type === duration ? type
			: inconvertible("duration", type);

	}

});
