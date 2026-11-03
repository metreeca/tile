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

import { reference } from "./reference.js";


describe("reference", () => {

	const iri = "https://example.com/terms#FineArts";

	describe("format()", () => {

		it("should derive a label from the identifier", async () => {
			expect(reference.format(iri)).toBe("Fine Arts");
		});

		it("should show resources by their label", async () => {
			expect(reference.format({ id: iri, label: "Arts" })).toBe("Arts");
			expect(reference.format({ id: iri, label: { it: "Belle Arti" } }, { locales: "it-IT" })).toBe("Belle Arti");
		});

		it("should derive a label from the identifier of unlabelled resources", async () => {
			expect(reference.format({ id: iri })).toBe("Fine Arts");
		});

		it("should show unlabelled anonymous resources as empty", async () => {
			expect(reference.format({})).toBe("");
		});

		it("should reject other values", async () => {
			// @ts-expect-error checking runtime rejection of an untyped value
			expect(() => reference.format(1)).toThrow(TypeError);
		});

	});

	describe("write()", () => {

		it("should write the identifier", async () => {
			expect(reference.write(iri)).toBe(iri);
			expect(reference.write({ id: iri, label: "Arts" })).toBe(iri);
		});

		it("should reject anonymous resources", async () => {
			expect(() => reference.write({ label: "Arts" })).toThrow(TypeError);
		});

	});

	describe("parse()", () => {

		it("should read identifiers", async () => {
			expect(reference.parse(iri)).toBe(iri);
		});

		it("should reject other text", async () => {
			expect(() => reference.parse("")).toThrow(SyntaxError);
			expect(() => reference.parse("not an identifier")).toThrow(SyntaxError);
		});

	});

});
