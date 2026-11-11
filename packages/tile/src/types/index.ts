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
 * Shape-driven value text.
 *
 * Defines the contract every value type honours: showing a stored value to a reader, handing it to a native input and
 * reading back what the input yields. Values are always kept in the form the store holds them, so a type never
 * restates the data model. The shape describing a value picks its default type. A view or a field may pass options to
 * that type to show a value differently, or show the value as another type, as `instant.as(date)` shows only its day.
 *
 * Text is localised for the locales the caller names, falling back to the runtime default; instants follow the runtime
 * time zone. Nothing is read from the browser, so the same call works in a test, a server render or a page.
 *
 * @module types
 */

import { getShapeBranches, getStateBranch } from "@metreeca/blue/union";
import type { Shape } from "@metreeca/blue/value";
import { eager, type Lazy, opt, type Optional } from "@metreeca/core";
import { xsd } from "@metreeca/core/datatype";
import { immutable } from "@metreeca/core/values";
import { attempt } from "../_/core/index.js";
import { boolean } from "./boolean.js";
import { date } from "./date.js";
import { decimal } from "./decimal.js";
import { duration } from "./duration.js";
import { malformed, mismatched, inconvertible } from "./index.core.js";
import { instant } from "./instant.js";
import { integer } from "./integer.js";
import { reference } from "./reference.js";
import { string } from "./string.js";
import { text } from "./text.js";
import { time } from "./time.js";
import { year } from "./year.js";


/**
 * Common options.
 *
 * The options every type accepts, whatever the values it handles.
 */
export type Options = {

	/**
	 * The locales to localise text for, in order of preference; defaults to the runtime locale.
	 */
	readonly locales?: Intl.LocalesArgument

	/**
	 * Whether text read back stands for the upper bound of a range; defaults to `false`.
	 *
	 * A type editing values at a coarser grain than the store holds them reads an upper bound as the last value it
	 * spans, so the bound takes in all of it: `instant.as(date)` reads a day as its last instant, not its first.
	 */
	readonly upper?: boolean

}

/**
 * Value type.
 *
 * Shows a value kept in the form the store holds it, and moves it to and from the text a native input works on.
 *
 * Every call takes the common options together with the options specific to the type. A view or a field passes
 * the latter to show the same value differently, as `{ fractionDigits: 2 }` does for decimals.
 *
 * {@link Type.as} shows and edits the values of a type as another type does, so a view or a field expecting that type
 * can work on them: `instant.as(date)` shows and edits instants as the day they fall on. It works where the stored
 * values carry everything the other type shows: `instant.as(date)`, `instant.as(year)` and `date.as(year)`.
 *
 * @typeParam V The value as the store holds it
 * @typeParam O The options specific to this type, accepted by every call along with {@link Options}
 */
export type Type<V = unknown, O extends object = {}> = {

	/**
	 * The name of the type, for messages and for views choosing a control by type.
	 */
	readonly label: string

	/**
	 * Shows a value.
	 *
	 * @param value The value to be shown
	 * @param options The localisation options and the options specific to this type
	 *
	 * @returns The localised text a reader sees for `value`
	 *
	 * @throws {@link !TypeError TypeError} If `value` is not a value of this type
	 * @throws {@link !SyntaxError SyntaxError} If `value` is a string not well-formed for this type
	 * @throws {@link !RangeError RangeError} If an option specific to this type is out of range
	 */
	format(value: V, options?: Options & O): string

	/**
	 * Hands a value to a native input.
	 *
	 * @param value The value to be edited
	 * @param options The localisation options and the options specific to this type
	 *
	 * @returns The text a native input for this type takes as its `value`
	 *
	 * @throws {@link !TypeError TypeError} If `value` is not a value of this type
	 * @throws {@link !SyntaxError SyntaxError} If `value` is a string not well-formed for this type
	 */
	write(value: V, options?: Options & O): string

	/**
	 * Reads back what a native input yields.
	 *
	 * @param text The `value` of a native input for this type
	 * @param options The localisation options and the options specific to this type
	 *
	 * @returns The value `text` stands for, in the form the store holds it
	 *
	 * @throws {@link !SyntaxError SyntaxError} If `text` is not well-formed for this type
	 */
	parse(text: string, options?: Options & O): V


	/**
	 * Shows and edits values of this type as another type does.
	 *
	 * Values are still stored as this type holds them: only how they are shown and edited changes.
	 *
	 * A type shown as itself is returned as is. A converted type is converted again from the type it stores, so
	 * `instant.as(date).as(year)` returns `instant.as(year)`, and the same pair of types always returns the same type.
	 *
	 * A view or a field taking the returned type thus sees no change from one render to the next.
	 *
	 * @param type The type values are shown and edited as
	 *
	 * @returns A type labelled and configured as `type`, working on values stored as this type holds them
	 *
	 * @throws {@link !TypeError TypeError} If values of this type cannot be shown as `type`
	 */
	as(type: Type<V>): Type<V>

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Picks the default type for a shape.
 *
 * - **boolean** — {@link "types/boolean"!boolean boolean}
 * - **number** — {@link "types/integer"!integer integer} if integral, else {@link "types/decimal"!decimal decimal}
 * - **string** — {@link "types/year"!year year} for `xsd:gYear`, {@link "types/date"!date date} for `xsd:date`,
 *   {@link "types/time"!time time} for `xsd:time`, {@link "types/instant"!instant instant} for `xsd:dateTime`,
 *   {@link "types/duration"!duration duration} for `xsd:duration`, else {@link "types/string"!string string}
 * - **dictionary** — {@link "types/text"!text text}
 * - **reference** and **resource** — {@link "types/reference"!reference reference}
 * - **union** — a type showing each value with the default type of the branch it belongs to; input is read back by
 *   the first branch, in declaration order, that accepts it, so the most specific branches are best listed first
 *
 * @param shape The shape describing the values
 *
 * @returns The default type for the values `shape` describes
 */
export function toType(shape: Lazy<Shape>): Type {

	const $shape = eager(shape);

	if ( $shape.kind === "boolean" ) {

		return boolean;

	} else if ( $shape.kind === "number" ) {

		return $shape.integral ? integer : decimal;

	} else if ( $shape.kind === "string" ) {

		return $shape.datatype === xsd.gYear ? year
			: $shape.datatype === xsd.date ? date
				: $shape.datatype === xsd.time ? time
					: $shape.datatype === xsd.dateTime ? instant
						: $shape.datatype === xsd.duration ? duration
							: string;

	} else if ( $shape.kind === "dictionary" ) {

		return text;

	} else if ( $shape.kind === "reference" || $shape.kind === "resource" ) {

		return reference;

	} else {

		const branches = getShapeBranches($shape);
		const types = branches.map(branch => toType(branch));

		const route = (value: unknown) => opt(getStateBranch(value, branches), branch =>
			types[branches.indexOf(branch)]
		) ?? mismatched("union", value);

		const union: Type = immutable({

			label: "union",


			format(value, options) {

				return route(value).format(value, options);

			},

			write(value, options) {

				return route(value).write(value, options);

			},

			parse(text, options) {

				const parsed = types.reduce<Optional<{ readonly value: unknown }>>((parsed, type) =>
					parsed ?? attempt(() => ({ value: type.parse(text, options) })), undefined
				);

				return parsed === undefined ? malformed("union", text) : parsed.value;

			},


			as(type) {

				return type === union ? type : inconvertible("union", type);

			}

		});

		return union;

	}

}
