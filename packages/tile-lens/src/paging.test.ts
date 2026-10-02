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

import { Paging } from "./paging.js";


const model = { members: { label: {}, "^label": "asc" } };


describe("Paging()", () => {

	it("should show the first batch", async () => {

		expect(Paging({ model, batch: 10 }).limit).toBe(10);

	});

	it("should default to batches of 25", async () => {

		expect(Paging({ model }).limit).toBe(25);

	});

	it("should ask for one item more than on show, keeping the criteria", async () => {

		expect(Paging({ model, batch: 10 }).model).toEqual({ members: { label: {}, "^label": "asc", "#": 11 } });

	});

	it("should override the limit the model states", async () => {

		expect(Paging({ model: { members: { label: {}, "#": 100 } }, batch: 10 }).model)
			.toEqual({ members: { label: {}, "#": 11 } });

	});

	it("should start with no batch asked for", async () => {

		expect(Paging({ model }).asked).toBeUndefined();

	});

	describe("next()", () => {

		const items = immutable(Array.from({ length: 11 }, (_, index) => index)); // as the binding hands items over

		it("should grow by a batch", async () => {

			const paging = Paging({ model, batch: 10 }).next(items);

			expect(paging.limit).toBe(20);
			expect(paging.model).toEqual({ members: { label: {}, "^label": "asc", "#": 21 } });

		});

		it("should remember the items the batch was asked over", async () => {

			expect(Paging({ model, batch: 10 }).next(items).asked).toBe(items);

		});

		it("should ignore a request while the batch is on its way", async () => {

			const paging = Paging({ model, batch: 10 }).next(items);

			expect(paging.next(items)).toBe(paging);

		});

		it("should grow again once the batch has landed", async () => {

			const landed = immutable(Array.from({ length: 21 }, (_, index) => index));

			expect(Paging({ model, batch: 10 }).next(items).next(landed).limit).toBe(30);

		});

		it("should keep the model until it grows", async () => {

			const paging = Paging({ model, batch: 10 }).next(items);

			expect(paging.next(items).model).toBe(paging.model);

		});

	});

});
