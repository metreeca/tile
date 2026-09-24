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

import { createTabs } from "./tabs.core.js";


describe("createTabs", () => {

	describe("creation", () => {

		it("should hold no panel by default", async () => {

			const model = createTabs();

			expect(model.labels).toEqual({});
			expect(model.active).toBeUndefined();

		});

		it("should enable the labels listed, in order", async () => {

			const model = createTabs({ labels: ["one", "two", "three"] });

			expect(model.labels).toEqual({ one: true, two: true, three: true });
			expect(Object.keys(model.labels)).toEqual(["one", "two", "three"]);

		});

		it("should accept a single label", async () => {

			expect(createTabs({ labels: "one" }).labels).toEqual({ one: true });

		});

		it("should remove duplicate labels, keeping the first occurrence", async () => {

			expect(Object.keys(createTabs({ labels: ["one", "two", "one"] }).labels)).toEqual(["one", "two"]);

		});

		it("should keep the labels given, in order, with the state each carries", async () => {

			const model = createTabs({ labels: { one: true, two: false, three: true } });

			expect(model.labels).toEqual({ one: true, two: false, three: true });
			expect(Object.keys(model.labels)).toEqual(["one", "two", "three"]);

		});

		it("should show the first panel by default", async () => {

			expect(createTabs({ labels: ["one", "two"] }).active).toBe("one");

		});

		it("should show the first enabled panel by default", async () => {

			expect(createTabs({ labels: { one: false, two: true, three: true } }).active).toBe("two");

		});

		it("should show no panel if every panel is disabled", async () => {

			expect(createTabs({ labels: { one: false, two: false } }).active).toBeUndefined();

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

		it("should ignore a disabled panel given on show", async () => {

			expect(createTabs({ labels: { one: true, two: false }, active: "two" }).active).toBe("one");

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

		it("should ignore a disabled label", async () => {

			const tabs = createTabs({ labels: { one: true, two: true, three: false } });

			expect(tabs.select("three")).toBe(tabs);

		});

	});

	describe("next", () => {

		it("should show the following panel", async () => {

			expect(createTabs({ labels: ["one", "two", "three"] }).next().active).toBe("two");

		});

		it("should wrap from the last panel to the first", async () => {

			expect(createTabs({ labels: ["one", "two"], active: "two" }).next().active).toBe("one");

		});

		it("should step over a disabled panel", async () => {

			expect(createTabs({ labels: { one: true, two: false, three: true } }).next().active).toBe("three");

		});

		it("should wrap over a disabled panel", async () => {

			expect(createTabs({ labels: { one: true, two: true, three: false }, active: "two" }).next().active)
				.toBe("one");

		});

		it("should ignore a single panel", async () => {

			const model = createTabs({ labels: "one" });

			expect(model.next()).toBe(model);

		});

		it("should ignore a single enabled panel", async () => {

			const model = createTabs({ labels: { one: true, two: false } });

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

		it("should step over a disabled panel", async () => {

			expect(createTabs({ labels: { one: true, two: false, three: true }, active: "three" }).back().active)
				.toBe("one");

		});

		it("should wrap over a disabled panel", async () => {

			expect(createTabs({ labels: { one: false, two: true, three: true } }).back().active).toBe("three");

		});

		it("should ignore a single panel", async () => {

			const model = createTabs({ labels: "one" });

			expect(model.back()).toBe(model);

		});

		it("should ignore a single enabled panel", async () => {

			const model = createTabs({ labels: { one: true, two: false } });

			expect(model.back()).toBe(model);

		});

		it("should ignore no panels", async () => {

			const model = createTabs();

			expect(model.back()).toBe(model);

		});

	});

});
