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
 * Shows `xsd:duration` values, and takes them apart into the units an editor offers a field for, putting the fields
 * back together into the value a store accepts, since no native input edits a duration.
 *
 * @module
 */

import { error, isString } from "@metreeca/core";
import { duration as shape } from "@metreeca/blue/string";
import { immutable } from "@metreeca/core/values";
import type { Type } from "./index.js";
import { lexical, malformed, mismatched } from "./index.core.js";


/**
 * Duration type.
 *
 * Shows `xsd:duration` values as the localised list of the units they span, as in `1 hour, 30 minutes`, signing a
 * negative duration once, and moves them to and from their lexical form, which a text input edits as is; editors
 * offering a field per unit take values apart with {@link decodeDuration} and back with {@link encodeDuration}.
 */
export const duration: Type<string> = immutable({

	label: "duration",

	format(value, { locales } = {}) {

		const { negative, ...components } = isString(value) ? decodeDuration(value) : mismatched("duration", value);

		const spanned = Units.flatMap(([component, , unit]) => {
			const amount = components[component];
			return amount ? [{ unit, amount }] : [];
		});

		const parts = spanned.length === 0 ? [{ unit: "second", amount: 0 }] : spanned;

		return new Intl.ListFormat(locales, { type: "unit", style: "long" }).format(parts.map(({ unit, amount }, index) =>
			new Intl.NumberFormat(locales, { style: "unit", unit, unitDisplay: "long" })
				.format(negative && index === 0 ? -amount : amount)
		));

	},

	write(value) {
		return !isString(value) ? mismatched("duration", value)
			: valid(value) ? value
				: malformed("duration", value);
	},

	parse(text) {
		return valid(text) ? text : malformed("duration", text);
	}

});


/**
 * Well-formed `xsd:duration` values, as the blue duration shape admits them.
 */
const valid = lexical(shape());

/**
 * The components of a well-formed `xsd:duration` value, captured in lexical order.
 */
const Components = /^(-)?P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;

/**
 * Units in lexical order, with the designator each is stated with and the singular unit it is counted in.
 */
const Units: readonly (readonly [Unit, string, string])[] = [
	["years", "Y", "year"],
	["months", "M", "month"],
	["days", "D", "day"],
	["hours", "H", "hour"],
	["minutes", "M", "minute"],
	["seconds", "S", "second"]
];

type Unit = Exclude<keyof Duration, "negative">


/**
 * Duration components.
 *
 * The amount of each unit a duration spans, as written in its lexical form. Components are kept as given, never
 * normalised, so `PT90M` spans 90 minutes rather than 1 hour and 30 minutes, and a missing one spans none of its unit.
 */
export type Duration = {

	/**
	 * Whether the duration runs backwards in time.
	 */
	readonly negative?: boolean

	readonly years?: number
	readonly months?: number
	readonly days?: number
	readonly hours?: number
	readonly minutes?: number

	/**
	 * The seconds spanned, possibly fractional.
	 */
	readonly seconds?: number

}


/**
 * Takes a duration apart.
 *
 * @param value The duration in `xsd:duration` lexical form, as in `P1Y2M` or `-PT1.5S`
 *
 * @returns The components `value` spans, holding only the units it states
 *
 * @throws {@link !SyntaxError SyntaxError} If `value` is not a well-formed `xsd:duration`
 */
export function decodeDuration(value: string): Duration {

	const [, negative, ...amounts] = valid(value) && Components.exec(value) || [];

	return amounts.length === 0 ? malformed("duration", value) : {
		...(negative ? { negative: true } : {}),
		...Object.fromEntries(Units.flatMap(([unit], index) => {
			const amount = amounts[index];
			return amount === undefined ? [] : [[unit, Number(amount)]];
		}))
	};

}

/**
 * Puts a duration together.
 *
 * @param duration The components of the duration
 *
 * @returns The `xsd:duration` lexical form of `duration`, stating only the units it spans; `PT0S` if it spans none
 *
 * @throws {@link !RangeError RangeError} If a component is negative, not finite, or fractional outside seconds
 */
export function encodeDuration(duration: Duration): string {

	const illegal = Units.find(([unit]) => !isLegal(unit, duration[unit]));

	const stated = (units: typeof Units) => units
		.map(([unit, designator]) => duration[unit] ? `${duration[unit]}${designator}` : "")
		.join("");

	const date = stated(Units.slice(0, 3));
	const time = stated(Units.slice(3));

	return illegal ? error(new RangeError(`illegal duration ${illegal[0]} <${duration[illegal[0]]}>`))
		: date === "" && time === "" ? "PT0S"
			: `${duration.negative ? "-" : ""}P${date}${time === "" ? "" : `T${time}`}`;

}


function isLegal(unit: Unit, amount: undefined | number): boolean {
	return amount === undefined || Number.isFinite(amount) && amount >= 0
		&& (unit === "seconds" || Number.isInteger(amount));
}
