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

import { classes, keys } from "./index.js";


describe("classes", () => {

	it("names the classes in force", () => {

		expect(classes({ stack: true, wide: true })).toBe("stack wide");

	});

	it("leaves out the classes not in force", () => {

		expect(classes({ stack: true, wide: false, side: undefined })).toBe("stack");

	});

	it("names nothing when no class is in force", () => {

		expect(classes({ stack: false, wide: undefined })).toBeUndefined();

	});

	it("names nothing when no class is given", () => {

		expect(classes({})).toBeUndefined();

	});

});

describe("keys", () => {

	function event(key: string): KeyboardEvent & { readonly prevented: () => boolean } {

		let prevented = false; // ;(mock) a keyboard event is a DOM value the test environment doesn't supply

		return {
			key,
			preventDefault: () => { prevented = true; },
			prevented: () => prevented
		} as unknown as KeyboardEvent & { readonly prevented: () => boolean };

	}


	it("takes the key it is given a handler for", () => {

		const taken: string[] = [];

		keys({ Enter: () => { taken.push("Enter"); } })(event("Enter"));

		expect(taken).toEqual([ "Enter" ]);

	});

	it("leaves alone the keys it has no handler for", () => {

		const taken: string[] = [];
		const key = event("Escape");

		keys({ Enter: () => { taken.push("Enter"); } })(key);

		expect(taken).toEqual([]);
		expect(key.prevented()).toBe(false);

	});

	it("claims a key it takes", () => {

		const key = event("Enter");

		keys({ Enter: () => {} })(key);

		expect(key.prevented()).toBe(true);

	});

	it("claims a key whatever the handler produces", () => {

		const key = event("Enter");

		keys({ Enter: () => false })(key);

		expect(key.prevented()).toBe(true);

	});

});
