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
import { instant } from "./instant.js";
import { time } from "./time.js";
import { year } from "./year.js";


beforeAll(() => {
	vi.stubEnv("TZ", "Europe/Rome"); // UTC+1 in winter, UTC+2 in summer
});

afterAll(() => {
	vi.unstubAllEnvs();
});


describe("date", () => {

	describe("format()", () => {

		it("should localise dates", async () => {
			expect(date.format("2024-03-05", { locales: "en-US" })).toBe("3/5/2024");
			expect(date.format("2024-03-05", { locales: "it-IT" })).toBe("05/03/2024");
		});

		it("should show the configured style", async () => {
			expect(date.format("2024-03-05", { locales: "en-US", style: "long" })).toBe("March 5, 2024");
		});

		it("should show the day stated, whatever its offset", async () => {
			expect(date.format("2024-01-01+14:00", { locales: "en-US" })).toBe("1/1/2024");
			expect(date.format("2024-01-01-12:00", { locales: "en-US" })).toBe("1/1/2024");
		});

		it("should reject malformed dates", async () => {
			expect(() => date.format("2024-3-5")).toThrow(SyntaxError);
			expect(() => date.format("2024-02-30")).toThrow(SyntaxError);
		});

	});

	describe("write()", () => {

		it("should write the day stated", async () => {
			expect(date.write("2024-03-05+02:00")).toBe("2024-03-05");
		});

	});

	describe("parse()", () => {

		it("should read days", async () => {
			expect(date.parse("2024-03-05")).toBe("2024-03-05");
		});

		it("should read upper bounds as the day stated", async () => {
			expect(date.parse("2024-03-05", { upper: true })).toBe("2024-03-05");
		});

		it("should reject other text", async () => {
			expect(() => date.parse("")).toThrow(SyntaxError);
			expect(() => date.parse("2024-02-30")).toThrow(SyntaxError);
		});

	});

	describe("as()", () => {

		it("should show itself as itself", async () => {
			expect(date.as(date)).toBe(date);
		});

		describe("as years", () => {

			const years = date.as(year);

			it("should take the year label", async () => {
				expect(years.label).toBe("year");
			});

			it("should show the year a date falls in, whatever its offset", async () => {
				expect(years.format("2024-03-05", { locales: "en-US" })).toBe("2024");
				expect(years.format("2024-01-01+14:00", { locales: "en-US" })).toBe("2024");
			});

			it("should write the year a date falls in", async () => {
				expect(years.write("2024-03-05")).toBe("2024");
			});

			it("should read years as their first day, or their last as upper bounds", async () => {
				expect(years.parse("2024")).toBe("2024-01-01");
				expect(years.parse("2024", { upper: true })).toBe("2024-12-31");
			});

			it("should reject malformed values", async () => {
				expect(() => years.format("2024")).toThrow(SyntaxError);
				expect(() => years.parse("24")).toThrow(SyntaxError);
			});

			it("should be the same type whenever asked for", async () => {
				expect(date.as(year)).toBe(years);
			});

			it("should show values as dates do", async () => {
				expect(years.as(date)).toBe(date);
				expect(() => years.as(time)).toThrow(TypeError);
			});

		});

		it("should reject other types", async () => {
			expect(() => date.as(time)).toThrow(TypeError);
			expect(() => date.as(instant)).toThrow(TypeError);
		});

	});

});
