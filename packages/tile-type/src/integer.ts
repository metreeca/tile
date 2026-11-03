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
 * Integer values.
 *
 * @module
 */

import { isNumber } from "@metreeca/core";
import { immutable } from "@metreeca/core/values";
import type { Configurable } from "./index.js";
import { configurable, malformed, mismatched } from "./index.core.js";


/**
 * Integer text as a `number` input yields it.
 */
const Digits = /^[-+]?\d+$/;


/**
 * Integer presentation.
 */
export type IntegerOpts = {

	/**
	 * Whether large numbers are abbreviated, as in `12K` for `12,345`; defaults to `false`.
	 */
	readonly compact?: boolean

}


/**
 * Integer type.
 *
 * Shows numbers localised with no fractional digits, rounding any the value carries, and moves them to and from the
 * plain decimal digits a `number` input works on, with no grouping separators whatever the reader locale.
 *
 * Input is read as an integer: text standing for a fractional number is rejected rather than rounded.
 */
export const integer: Configurable<IntegerOpts, number> = configurable(({ compact = false }) => immutable({

	label: "integer",

	format(value, { locales } = {}) {
		return isNumber(value)
			? new Intl.NumberFormat(locales, compact ? { notation: "compact" } : { maximumFractionDigits: 0 }).format(value)
			: mismatched("integer", value);
	},

	write(value) {
		return isNumber(value) ? String(value) : mismatched("integer", value);
	},

	parse(text) {
		return Digits.test(text) ? Number(text) : malformed("integer", text);
	}

}));
