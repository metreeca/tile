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

import { decodeDuration, encodeDuration } from "./temporal.js";


describe("decodeDuration()", () => {

	it("should take every unit apart", async () => {
		expect(decodeDuration("P1Y2M3DT4H5M6S")).toEqual({
			years: 1, months: 2, days: 3, hours: 4, minutes: 5, seconds: 6
		});
	});

	it("should hold only the units stated", async () => {
		expect(decodeDuration("P2D")).toEqual({ days: 2 });
		expect(decodeDuration("PT30M")).toEqual({ minutes: 30 });
	});

	it("should keep components unnormalised", async () => {
		expect(decodeDuration("PT90M")).toEqual({ minutes: 90 });
	});

	it("should accept whole and fractional seconds", async () => {
		expect(decodeDuration("PT5S")).toEqual({ seconds: 5 });
		expect(decodeDuration("PT1.5S")).toEqual({ seconds: 1.5 });
	});

	it("should mark negative durations", async () => {
		expect(decodeDuration("-P1D")).toEqual({ negative: true, days: 1 });
	});

	it("should reject malformed values", async () => {
		expect(() => decodeDuration("")).toThrow(SyntaxError);
		expect(() => decodeDuration("P")).toThrow(SyntaxError);
		expect(() => decodeDuration("PT")).toThrow(SyntaxError);
		expect(() => decodeDuration("P1H")).toThrow(SyntaxError);
		expect(() => decodeDuration("1D")).toThrow(SyntaxError);
		expect(() => decodeDuration("P1.5D")).toThrow(SyntaxError);
	});

});

describe("encodeDuration()", () => {

	it("should put every unit together", async () => {
		expect(encodeDuration({
			years: 1, months: 2, days: 3, hours: 4, minutes: 5, seconds: 6
		})).toBe("P1Y2M3DT4H5M6S");
	});

	it("should state only the units spanned", async () => {
		expect(encodeDuration({ days: 2 })).toBe("P2D");
		expect(encodeDuration({ minutes: 30 })).toBe("PT30M");
		expect(encodeDuration({ days: 0, hours: 1 })).toBe("PT1H");
	});

	it("should yield a zero duration for no units", async () => {
		expect(encodeDuration({})).toBe("PT0S");
		expect(encodeDuration({ negative: true })).toBe("PT0S");
	});

	it("should keep fractional seconds", async () => {
		expect(encodeDuration({ seconds: 1.5 })).toBe("PT1.5S");
	});

	it("should mark negative durations", async () => {
		expect(encodeDuration({ negative: true, days: 1 })).toBe("-P1D");
	});

	it("should round-trip decoded durations", async () => {

		const values = ["P1Y2M3DT4H5M6S", "-PT1.5S", "PT90M", "P2D"];

		expect(values.map(value => encodeDuration(decodeDuration(value)))).toEqual(values);

	});

	it("should reject illegal components", async () => {
		expect(() => encodeDuration({ days: -1 })).toThrow(RangeError);
		expect(() => encodeDuration({ days: 1.5 })).toThrow(RangeError);
		expect(() => encodeDuration({ seconds: Infinity })).toThrow(RangeError);
		expect(() => encodeDuration({ hours: NaN })).toThrow(RangeError);
	});

});
