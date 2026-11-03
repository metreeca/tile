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

import { text } from "./text.js";


describe("text", () => {

	const arts = { en: "Fine Arts", it: "Belle Arti", de: "Bildende Kunst" };

	describe("format()", () => {

		it("should pick the text for the reader locale", async () => {
			expect(text.format(arts, { locales: "it-IT" })).toBe("Belle Arti");
		});

		it("should honour locale preferences in order", async () => {
			expect(text.format(arts, { locales: ["fr-FR", "de-DE", "it-IT"] })).toBe("Bildende Kunst");
		});

		it("should fall back to the English text", async () => {
			expect(text.format(arts, { locales: "fr-FR" })).toBe("Fine Arts");
		});

		it("should fall back to the first text", async () => {
			expect(text.format({ it: "Belle Arti", de: "Bildende Kunst" }, { locales: "fr-FR" })).toBe("Belle Arti");
		});

		it("should list multiple texts", async () => {
			expect(text.format({ en: ["Arts", "Crafts"] }, { locales: "en-US" })).toBe("Arts, Crafts");
		});

		it("should show empty dictionaries as empty", async () => {
			expect(text.format({}, { locales: "en-US" })).toBe("");
		});

		it("should reject other values", async () => {
			// @ts-expect-error checking runtime rejection of an untyped value
			expect(() => text.format("Fine Arts")).toThrow(TypeError);
		});

	});

	describe("write()", () => {

		it("should write the text shown", async () => {
			expect(text.write(arts, { locales: "it-IT" })).toBe("Belle Arti");
		});

	});

	describe("parse()", () => {

		it("should read text in the language of the first reader locale", async () => {
			expect(text.parse("Belle Arti", { locales: ["it-IT", "en-US"] })).toEqual({ it: "Belle Arti" });
		});

	});

});
