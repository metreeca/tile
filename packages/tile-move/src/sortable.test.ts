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

import { createSortable, locate } from "./sortable.core.js";


describe("createSortable()", () => {

	const lists = { todo: ["a", "b", "c"], done: ["d"], later: [] };

	const board = () => createSortable({ lists });


	describe("creation", () => {

		it("should hold no list by default", async () => {

			expect(createSortable().lists).toEqual({});

		});

		it("should keep the lists given, in order, with their items in order", async () => {

			expect(board().lists).toEqual(lists);
			expect(Object.keys(board().lists)).toEqual(["todo", "done", "later"]);

		});

		it("should hold no item", async () => {

			expect(board().held).toBeUndefined();

		});

		it("should have no item waiting or settled", async () => {

			expect(board().pending).toBeUndefined();
			expect(board().settled).toBeUndefined();

		});

		it("should owe the focus to no item", async () => {

			expect(board().focus).toBeUndefined();

		});

		it("should have no item active", async () => {

			expect(board().active).toBeUndefined();

		});

		it("should reject blank list labels", async () => {

			expect(() => createSortable({ lists: { " ": ["a"] } })).toThrow(TypeError);

		});

		it("should reject blank item keys", async () => {

			expect(() => createSortable({ lists: { todo: ["a", ""] } })).toThrow(TypeError);

		});

		it("should reject item keys repeated within a list", async () => {

			expect(() => createSortable({ lists: { todo: ["a", "a"] } })).toThrow(TypeError);

		});

		it("should reject item keys repeated across lists", async () => {

			expect(() => createSortable({ lists: { todo: ["a"], done: ["a"] } })).toThrow(TypeError);

		});

	});

	describe("activate()", () => {

		it("should mark the item the keyboard stands on", async () => {

			expect(board().activate("a").activate("b").active).toBe("b");

		});

		it("should keep the item active across moves", async () => {

			expect(board().activate("a").pick("a").move("done", 0).drop().settle().active).toBe("a");

		});

	});

	describe("pick()", () => {

		it("should hold the item picked up, leaving the order unchanged", async () => {

			const model = board().pick("b");

			expect(model.held).toBe("b");
			expect(model.lists).toEqual(lists);

		});

		it("should owe the focus to an item picked up from the keyboard", async () => {

			expect(board().pick("a", true).focus).toBe("a");
			expect(board().pick("a", true).move("done", 0).focus).toBe("a");

		});

		it("should owe the focus to no item picked up with the pointer", async () => {

			expect(board().pick("a").focus).toBeUndefined();

		});

		it("should release the focus owed to the item carried before", async () => {

			expect(board().pick("a", true).drop().settle().pick("b").focus).toBeUndefined();

		});

		it("should ignore unknown items", async () => {

			const model = board();

			expect(model.pick("x")).toBe(model);

		});

		it("should ignore picks while an item is held", async () => {

			const model = board().pick("a");

			expect(model.pick("b")).toBe(model);

		});

		it("should ignore picks while a dropped item is waiting", async () => {

			const model = board().pick("a").move("done", 1).drop();

			expect(model.pick("b")).toBe(model);

		});

	});

	describe("move()", () => {

		it("should carry the held item forwards within its list", async () => {

			expect(board().pick("a").move("todo", 2).lists.todo).toEqual(["b", "c", "a"]);

		});

		it("should carry the held item backwards within its list", async () => {

			expect(board().pick("c").move("todo", 0).lists.todo).toEqual(["c", "a", "b"]);

		});

		it("should carry the held item into another list", async () => {

			expect(board().pick("b").move("done", 0).lists).toEqual({ todo: ["a", "c"], done: ["b", "d"], later: [] });

		});

		it("should carry the held item into an empty list", async () => {

			expect(board().pick("d").move("later", 0).lists).toEqual({ todo: ["a", "b", "c"], done: [], later: ["d"] });

		});

		it("should clamp positions beyond the end of the list", async () => {

			expect(board().pick("a").move("done", 99).lists.done).toEqual(["d", "a"]);

		});

		it("should clamp positions before the start of the list", async () => {

			expect(board().pick("c").move("todo", -1).lists.todo).toEqual(["c", "a", "b"]);

		});

		it("should keep holding the item", async () => {

			expect(board().pick("a").move("done", 0).held).toBe("a");

		});

		it("should keep the order of the lists", async () => {

			expect(Object.keys(board().pick("a").move("later", 0).lists)).toEqual(["todo", "done", "later"]);

		});

		it("should accumulate successive moves", async () => {

			expect(board().pick("a").move("done", 1).move("later", 0).lists)
				.toEqual({ todo: ["b", "c"], done: ["d"], later: ["a"] });

		});

		it("should ignore moves while no item is held", async () => {

			const model = board();

			expect(model.move("done", 0)).toBe(model);

		});

		it("should ignore moves into unknown lists", async () => {

			const model = board().pick("a");

			expect(model.move("x", 0)).toBe(model);

		});

		it("should ignore moves to where the held item stands", async () => {

			const model = board().pick("b");

			expect(model.move("todo", 1)).toBe(model);

		});

	});

	describe("drop()", () => {

		it("should leave the held item where it stands, waiting", async () => {

			const model = board().pick("a").move("done", 1).drop();

			expect(model.lists).toEqual({ todo: ["b", "c"], done: ["d", "a"], later: [] });
			expect(model.held).toBeUndefined();
			expect(model.pending).toBe("a");

		});

		it("should leave an item dropped where it was picked up waiting", async () => {

			const model = board().pick("a").drop();

			expect(model.lists).toEqual(lists);
			expect(model.pending).toBe("a");

		});

		it("should keep owing the focus to an item picked up from the keyboard", async () => {

			expect(board().pick("a", true).move("done", 1).drop().focus).toBe("a");

		});

		it("should ignore drops while no item is held", async () => {

			const model = board();

			expect(model.drop()).toBe(model);

		});

	});

	describe("settle()", () => {

		it("should restore the order the item was picked up from, with no item waiting", async () => {

			const model = board().pick("a").move("done", 1).drop().settle();

			expect(model.lists).toEqual(lists);
			expect(model.pending).toBeUndefined();

		});

		it("should record the item settled", async () => {

			expect(board().pick("a").move("done", 1).drop().settle().settled).toBe("a");

		});

		it("should let another item be picked up", async () => {

			expect(board().pick("a").move("done", 1).drop().settle().pick("b").held).toBe("b");

		});

		it("should forget the item settled once another item is picked up", async () => {

			expect(board().pick("a").move("done", 1).drop().settle().pick("b").settled).toBeUndefined();

		});

		it("should ignore settlements while no item is waiting", async () => {

			const model = board().pick("a");

			expect(model.settle()).toBe(model);

		});

	});

	describe("cancel()", () => {

		it("should restore the order the item was picked up from", async () => {

			const model = board().pick("a").move("done", 1).move("later", 0).cancel();

			expect(model.lists).toEqual(lists);
			expect(model.held).toBeUndefined();

		});

		it("should release an item that was never moved", async () => {

			const model = board().pick("a").cancel();

			expect(model.lists).toEqual(lists);
			expect(model.held).toBeUndefined();

		});

		it("should keep owing the focus to an item picked up from the keyboard", async () => {

			expect(board().pick("a", true).cancel().focus).toBe("a");

		});

		it("should ignore cancellations while no item is held", async () => {

			const model = board();

			expect(model.cancel()).toBe(model);

		});

	});

	describe("immutability", () => {

		it("should leave earlier lists unchanged", async () => {

			const model = board();

			model.pick("a").move("done", 0).drop();

			expect(model.lists).toEqual(lists);
			expect(model.held).toBeUndefined();

		});

	});

});

describe("locate()", () => {

	const lists = { todo: ["a", "b"], done: ["c"], later: [] };


	it("should locate an item by its list and index", async () => {

		expect(locate(lists, "b")).toEqual({ list: "todo", index: 1 });
		expect(locate(lists, "c")).toEqual({ list: "done", index: 0 });

	});

	it("should locate no unknown item", async () => {

		expect(locate(lists, "x")).toBeUndefined();

	});

});
