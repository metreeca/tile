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

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { date } from "./date.js";
import { duration } from "./duration.js";
import { instant } from "./instant.js";
import { time } from "./time.js";
import { year } from "./year.js";


beforeAll(() => {
	vi.stubEnv("TZ", "Europe/Rome"); // UTC+1 in winter, UTC+2 in summer
});

afterAll(() => {
	vi.unstubAllEnvs();
});


describe("year", () => {

	describe("format()", () => {

		it("should show the year stated, whatever its offset", async () => {
			expect(year.format("2024", { locales: "en-US" })).toBe("2024");
			expect(year.format("2024-14:00", { locales: "en-US" })).toBe("2024");
			expect(year.format("2024+14:00", { locales: "en-US" })).toBe("2024");
		});

		it("should reject malformed years", async () => {
			expect(() => year.format("24")).toThrow(SyntaxError);
		});

	});

	describe("write()", () => {

		it("should write the four digits", async () => {
			expect(year.write("2024-14:00")).toBe("2024");
		});

	});

	describe("parse()", () => {

		it("should read years", async () => {
			expect(year.parse("2024")).toBe("2024");
		});

		it("should reject other text", async () => {
			expect(() => year.parse("24")).toThrow(SyntaxError);
			expect(() => year.parse("")).toThrow(SyntaxError);
		});

	});

	describe("as()", () => {

		it("should show itself as itself", async () => {
			expect(year.as(year)).toBe(year);
		});

		it("should reject other types", async () => {
			expect(() => year.as(date)).toThrow(TypeError);
			expect(() => year.as(instant)).toThrow(TypeError);
			expect(() => year.as(time)).toThrow(TypeError);
			expect(() => year.as(duration)).toThrow(TypeError);
		});

	});

});
