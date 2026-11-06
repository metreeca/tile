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

	describe("expand()", () => {

		it("should open a closed fold", async () => {
			expect(createFold().expand().open).toBe(true);
		});

		it("should not pin the fold it opens", async () => {
			expect(createFold().expand().pinned).toBe(false);
		});

		it("should leave an open fold as it stands", async () => {

			const fold = createFold({ open: true });

			expect(fold.expand()).toBe(fold);

		});

	});

	describe("collapse()", () => {

		it("should close an open fold", async () => {
			expect(createFold({ open: true }).collapse().open).toBe(false);
		});

		it("should leave a closed fold as it stands", async () => {

			const fold = createFold();

			expect(fold.collapse()).toBe(fold);

		});

		it("should leave a pinned fold as it stands", async () => {

			const fold = createFold().toggle();

			expect(fold.collapse()).toBe(fold);

		});

	});

	describe("toggle()", () => {

		it("should open a closed fold", async () => {
			expect(createFold().toggle().open).toBe(true);
		});

		it("should pin the fold it opens", async () => {
			expect(createFold().toggle().pinned).toBe(true);
		});

		it("should close a pinned fold, unpinning it", async () => {

			const fold = createFold().toggle().toggle();

			expect([fold.open, fold.pinned]).toEqual([false, false]);

		});

		it("should close an open fold", async () => {
			expect(createFold({ open: true }).toggle().open).toBe(false);
		});

	});

	it("should leave the fold a transition starts from as it stands", async () => {

		const fold = createFold();

		fold.toggle();

		expect(fold.open).toBe(false);

	});

});
