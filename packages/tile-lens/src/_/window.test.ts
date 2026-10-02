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

import { immutable } from "@metreeca/core/values";
import { describe, expect, it } from "vitest";

import { tally, createWindow } from "./window.js";


const model = { members: { label: {}, "^label": "asc" } };


describe("Window()", () => {

	it("should span the first batch and the one after it", async () => {

		const window = createWindow({ model, batch: 10 });

		expect(window.lower).toBe(0);
		expect(window.upper).toBe(20);

	});

	it("should default to batches of 25", async () => {

		expect(createWindow({ model }).upper).toBe(50);

	});

	it("should ask for the window, keeping the criteria", async () => {

		expect(createWindow({ model, batch: 10 }).model)
			.toEqual({ members: { label: {}, "^label": "asc", "@": 0, "#": 20 } });

	});

	it("should override the offset and limit the model states", async () => {

		expect(createWindow({ model: { members: { label: {}, "@": 5, "#": 100 } }, batch: 10 }).model)
			.toEqual({ members: { label: {}, "@": 0, "#": 20 } });

	});

	it("should start with no stale items", async () => {

		expect(createWindow({ model }).stale).toBeUndefined();

	});

	describe("focus()", () => {

		const items = immutable(Array.from({ length: 20 }, (_, index) => index)); // as the binding hands items over

		it("should span the batches in view and one on either side", async () => {

			const window = createWindow({ model, batch: 10 }).focus(35, 48, items);

			expect(window.lower).toBe(20);
			expect(window.upper).toBe(60);
			expect(window.model).toEqual({ members: { label: {}, "^label": "asc", "@": 20, "#": 40 } });

		});

		it("should stop the window at the first item", async () => {

			const window = createWindow({ model, batch: 10 }).focus(5, 12, items);

			expect(window.lower).toBe(0);
			expect(window.upper).toBe(30);

		});

		it("should keep the window while it stays put", async () => {

			const window = createWindow({ model, batch: 10 });

			expect(window.focus(3, 9, items)).toBe(window);

		});

		it("should remember the items held when the window moved", async () => {

			expect(createWindow({ model, batch: 10 }).focus(35, 48, items).stale).toEqual({ items, lower: 0 });

		});

		it("should keep where stale items were taken from while the window moves on", async () => {

			expect(createWindow({ model, batch: 10 }).focus(35, 48, items).focus(55, 68, items).stale?.lower).toBe(0);

		});

		it("should remember the items landed once the window moves again", async () => {

			const landed = immutable(Array.from({ length: 40 }, (_, index) => 20 + index));

			expect(createWindow({ model, batch: 10 }).focus(35, 48, items).focus(55, 68, landed).stale)
				.toEqual({ items: landed, lower: 20 });

		});

	});

});

describe("tally()", () => {

	it("should count the items under the filters alone", async () => {

		expect(tally({

			members: {
				label: {},
				"~label": "x",
				">=rank": 3,
				"?kind": ["a", "b"],
				"^label": "asc",
				"+kind": ["a"],
				"@": 5,
				"#": 7
			}

		})).toEqual({

			members: {
				"~label": "x",
				">=rank": 3,
				"?kind": ["a", "b"],
				"count=count:": {}
			}

		});

	});

});
