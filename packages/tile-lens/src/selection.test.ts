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

import { Selection } from "./selection.js";


describe("Selection", () => {

	describe("Selection object creation", () => {

		it("should create empty selection by default", () => {

			const selection = Selection<string>();

			expect(selection.items).toEqual([]);

		});

		it("should create selection with initial items", () => {

			const selection = Selection<string>({
				items: ["apple", "banana"]
			});

			expect(selection.items).toEqual(["apple", "banana"]);

		});

		it("should handle empty items array", () => {

			const selection = Selection<string>({
				items: []
			});

			expect(selection.items).toEqual([]);

		});

		it("should work with different item types", () => {

			const numberSelection = Selection<number>({
				items: [1, 2, 3]
			});

			expect(numberSelection.items).toEqual([1, 2, 3]);

		});

		it("should deduplicate initial items", () => {

			const selection = Selection<string>({
				items: ["apple", "banana", "apple", "orange", "banana"]
			});

			expect(selection.items).toEqual(["apple", "banana", "orange"]);
			expect(selection.items).toHaveLength(3);

		});

	});

	describe("toggle() - Basic toggle behavior (no force parameter)", () => {

		it("should add single item when not present", () => {

			const selection = Selection<string>();

			const next = selection.toggle("apple");

			expect(next.items).toContain("apple");
			expect(next.items).toHaveLength(1);

		});

		it("should remove single item when present", () => {

			const selection = Selection<string>({
				items: ["apple", "banana"]
			});

			const next = selection.toggle("apple");

			expect(next.items).not.toContain("apple");
			expect(next.items).toContain("banana");
			expect(next.items).toHaveLength(1);

		});

		it("should toggle single item multiple times", () => {

			const selection = Selection<string>();

			const step1 = selection.toggle("apple");
			expect(step1.items).toContain("apple");

			const step2 = step1.toggle("apple");
			expect(step2.items).not.toContain("apple");
			expect(step2.items).toHaveLength(0);

			const step3 = step2.toggle("apple");
			expect(step3.items).toContain("apple");

		});

		it("should add multiple items when not present", () => {

			const selection = Selection<string>();

			const next = selection.toggle(["apple", "banana"]);

			expect(next.items).toContain("apple");
			expect(next.items).toContain("banana");
			expect(next.items).toHaveLength(2);

		});

		it("should remove multiple items when all present", () => {

			const selection = Selection<string>({
				items: ["apple", "banana", "orange"]
			});

			const next = selection.toggle(["apple", "banana"]);

			expect(next.items).not.toContain("apple");
			expect(next.items).not.toContain("banana");
			expect(next.items).toContain("orange");
			expect(next.items).toHaveLength(1);

		});

		it("should handle mixed presence - add missing, remove present", () => {

			const selection = Selection<string>({
				items: ["apple"]
			});

			const next = selection.toggle(["apple", "banana"]);

			// apple was present (removed), banana was missing (added)
			expect(next.items).not.toContain("apple");
			expect(next.items).toContain("banana");
			expect(next.items).toHaveLength(1);

		});

		it("should preserve order of existing items when toggling", () => {

			const selection = Selection<string>({
				items: ["apple", "banana", "orange"]
			});

			const next = selection.toggle("cherry");

			expect(next.items).toEqual(["apple", "banana", "orange", "cherry"]);

		});

	});

	describe("toggle() - Force include (force=true)", () => {

		it("should add single item when force=true and item not present", () => {

			const selection = Selection<string>();

			const next = selection.toggle("apple", true);

			expect(next.items).toContain("apple");
			expect(next.items).toHaveLength(1);

		});

		it("should keep single item when force=true and item already present", () => {

			const selection = Selection<string>({
				items: ["apple"]
			});

			const next = selection.toggle("apple", true);

			expect(next.items).toContain("apple");
			expect(next.items).toHaveLength(1);
			expect(next).toBe(selection); // should return same reference (no change)

		});

		it("should add multiple items when force=true and items not present", () => {

			const selection = Selection<string>();

			const next = selection.toggle(["apple", "banana"], true);

			expect(next.items).toContain("apple");
			expect(next.items).toContain("banana");
			expect(next.items).toHaveLength(2);

		});

		it("should keep multiple items when force=true and items already present", () => {

			const selection = Selection<string>({
				items: ["apple", "banana"]
			});

			const next = selection.toggle(["apple", "banana"], true);

			expect(next.items).toContain("apple");
			expect(next.items).toContain("banana");
			expect(next.items).toHaveLength(2);
			expect(next).toBe(selection); // should return same reference (no change)

		});

		it("should add only missing items when force=true with mixed presence", () => {

			const selection = Selection<string>({
				items: ["apple"]
			});

			const next = selection.toggle(["apple", "banana"], true);

			expect(next.items).toContain("apple");
			expect(next.items).toContain("banana");
			expect(next.items).toHaveLength(2);

		});

	});

	describe("toggle() - Force exclude (force=false)", () => {

		it("should remove single item when force=false and item present", () => {

			const selection = Selection<string>({
				items: ["apple", "banana"]
			});

			const next = selection.toggle("apple", false);

			expect(next.items).not.toContain("apple");
			expect(next.items).toContain("banana");
			expect(next.items).toHaveLength(1);

		});

		it("should keep empty when force=false and item not present", () => {

			const selection = Selection<string>();

			const next = selection.toggle("apple", false);

			expect(next.items).not.toContain("apple");
			expect(next.items).toHaveLength(0);
			expect(next).toBe(selection); // should return same reference (no change)

		});

		it("should remove multiple items when force=false and items present", () => {

			const selection = Selection<string>({
				items: ["apple", "banana", "orange"]
			});

			const next = selection.toggle(["apple", "banana"], false);

			expect(next.items).not.toContain("apple");
			expect(next.items).not.toContain("banana");
			expect(next.items).toContain("orange");
			expect(next.items).toHaveLength(1);

		});

		it("should handle mixed presence when force=false - remove only present items", () => {

			const selection = Selection<string>({
				items: ["apple"]
			});

			const next = selection.toggle(["apple", "banana"], false);

			expect(next.items).not.toContain("apple");
			expect(next.items).not.toContain("banana");
			expect(next.items).toHaveLength(0);

		});

	});

	describe("clear()", () => {

		it("should clear all items", () => {

			const selection = Selection<string>({
				items: ["apple", "banana", "orange"]
			});

			const next = selection.clear();

			expect(next.items).toEqual([]);

		});

		it("should return same reference when already empty", () => {

			const selection = Selection<string>();

			const next = selection.clear();

			expect(next.items).toEqual([]);
			expect(next).toBe(selection); // should return same reference (no change)

		});

		it("should work with clear after toggle", () => {

			const selection = Selection<string>();

			const next = selection
				.toggle("apple")
				.toggle("banana")
				.clear();

			expect(next.items).toEqual([]);

		});

	});

	describe("Method chaining", () => {

		it("should chain multiple toggle calls", () => {

			const selection = Selection<string>();

			const next = selection
				.toggle("apple")
				.toggle("banana")
				.toggle("orange");

			expect(next.items).toContain("apple");
			expect(next.items).toContain("banana");
			expect(next.items).toContain("orange");
			expect(next.items).toHaveLength(3);

		});

		it("should chain toggle and clear", () => {

			const selection = Selection<string>();

			const next = selection
				.toggle(["apple", "banana"])
				.toggle("orange")
				.clear()
				.toggle("cherry");

			expect(next.items).toEqual(["cherry"]);

		});

		it("should support method extraction (destructuring)", () => {

			const selection = Selection<string>({
				items: ["apple"]
			});

			const { toggle, clear } = selection;

			const next = toggle("banana");
			expect(next.items).toContain("apple");
			expect(next.items).toContain("banana");

			const cleared = clear();
			expect(cleared.items).toEqual([]);

		});

	});

	describe("Immutability guarantees", () => {

		it("should return new state object after toggle", () => {

			const selection = Selection<string>();

			const next = selection.toggle("apple");

			expect(next).not.toBe(selection);

		});

		it("should return new state object after clear", () => {

			const selection = Selection<string>({
				items: ["apple"]
			});

			const next = selection.clear();

			expect(next).not.toBe(selection);

		});

		it("should not mutate original selection", () => {

			const selection = Selection<string>({
				items: ["apple"]
			});

			selection.toggle("banana");

			expect(selection.items).toEqual(["apple"]);

		});

		it("should preserve intermediate states", () => {

			const selection = Selection<string>();

			const step1 = selection.toggle("apple");
			const step2 = step1.toggle("banana");
			const step3 = step2.toggle("apple");

			expect(selection.items).toEqual([]);
			expect(step1.items).toEqual(["apple"]);
			expect(step2.items).toEqual(["apple", "banana"]);
			expect(step3.items).toEqual(["banana"]);

		});

	});

	describe("Edge cases", () => {

		it("should handle empty array toggle", () => {

			const selection = Selection<string>();

			const next = selection.toggle([]);

			expect(next.items).toEqual([]);
			expect(next).toBe(selection); // should return same reference (no change)

		});

		it("should handle duplicate items in toggle array", () => {

			const selection = Selection<string>();

			const next = selection.toggle(["apple", "apple", "banana"]);

			// should add each unique item once
			expect(next.items.filter(item => item === "apple")).toHaveLength(1);
			expect(next.items).toContain("banana");

		});

		it("should handle toggle with items already in selection (duplicates)", () => {

			const selection = Selection<string>({
				items: ["apple"]
			});

			const next = selection.toggle(["apple", "apple"]);

			// toggling "apple" twice should result in removing it once
			expect(next.items).not.toContain("apple");

		});

		it("should work with complex object types", () => {

			interface Item {
				id: number;
				name: string;
			}

			const item1: Item = { id: 1, name: "apple" };
			const item2: Item = { id: 2, name: "banana" };

			const selection = Selection<Item>();

			const next = selection.toggle(item1);

			expect(next.items).toHaveLength(1);
			expect(next.items[0]).toEqual(item1); // Use deep equality instead of reference equality

		});

	});

});
