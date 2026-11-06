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

import { duration } from "./duration.js";
import { string } from "./string.js";


describe("duration", () => {

	describe("format()", () => {

		it("should list the units spanned", async () => {
			expect(duration.format("PT1H30M", { locales: "en-US" })).toBe("1 hour, 30 minutes");
			expect(duration.format("PT2H5M", { locales: "it-IT" })).toBe("2 ore e 5 minuti");
			expect(duration.format("P1Y2M3D", { locales: "en-US" })).toBe("1 year, 2 months, 3 days");
		});

		it("should show zero durations", async () => {
			expect(duration.format("PT0S", { locales: "en-US" })).toBe("0 seconds");
		});

		it("should sign negative durations once", async () => {
			expect(duration.format("-PT1H30M", { locales: "en-US" })).toBe("-1 hour, 30 minutes");
		});

		it("should reject malformed durations", async () => {
			expect(() => duration.format("P1H")).toThrow(SyntaxError);
		});

	});

	describe("write()", () => {

		it("should write the lexical form", async () => {
			expect(duration.write("PT1H30M")).toBe("PT1H30M");
		});

	});

	describe("parse()", () => {

		it("should read the lexical form", async () => {
			expect(duration.parse("PT1H30M")).toBe("PT1H30M");
		});

		it("should reject other text", async () => {
			expect(() => duration.parse("")).toThrow(SyntaxError);
			expect(() => duration.parse("P1H")).toThrow(SyntaxError);
		});

	});

	describe("as()", () => {

		it("should show itself as itself", async () => {
			expect(duration.as(duration)).toBe(duration);
		});

		it("should reject other types", async () => {
			expect(() => duration.as(string)).toThrow(TypeError);
		});

	});

});
