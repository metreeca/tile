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

import { instant } from "./instant.js";


beforeAll(() => {
	vi.stubEnv("TZ", "Europe/Rome"); // UTC+1 in winter, UTC+2 in summer
});

afterAll(() => {
	vi.unstubAllEnvs();
});


describe("instant", () => {

	describe("format()", () => {

		it("should localise instants in the runtime time zone", async () => {
			expect(instant.format("2024-03-05T12:30:00Z", { locales: "it-IT" })).toBe("05/03/2024, 13:30");
		});

		it("should show numeric dates with the configured time style", async () => {
			expect(instant({ timeStyle: "medium" }).format("2024-03-05T12:30:00Z", {
				locales: "it-IT"
			})).toBe("05/03/2024, 13:30:00");
		});

		it("should show the configured styles", async () => {
			expect(instant({ dateStyle: "short", timeStyle: "medium" }).format("2024-03-05T12:30:00Z", {
				locales: "it-IT"
			})).toBe("05/03/24, 13:30:00");
		});

		it("should honour stated offsets", async () => {
			expect(instant.format("2024-03-05T12:30:00+05:00", { locales: "it-IT" })).toBe("05/03/2024, 08:30");
		});

		it("should reject malformed instants", async () => {
			expect(() => instant.format("2024-03-05")).toThrow(SyntaxError);
		});

	});

	describe("write()", () => {

		it("should write UTC instants as local wall-clock times", async () => {
			expect(instant.write("2024-01-15T12:30:00Z")).toBe("2024-01-15T13:30:00");
			expect(instant.write("2024-07-15T12:30:00Z")).toBe("2024-07-15T14:30:00");
		});

		it("should honour stated offsets", async () => {
			expect(instant.write("2024-01-15T12:30:00+05:00")).toBe("2024-01-15T08:30:00");
		});

		it("should take instants without an offset as UTC", async () => {
			expect(instant.write("2024-01-15T12:30:00")).toBe("2024-01-15T13:30:00");
		});

		it("should cross day boundaries", async () => {
			expect(instant.write("2024-01-15T23:30:00Z")).toBe("2024-01-16T00:30:00");
		});

		it("should write milliseconds only for fractional seconds", async () => {
			expect(instant.write("2024-01-15T12:30:00.250Z")).toBe("2024-01-15T13:30:00.250");
		});

		it("should reject malformed instants", async () => {
			expect(() => instant.write("")).toThrow(SyntaxError);
			expect(() => instant.write("2024-13-15T12:30:00Z")).toThrow(SyntaxError);
		});

	});

	describe("parse()", () => {

		it("should pin local wall-clock times to UTC", async () => {
			expect(instant.parse("2024-01-15T13:30")).toBe("2024-01-15T12:30:00.000Z");
			expect(instant.parse("2024-07-15T14:30")).toBe("2024-07-15T12:30:00.000Z");
		});

		it("should accept seconds and fractional seconds", async () => {
			expect(instant.parse("2024-01-15T13:30:15")).toBe("2024-01-15T12:30:15.000Z");
			expect(instant.parse("2024-01-15T13:30:15.250")).toBe("2024-01-15T12:30:15.250Z");
		});

		it("should cross day boundaries", async () => {
			expect(instant.parse("2024-01-16T00:30")).toBe("2024-01-15T23:30:00.000Z");
		});

		it("should round-trip written instants", async () => {
			expect(instant.write(instant.parse("2024-07-15T14:30:15"))).toBe("2024-07-15T14:30:15");
		});

		it("should reject other text", async () => {
			expect(() => instant.parse("")).toThrow(SyntaxError);
			expect(() => instant.parse("2024-01-15")).toThrow(SyntaxError);
			expect(() => instant.parse("2024-01-15T13:30Z")).toThrow(SyntaxError);
			expect(() => instant.parse("2024-01-15T25:30")).toThrow(SyntaxError);
		});

	});

});
