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
 * Shape-driven value types.
 *
 * Defines the contract every value type honours: showing a stored value to a reader, handing it to a native input and
 * reading back what the input yields. Values are always kept in the form the store holds them, so a type never
 * restates the data model: the shape describing a value picks its default type, and a view or a field may choose
 * another one to show the same value differently, as a date shows only the day an instant falls on.
 *
 * Text is localised for the locales the caller names, falling back to the runtime default; temporal values follow the
 * runtime time zone. Nothing is read from the browser, so the same call works in a test, a server render or a page.
 *
 * @module index
 */

import { eager, type Lazy, opt, type Optional } from "@metreeca/core";
import { xsd } from "@metreeca/core/datatype";
import { immutable } from "@metreeca/core/values";
import type { StringShape } from "@metreeca/blue/string";
import { getShapeBranches, getStateBranch, type UnionShape } from "@metreeca/blue/union";
import type { Shape } from "@metreeca/blue/value";
import { boolean } from "./boolean.js";
import { date } from "./date.js";
import { decimal } from "./decimal.js";
import { duration } from "./duration.js";
import { malformed, mismatched } from "./index.core.js";
import { instant } from "./instant.js";
import { integer } from "./integer.js";
import { reference } from "./reference.js";
import { string } from "./string.js";
import { text } from "./text.js";
import { time } from "./time.js";
import { year } from "./year.js";


/**
 * Reader context.
 */
export type Options = {

	/**
	 * The locales to localise text for, in order of preference; defaults to the runtime locale.
	 */
	readonly locales?: Intl.LocalesArgument

}

/**
 * Value type.
 *
 * Shows a value kept in the form the store holds it, and moves it to and from the text a native input works on.
 *
 * @typeParam V The value as the store holds it
 */
export interface Type<V = unknown> {

	/**
	 * The name of the type, for messages and for views choosing a control by type.
	 */
	readonly label: string

	/**
	 * Shows a value.
	 *
	 * @param value The value to be shown
	 * @param options The reader context
	 *
	 * @returns The localised text a reader sees for `value`
	 *
	 * @throws {@link !TypeError TypeError} If `value` is not a value of this type
	 * @throws {@link !SyntaxError SyntaxError} If `value` is a string not well-formed for this type
	 */
	format(value: V, options?: Options): string

	/**
	 * Hands a value to a native input.
	 *
	 * @param value The value to be edited
	 * @param options The reader context
	 *
	 * @returns The text a native input for this type takes as its `value`
	 *
	 * @throws {@link !TypeError TypeError} If `value` is not a value of this type
	 * @throws {@link !SyntaxError SyntaxError} If `value` is a string not well-formed for this type
	 */
	write(value: V, options?: Options): string

	/**
	 * Reads back what a native input yields.
	 *
	 * @param text The `value` of a native input for this type
	 * @param options The reader context
	 *
	 * @returns The value `text` stands for, in the form the store holds it
	 *
	 * @throws {@link !SyntaxError SyntaxError} If `text` is not well-formed for this type
	 */
	parse(text: string, options?: Options): V

}

/**
 * Configurable value type.
 *
 * A type used as is with its default presentation, or called with a configuration to obtain a variant presenting the
 * same values differently, as `decimal({ fractionDigits: 2 })` shows every decimal with two fractional digits.
 *
 * @typeParam C The configuration accepted
 * @typeParam V The value as the store holds it
 */
export type Configurable<C, V> = Type<V> & ((config: C) => Type<V>)


/**
 * Picks the default type for a shape.
 *
 * - **boolean** — {@link "boolean"!boolean boolean}
 * - **number** — {@link "integer"!integer integer} for integral shapes, else {@link "decimal"!decimal decimal}
 * - **string** — by datatype: {@link "year"!year year} for `xsd:gYear`, {@link "date"!date date} for `xsd:date`,
 *   {@link "time"!time time} for `xsd:time`, {@link "instant"!instant instant} for `xsd:dateTime`,
 *   {@link "duration"!duration duration} for `xsd:duration`, else {@link "string"!string string}
 * - **dictionary** — {@link "text"!text text}
 * - **reference** and **resource** — {@link "reference"!reference reference}
 * - **union** — a type routing each value to the default type of the single branch it belongs to, and reading input
 *   back as the first branch, in declaration order, that accepts it, so branches are best listed most specific first
 *
 * @param shape The shape describing the values
 *
 * @returns The type values described by `shape` are shown and edited with unless a view chooses another one
 */
export function toType(shape: Lazy<Shape>): Type {

	const $shape = eager(shape);

	return $shape.kind === "boolean" ? boolean
		: $shape.kind === "number" ? $shape.integral ? integer : decimal
			: $shape.kind === "string" ? toStringType($shape)
				: $shape.kind === "dictionary" ? text
					: $shape.kind === "reference" || $shape.kind === "resource" ? reference
						: toUnionType($shape);

}


function toStringType({ datatype }: StringShape): Type {
	return datatype === xsd.gYear ? year
		: datatype === xsd.date ? date
			: datatype === xsd.time ? time
				: datatype === xsd.dateTime ? instant
					: datatype === xsd.duration ? duration
						: string;
}

function toUnionType(shape: UnionShape): Type {

	const branches = getShapeBranches(shape);
	const types = branches.map(branch => toType(branch));

	const route = (value: unknown) => opt(getStateBranch(value, branches), toType) ?? mismatched("union", value);

	return immutable({

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

		}

	});

}

/**
 * Runs a computation, standing for its outcome with `undefined` where it fails.
 */
function attempt<T>(computation: () => T): Optional<T> {
	try {
		return computation();
	} catch {
		return undefined;
	}
}
