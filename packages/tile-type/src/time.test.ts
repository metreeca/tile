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

import { instant } from "./instant.js";
import { time } from "./time.js";


describe("time", () => {

	describe("format()", () => {

		it("should localise times", async () => {
			expect(time.format("14:30:00", { locales: "en-US" })).toMatch(/^2:30\sPM$/);
			expect(time.format("14:30:00", { locales: "it-IT" })).toBe("14:30");
		});

		it("should show the configured style", async () => {
			expect(time.format("14:30:15", { locales: "it-IT", style: "medium" })).toBe("14:30:15");
		});

		it("should show the time stated, whatever its offset", async () => {
			expect(time.format("14:30:00+05:00", { locales: "it-IT" })).toBe("14:30");
		});

		it("should reject malformed times", async () => {
			expect(() => time.format("14:30")).toThrow(SyntaxError);
		});

	});

	describe("write()", () => {

		it("should write the time stated", async () => {
			expect(time.write("14:30:00+05:00")).toBe("14:30:00");
			expect(time.write("14:30:15.5")).toBe("14:30:15.5");
		});

	});

	describe("parse()", () => {

		it("should read times", async () => {
			expect(time.parse("14:30:15")).toBe("14:30:15");
		});

		it("should store times stated to the minute with zero seconds", async () => {
			expect(time.parse("14:30")).toBe("14:30:00");
		});

		it("should reject other text", async () => {
			expect(() => time.parse("")).toThrow(SyntaxError);
			expect(() => time.parse("25:00")).toThrow(SyntaxError);
		});

	});

	describe("as()", () => {

		it("should show itself as itself", async () => {
			expect(time.as(time)).toBe(time);
		});

		it("should reject other types", async () => {
			expect(() => time.as(instant)).toThrow(TypeError);
		});

	});

});
