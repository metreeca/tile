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
import { instant, instantDate } from "./instant.js";
import { time } from "./time.js";
import { year } from "./year.js";


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
			expect(instant.format("2024-03-05T12:30:00Z", {
				locales: "it-IT",
				timeStyle: "medium"
			})).toBe("05/03/2024, 13:30:00");
		});

		it("should show the configured styles", async () => {
			expect(instant.format("2024-03-05T12:30:00Z", {
				locales: "it-IT",
				dateStyle: "short",
				timeStyle: "medium"
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

	describe("as()", () => {

		it("should show itself as itself", async () => {
			expect(instant.as(instant)).toBe(instant);
		});

		describe("as dates", () => {

			const days = instant.as(date);

			it("should take the date label", async () => {
				expect(days.label).toBe("date");
			});

			it("should show the local day an instant falls on", async () => {
				expect(days.format("2024-03-05T23:30:00Z", { locales: "en-US" })).toBe("3/6/2024");
				expect(instantDate.format("2024-03-05T23:30:00Z", { locales: "en-US", style: "long" })).toBe("March 6, 2024");
			});

			it("should write the local day an instant falls on", async () => {
				expect(days.write("2024-03-05T23:30:00Z")).toBe("2024-03-06");
			});

			it("should read days as the instant of their local midnight", async () => {
				expect(days.parse("2024-03-06")).toBe("2024-03-05T23:00:00.000Z");
			});

			it("should read upper bounds as the last instant of their local day", async () => {
				expect(days.parse("2024-03-06", { upper: true })).toBe("2024-03-06T22:59:59.999Z");
				expect(days.parse("2024-03-30", { upper: true })).toBe("2024-03-30T22:59:59.999Z"); // before the DST switch
				expect(days.parse("2024-03-31", { upper: true })).toBe("2024-03-31T21:59:59.999Z"); // on the DST switch
			});

			it("should reject malformed instants", async () => {
				expect(() => days.format("2024-03-05")).toThrow(SyntaxError);
				expect(() => days.write("2024-03-05")).toThrow(SyntaxError);
			});

			it("should reject malformed days", async () => {
				expect(() => days.parse("2024-02-30")).toThrow(SyntaxError);
			});

		});

		describe("as years", () => {

			const years = instant.as(year);

			it("should take the year label", async () => {
				expect(years.label).toBe("year");
			});

			it("should show the local year an instant falls in", async () => {
				expect(years.format("2023-12-31T23:30:00Z", { locales: "en-US" })).toBe("2024");
			});

			it("should write the local year an instant falls in", async () => {
				expect(years.write("2023-12-31T23:30:00Z")).toBe("2024");
			});

			it("should read years as their first local instant, or their last as upper bounds", async () => {
				expect(years.parse("2024")).toBe("2023-12-31T23:00:00.000Z");
				expect(years.parse("2024", { upper: true })).toBe("2024-12-31T22:59:59.999Z");
			});

			it("should reject malformed values", async () => {
				expect(() => years.format("2024-03-05")).toThrow(SyntaxError);
				expect(() => years.parse("24")).toThrow(SyntaxError);
			});

		});

		it("should yield the same type whenever shown as the same type", async () => {
			expect(instant.as(date)).toBe(instant.as(date));
			expect(instant.as(year).as(date)).toBe(instant.as(date));
		});

		it("should show values as instants do", async () => {
			expect(instant.as(date).as(instant)).toBe(instant);
			expect(instant.as(date).as(year).write("2023-12-31T23:30:00Z")).toBe("2024");
			expect(instant.as(year).as(date).write("2023-12-31T23:30:00Z")).toBe("2024-01-01");
			expect(() => instant.as(date).as(time)).toThrow(TypeError);
		});

		it("should reject other types", async () => {
			expect(() => instant.as(time)).toThrow(TypeError);
		});

	});

});
