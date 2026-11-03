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
 * Decimal values.
 *
 * @module
 */

import { error, isNumber } from "@metreeca/core";
import { immutable } from "@metreeca/core/values";
import type { Configurable } from "./index.js";
import { configurable, malformed, mismatched } from "./index.core.js";


/**
 * Decimal text as a `number` input yields it.
 */
const Digits = /^[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?$/;


/**
 * Decimal presentation.
 */
export type DecimalOpts = {

	/**
	 * The number of fractional digits shown, rounding or padding the value to it; defaults to the digits each value
	 * carries, rounded to three at most, so that values stated with fewer digits are not padded.
	 */
	readonly fractionDigits?: number

	/**
	 * Whether large numbers are abbreviated, as in `12K` for `12,345`; defaults to `false`.
	 */
	readonly compact?: boolean

}


/**
 * Decimal type.
 *
 * Shows numbers localised, and moves them to and from the plain decimal notation a `number` input works on, so an
 * edit carries every digit of the value, whatever the presentation rounds away.
 *
 * @throws {@link !RangeError RangeError} When configured, if `fractionDigits` is not an integer between 0 and 100
 */
export const decimal: Configurable<DecimalOpts, number> = configurable(({ fractionDigits, compact = false }) => {

	const presentation: Intl.NumberFormatOptions = fractionDigits === undefined ? {}
		: Number.isInteger(fractionDigits) && fractionDigits >= 0 && fractionDigits <= 100 ? {
			minimumFractionDigits: fractionDigits,
			maximumFractionDigits: fractionDigits
		}
		: error(new RangeError(`illegal fraction digits <${fractionDigits}>`));

	return immutable({

		label: "decimal",

		format(value, { locales } = {}) {
			return isNumber(value)
				? new Intl.NumberFormat(locales, { ...presentation, ...(compact ? { notation: "compact" } : {}) }).format(value)
				: mismatched("decimal", value);
		},

		write(value) {
			return isNumber(value) ? String(value) : mismatched("decimal", value);
		},

		parse(text) {
			return Digits.test(text) ? Number(text) : malformed("decimal", text);
		}

	});

});
