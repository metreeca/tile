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

import { createFold } from "./index.core.js";


describe("createFold", () => {

	it("should start closed by default", async () => {
		expect(createFold().open).toBe(false);
	});

	it("should start open as stated", async () => {
		expect(createFold({ open: true }).open).toBe(true);
	});

	it("should start collapsing by default", async () => {
		expect(createFold().collapsing).toBe(true);
	});

	it("should start collapsing as stated", async () => {
		expect(createFold({ collapsing: false }).collapsing).toBe(false);
	});

	describe("expand()", () => {

		it("should open a closed fold", async () => {
			expect(createFold().expand().open).toBe(true);
		});

		it("should leave the fold collapsing as it stands", async () => {
			expect(createFold().expand().collapsing).toBe(true);
		});

		it("should leave an open fold as it stands", async () => {

			const fold = createFold({ open: true });

			expect(fold.expand()).toBe(fold);

		});

	});

	describe("collapse()", () => {

		it("should close an open collapsing fold", async () => {
			expect(createFold({ open: true }).collapse().open).toBe(false);
		});

		it("should leave a closed fold as it stands", async () => {

			const fold = createFold();

			expect(fold.collapse()).toBe(fold);

		});

		it("should leave an open fold not collapsing as it stands", async () => {

			const fold = createFold({ open: true, collapsing: false });

			expect(fold.collapse()).toBe(fold);

		});

		it("should turn the fold back from its settings", async () => {
			expect(createFold({ open: true, collapsing: false }).configure().collapse().configuring).toBe(false);
		});

	});

	describe("configure()", () => {

		it("should start showing what the facet offers", async () => {
			expect(createFold().configuring).toBe(false);
		});

		it("should turn the fold to its settings", async () => {
			expect(createFold().configure().configuring).toBe(true);
		});

		it("should turn the fold back from its settings", async () => {
			expect(createFold().configure().configure().configuring).toBe(false);
		});

		it("should leave the fold open or closed as it stands", async () => {
			expect([createFold().configure().open, createFold({ open: true }).configure().open]).toEqual([false, true]);
		});

	});

	describe("collapsible()", () => {

		it("should make the fold collapsing", async () => {
			expect(createFold({ collapsing: false }).collapsible(true).collapsing).toBe(true);
		});

		it("should make the fold not collapsing", async () => {
			expect(createFold().collapsible(false).collapsing).toBe(false);
		});

		it("should open a fold no longer collapsing", async () => {
			expect(createFold().collapsible(false).open).toBe(true);
		});

		it("should leave a fold made collapsing open or closed as it stands", async () => {
			expect(createFold({ open: true, collapsing: false }).collapsible(true).open).toBe(true);
		});

	});

	it("should leave the fold a transition starts from as it stands", async () => {

		const fold = createFold();

		fold.expand();

		expect(fold.open).toBe(false);

	});

});
