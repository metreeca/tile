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

import { createModel } from "./tabs.core.js";


describe("createModel", () => {

	describe("creation", () => {

		it("should hold no section by default", async () => {

			const model = createModel();

			expect(model.labels).toEqual([]);
			expect(model.active).toBeUndefined();

		});

		it("should keep the labels given, in order", async () => {

			expect(createModel({ labels: ["one", "two", "three"] }).labels).toEqual(["one", "two", "three"]);

		});

		it("should accept a single label", async () => {

			expect(createModel({ labels: "one" }).labels).toEqual(["one"]);

		});

		it("should remove duplicate labels, keeping the first occurrence", async () => {

			expect(createModel({ labels: ["one", "two", "one"] }).labels).toEqual(["one", "two"]);

		});

		it("should trim the labels given", async () => {

			expect(createModel({ labels: [" one ", "two\n"] }).labels).toEqual(["one", "two"]);

		});

		it("should remove labels differing only by surrounding whitespace", async () => {

			expect(createModel({ labels: ["one", " one "] }).labels).toEqual(["one"]);

		});

		it("should trim the section given", async () => {

			expect(createModel({ labels: ["one", "two"], active: " two " }).active).toBe("two");

		});

		it("should show the first section by default", async () => {

			expect(createModel({ labels: ["one", "two"] }).active).toBe("one");

		});

		it("should show the section given", async () => {

			expect(createModel({ labels: ["one", "two"], active: "two" }).active).toBe("two");

		});

		it("should reject a blank label", async () => {

			expect(() => createModel({ labels: ["one", " "] })).toThrow(TypeError);

		});

		it("should reject an unknown section", async () => {

			expect(() => createModel({ labels: ["one", "two"], active: "none" })).toThrow(TypeError);

		});

	});

	describe("select", () => {

		const model = createModel({ labels: ["one", "two", "three"] });

		it("should show the section selected", async () => {

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

		it("should show the following section", async () => {

			expect(createModel({ labels: ["one", "two", "three"] }).next().active).toBe("two");

		});

		it("should wrap from the last section to the first", async () => {

			expect(createModel({ labels: ["one", "two"], active: "two" }).next().active).toBe("one");

		});

		it("should ignore a single section", async () => {

			const model = createModel({ labels: "one" });

			expect(model.next()).toBe(model);

		});

		it("should ignore no sections", async () => {

			const model = createModel();

			expect(model.next()).toBe(model);

		});

	});

	describe("back", () => {

		it("should show the preceding section", async () => {

			expect(createModel({ labels: ["one", "two", "three"], active: "three" }).back().active).toBe("two");

		});

		it("should wrap from the first section to the last", async () => {

			expect(createModel({ labels: ["one", "two"] }).back().active).toBe("two");

		});

		it("should ignore a single section", async () => {

			const model = createModel({ labels: "one" });

			expect(model.back()).toBe(model);

		});

		it("should ignore no sections", async () => {

			const model = createModel();

			expect(model.back()).toBe(model);

		});

	});

	describe("immutability", () => {

		it("should leave the state a transition was called on unchanged", async () => {

			const model = createModel({ labels: ["one", "two"] });

			model.select("two");
			model.next();

			expect(model.active).toBe("one");

		});

	});

});
