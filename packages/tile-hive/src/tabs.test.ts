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

import { createTabs } from "./tabs.pure.js";


describe("createTabs", () => {

	describe("creation", () => {

		it("should hold no panel by default", async () => {

			const model = createTabs();

			expect(model.labels).toEqual([]);
			expect(model.active).toBeUndefined();

		});

		it("should keep the labels given, in order", async () => {

			expect(createTabs({ labels: ["one", "two", "three"] }).labels).toEqual(["one", "two", "three"]);

		});

		it("should accept a single label", async () => {

			expect(createTabs({ labels: "one" }).labels).toEqual(["one"]);

		});

		it("should remove duplicate labels, keeping the first occurrence", async () => {

			expect(createTabs({ labels: ["one", "two", "one"] }).labels).toEqual(["one", "two"]);

		});

		it("should show the first panel by default", async () => {

			expect(createTabs({ labels: ["one", "two"] }).active).toBe("one");

		});

		it("should show the panel given", async () => {

			expect(createTabs({ labels: ["one", "two"], active: "two" }).active).toBe("two");

		});

		it("should reject a blank label", async () => {

			expect(() => createTabs({ labels: ["one", " "] })).toThrow(TypeError);

		});

		it("should reject an unknown panel", async () => {

			expect(() => createTabs({ labels: ["one", "two"], active: "none" })).toThrow(TypeError);

		});

	});

	describe("select", () => {

		const model = createTabs({ labels: ["one", "two", "three"] });

		it("should show the panel selected", async () => {

			expect(model.select("three").active).toBe("three");

		});

		it("should ignore an unknown label", async () => {

			expect(model.select("none")).toBe(model);

		});

		it("should ignore the label already on show", async () => {

			expect(model.select("one")).toBe(model);

		});

	});

	describe("next", () => {

		it("should show the following panel", async () => {

			expect(createTabs({ labels: ["one", "two", "three"] }).next().active).toBe("two");

		});

		it("should wrap from the last panel to the first", async () => {

			expect(createTabs({ labels: ["one", "two"], active: "two" }).next().active).toBe("one");

		});

		it("should ignore a single panel", async () => {

			const model = createTabs({ labels: "one" });

			expect(model.next()).toBe(model);

		});

		it("should ignore no panels", async () => {

			const model = createTabs();

			expect(model.next()).toBe(model);

		});

	});

	describe("back", () => {

		it("should show the preceding panel", async () => {

			expect(createTabs({ labels: ["one", "two", "three"], active: "three" }).back().active).toBe("two");

		});

		it("should wrap from the first panel to the last", async () => {

			expect(createTabs({ labels: ["one", "two"] }).back().active).toBe("two");

		});

		it("should ignore a single panel", async () => {

			const model = createTabs({ labels: "one" });

			expect(model.back()).toBe(model);

		});

		it("should ignore no panels", async () => {

			const model = createTabs();

			expect(model.back()).toBe(model);

		});

	});

});
