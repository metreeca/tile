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

import * as blue from "@metreeca/blue/boolean";
import { dictionary } from "@metreeca/blue/dictionary";
import * as numbers from "@metreeca/blue/number";
import { reference as link } from "@metreeca/blue/reference";
import { id, optional, resource } from "@metreeca/blue/resource";
import * as strings from "@metreeca/blue/string";
import { union } from "@metreeca/blue/union";
import { describe, expect, it } from "vitest";

import { boolean } from "./boolean.js";
import { date } from "./date.js";
import { decimal } from "./decimal.js";
import { duration } from "./duration.js";
import { toType } from "./index.js";
import { instant } from "./instant.js";
import { integer } from "./integer.js";
import { reference } from "./reference.js";
import { string } from "./string.js";
import { text } from "./text.js";
import { time } from "./time.js";
import { year } from "./year.js";


describe("toType()", () => {

	it("should pick scalar types", async () => {
		expect(toType(blue.boolean())).toBe(boolean);
		expect(toType(numbers.integer())).toBe(integer);
		expect(toType(numbers.int())).toBe(integer);
		expect(toType(numbers.decimal())).toBe(decimal);
		expect(toType(numbers.double())).toBe(decimal);
	});

	it("should pick string types by datatype", async () => {
		expect(toType(strings.string())).toBe(string);
		expect(toType(strings.text())).toBe(string);
		expect(toType(strings.email())).toBe(string);
		expect(toType(strings.year())).toBe(year);
		expect(toType(strings.date())).toBe(date);
		expect(toType(strings.time())).toBe(time);
		expect(toType(strings.instant())).toBe(instant);
		expect(toType(strings.timestamp())).toBe(instant);
		expect(toType(strings.duration())).toBe(duration);
	});

	it("should pick structured types", async () => {

		const Term = resource({ id: id(), label: optional(dictionary()) });

		expect(toType(dictionary())).toBe(text);
		expect(toType(link(Term))).toBe(reference);
		expect(toType(Term)).toBe(reference);

	});

	it("should resolve deferred shapes", async () => {
		expect(toType(() => numbers.integer())).toBe(integer);
	});

	describe("union", () => {

		const mixed = toType(union(numbers.integer(), strings.date()));

		it("should show values through their branch", async () => {
			expect(mixed.format(1234, { locales: "en-US" })).toBe("1,234");
			expect(mixed.format("2024-03-05", { locales: "en-US" })).toBe("Mar 5, 2024");
		});

		it("should write values through their branch", async () => {
			expect(mixed.write(1234)).toBe("1234");
			expect(mixed.write("2024-03-05+02:00")).toBe("2024-03-05");
		});

		it("should read text as the first branch accepting it", async () => {
			expect(mixed.parse("42")).toBe(42);
			expect(mixed.parse("2024-03-05")).toBe("2024-03-05");
		});

		it("should reject values belonging to no branch", async () => {
			expect(() => mixed.format(true)).toThrow(TypeError);
		});

		it("should reject text no branch accepts", async () => {
			expect(() => mixed.parse("x")).toThrow(SyntaxError);
		});

	});

});
