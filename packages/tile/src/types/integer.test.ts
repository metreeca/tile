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


describe("integer", () => {

	describe("format()", () => {

		it("should localise integers", async () => {
			expect(integer.format(12345, { locales: "en-US" })).toBe("12,345");
			expect(integer.format(12345, { locales: "it-IT" })).toBe("12.345");
		});

		it("should round fractional values", async () => {
			expect(integer.format(1234.6, { locales: "en-US" })).toBe("1,235");
		});

		it("should abbreviate large numbers when configured", async () => {
			expect(integer.format(12345, { locales: "en-US", compact: true })).toBe("12K");
			expect(integer.format(1234567, { locales: "en-US", compact: true })).toBe("1.2M");
		});

		it("should reject other values", async () => {
			// @ts-expect-error checking runtime rejection of an untyped value
			expect(() => integer.format("1")).toThrow(TypeError);
			expect(() => integer.format(NaN)).toThrow(TypeError);
		});

	});

	describe("write()", () => {

		it("should write plain digits", async () => {
			expect(integer.write(12345)).toBe("12345");
			expect(integer.write(12345, { compact: true })).toBe("12345");
		});

	});

	describe("parse()", () => {

		it("should read integers", async () => {
			expect(integer.parse("42")).toBe(42);
			expect(integer.parse("-42")).toBe(-42);
		});

		it("should reject fractional and other text", async () => {
			expect(() => integer.parse("4.2")).toThrow(SyntaxError);
			expect(() => integer.parse("")).toThrow(SyntaxError);
			expect(() => integer.parse("x")).toThrow(SyntaxError);
		});

	});

	describe("as()", () => {

		it("should show itself as itself", async () => {
			expect(integer.as(integer)).toBe(integer);
		});

		it("should reject other types", async () => {
			expect(() => integer.as(decimal)).toThrow(TypeError);
		});

	});

});
