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

import { string } from "./string.js";


describe("string", () => {

	it("should show strings as stored", async () => {
		expect(string.format("x@example.com")).toBe("x@example.com");
	});

	it("should write and read strings as stored", async () => {
		expect(string.write(" text ")).toBe(" text ");
		expect(string.parse(" text ")).toBe(" text ");
	});

	it("should reject other values", async () => {
		// @ts-expect-error checking runtime rejection of an untyped value
		expect(() => string.format(1)).toThrow(TypeError);
	});

});
