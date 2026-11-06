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

import { boolean } from "./boolean.js";


describe("boolean", () => {

	describe("format()", () => {

		it("should show truth values", async () => {
			expect(boolean.format(true)).toBe("true");
			expect(boolean.format(false)).toBe("false");
		});

		it("should reject other values", async () => {
			// @ts-expect-error checking runtime rejection of an untyped value
			expect(() => boolean.format("true")).toThrow(TypeError);
		});

	});

	describe("write()", () => {

		it("should write truth values", async () => {
			expect(boolean.write(true)).toBe("true");
			expect(boolean.write(false)).toBe("false");
		});

	});

	describe("parse()", () => {

		it("should read truth values", async () => {
			expect(boolean.parse("true")).toBe(true);
			expect(boolean.parse("false")).toBe(false);
		});

		it("should reject other text", async () => {
			expect(() => boolean.parse("")).toThrow(SyntaxError);
			expect(() => boolean.parse("yes")).toThrow(SyntaxError);
		});

	});

	describe("as()", () => {

		it("should show itself as itself", async () => {
			expect(boolean.as(boolean)).toBe(boolean);
		});

	});

});
