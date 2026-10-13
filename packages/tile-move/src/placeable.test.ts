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

import { arrange, createPlaceable, type Move, same } from "./placeable.core.js";


const across: Move = { card: "a", from: { row: "bug", column: "todo" }, to: { row: "bug", column: "done" } };
const within: Move = { card: "a", from: { row: "bug", column: "todo" }, to: { row: "bug", column: "todo" } };


describe("createPlaceable()", () => {

	describe("creation", () => {

		it("should hold no card", async () => {

			expect(createPlaceable().held).toBeUndefined();

		});

		it("should have no move waiting or settled", async () => {

			expect(createPlaceable().pending).toBeUndefined();
			expect(createPlaceable().settled).toBeUndefined();

		});

		it("should owe the focus to no card", async () => {

			expect(createPlaceable().focus).toBeUndefined();

		});

		it("should have no card active", async () => {

			expect(createPlaceable().active).toBeUndefined();

		});

	});

	describe("activate()", () => {

		it("should mark the card the keyboard stands on", async () => {

			expect(createPlaceable().activate("a").activate("b").active).toBe("b");

		});

		it("should keep the card active across moves", async () => {

			expect(createPlaceable().activate("a").pick("a").drop(across).settle().active).toBe("a");

		});

	});

	describe("pick()", () => {

		it("should hold the card picked up", async () => {

			expect(createPlaceable().pick("a").held).toBe("a");

		});

		it("should owe the focus to a card picked up from the keyboard", async () => {

			expect(createPlaceable().pick("a", true).focus).toBe("a");

		});

		it("should owe the focus to no card picked up with the pointer", async () => {

			expect(createPlaceable().pick("a").focus).toBeUndefined();

		});

		it("should release the focus owed to the card carried before", async () => {

			expect(createPlaceable().pick("a", true).drop(across).settle().pick("b").focus).toBeUndefined();

		});

		it("should ignore picks while a card is held", async () => {

			const model = createPlaceable().pick("a");

			expect(model.pick("b")).toBe(model);

		});

		it("should ignore picks while a move is waiting", async () => {

			const model = createPlaceable().pick("a").drop(across);

			expect(model.pick("b")).toBe(model);

		});

	});

	describe("drop()", () => {

		it("should leave a move into another cell waiting", async () => {

			const model = createPlaceable().pick("a").drop(across);

			expect(model.held).toBeUndefined();
			expect(model.pending).toEqual(across);

		});

		it("should release a card dropped onto its own cell, with no move waiting", async () => {

			const model = createPlaceable().pick("a").drop(within);

			expect(model.held).toBeUndefined();
			expect(model.pending).toBeUndefined();

		});

		it("should keep owing the focus to a card picked up from the keyboard", async () => {

			expect(createPlaceable().pick("a", true).drop(across).focus).toBe("a");
			expect(createPlaceable().pick("a", true).drop(within).focus).toBe("a");

		});

		it("should ignore moves of a card other than the one held", async () => {

			const model = createPlaceable().pick("b");

			expect(model.drop(across)).toBe(model);

		});

		it("should ignore drops while no card is held", async () => {

			const model = createPlaceable();

			expect(model.drop(across)).toBe(model);

		});

	});

	describe("cancel()", () => {

		it("should release the held card, with no move waiting", async () => {

			const model = createPlaceable().pick("a").cancel();

			expect(model.held).toBeUndefined();
			expect(model.pending).toBeUndefined();

		});

		it("should keep owing the focus to a card picked up from the keyboard", async () => {

			expect(createPlaceable().pick("a", true).cancel().focus).toBe("a");

		});

		it("should ignore cancellations while no card is held", async () => {

			const model = createPlaceable();

			expect(model.cancel()).toBe(model);

		});

	});

	describe("settle()", () => {

		it("should leave no move waiting", async () => {

			expect(createPlaceable().pick("a").drop(across).settle().pending).toBeUndefined();

		});

		it("should record the move settled", async () => {

			expect(createPlaceable().pick("a").drop(across).settle().settled).toEqual(across);

		});

		it("should let another card be picked up", async () => {

			expect(createPlaceable().pick("a").drop(across).settle().pick("b").held).toBe("b");

		});

		it("should forget the move settled once another card is picked up", async () => {

			expect(createPlaceable().pick("a").drop(across).settle().pick("b").settled).toBeUndefined();

		});

		it("should ignore settlements while no move is waiting", async () => {

			const model = createPlaceable().pick("a");

			expect(model.settle()).toBe(model);

		});

	});

	describe("immutability", () => {

		it("should leave earlier boards unchanged", async () => {

			const model = createPlaceable();

			model.pick("a").drop(across);

			expect(model.held).toBeUndefined();
			expect(model.pending).toBeUndefined();

		});

	});

});

describe("arrange()", () => {

	const cards = [
		{ id: "a", row: "bug", column: "todo", title: "Alpha" },
		{ id: "b", row: "bug", column: "done", title: "Beta" },
		{ id: "c", row: "task", column: "todo", title: "Gamma" }
	];


	it("should keep the cards where they stand while no move is waiting", async () => {

		expect(arrange(cards)).toEqual(cards);

	});

	it("should place the card moved in the cell it was dropped onto, keeping the order", async () => {

		expect(arrange(cards, across)).toEqual([
			{ id: "a", row: "bug", column: "done", title: "Alpha" },
			{ id: "b", row: "bug", column: "done", title: "Beta" },
			{ id: "c", row: "task", column: "todo", title: "Gamma" }
		]);

	});

	it("should ignore moves of unknown cards", async () => {

		expect(arrange(cards, { ...across, card: "x" })).toEqual(cards);

	});

	it("should reject blank card keys", async () => {

		expect(() => arrange([{ id: " ", row: "bug", column: "todo" }])).toThrow(TypeError);

	});

	it("should reject blank row or column keys", async () => {

		expect(() => arrange([{ id: "a", row: "", column: "todo" }])).toThrow(TypeError);
		expect(() => arrange([{ id: "a", row: "bug", column: "" }])).toThrow(TypeError);

	});

	it("should reject repeated card keys", async () => {

		expect(() => arrange([
			{ id: "a", row: "bug", column: "todo" },
			{ id: "a", row: "bug", column: "done" }
		])).toThrow(TypeError);

	});

});

describe("same()", () => {

	it("should tell the same cell", async () => {

		expect(same(within.from, within.to)).toBe(true);

	});

	it("should tell cells apart by row or column", async () => {

		expect(same(across.from, across.to)).toBe(false);
		expect(same({ row: "bug", column: "todo" }, { row: "task", column: "todo" })).toBe(false);

	});

});
