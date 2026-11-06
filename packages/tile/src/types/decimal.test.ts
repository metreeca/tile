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

import { describe, expect, it } from "vitest";

import { decimal } from "./decimal.js";
import { integer } from "./integer.js";


describe("decimal", () => {

	describe("format()", () => {

		it("should localise decimals", async () => {
			expect(decimal.format(12345.6, { locales: "en-US" })).toBe("12,345.6");
			expect(decimal.format(12345.6, { locales: "it-IT" })).toBe("12.345,6");
		});

		it("should show up to three fractional digits by default", async () => {
			expect(decimal.format(1.23456, { locales: "en-US" })).toBe("1.235");
		});

		it("should show the configured fractional digits", async () => {
			expect(decimal.format(1.5, { locales: "en-US", fractionDigits: 2 })).toBe("1.50");
			expect(decimal.format(1.239, { locales: "en-US", fractionDigits: 2 })).toBe("1.24");
		});

		it("should abbreviate large numbers when configured", async () => {
			expect(decimal.format(12345.6, { locales: "en-US", compact: true })).toBe("12K");
		});

		it("should reject illegal fractional digits", async () => {
			expect(() => decimal.format(1, { fractionDigits: -1 })).toThrow(RangeError);
			expect(() => decimal.format(1, { fractionDigits: 1.5 })).toThrow(RangeError);
		});

		it("should reject other values", async () => {
			// @ts-expect-error checking runtime rejection of an untyped value
			expect(() => decimal.format("1")).toThrow(TypeError);
			expect(() => decimal.format(Infinity)).toThrow(TypeError);
		});

	});

	describe("write()", () => {

		it("should write every digit, whatever the presentation", async () => {
			expect(decimal.write(1.23456)).toBe("1.23456");
			expect(decimal.write(1.5, { fractionDigits: 0 })).toBe("1.5");
		});

	});

	describe("parse()", () => {

		it("should read decimals", async () => {
			expect(decimal.parse("1.5")).toBe(1.5);
			expect(decimal.parse("-2")).toBe(-2);
		});

		it("should reject other text", async () => {
			expect(() => decimal.parse("")).toThrow(SyntaxError);
			expect(() => decimal.parse("1,5")).toThrow(SyntaxError);
			expect(() => decimal.parse("x")).toThrow(SyntaxError);
		});

	});

	describe("as()", () => {

		it("should show itself as itself", async () => {
			expect(decimal.as(decimal)).toBe(decimal);
		});

		it("should reject other types", async () => {
			expect(() => decimal.as(integer)).toThrow(TypeError);
		});

	});

});
