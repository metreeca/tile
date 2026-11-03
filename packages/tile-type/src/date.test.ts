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
			expect(date({ style: "long" }).format("2024-03-05", { locales: "en-US" })).toBe("March 5, 2024");
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

		it("should reject other text", async () => {
			expect(() => date.parse("")).toThrow(SyntaxError);
			expect(() => date.parse("2024-02-30")).toThrow(SyntaxError);
		});

	});

	describe("stored as instants", () => {

		const day = date({ instant: true });

		it("should show the local day an instant falls on", async () => {
			expect(day.format("2024-03-05T23:30:00Z", { locales: "en-US" })).toBe("3/6/2024");
		});

		it("should write the local day an instant falls on", async () => {
			expect(day.write("2024-03-05T23:30:00Z")).toBe("2024-03-06");
		});

		it("should read days as the instant of their local midnight", async () => {
			expect(day.parse("2024-03-06")).toBe("2024-03-05T23:00:00.000Z");
		});

		it("should reject malformed instants", async () => {
			expect(() => day.format("2024-03-05")).toThrow(SyntaxError);
		});

	});

});
