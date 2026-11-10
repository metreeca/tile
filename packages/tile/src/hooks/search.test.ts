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

import { reference } from "@metreeca/blue/reference";
import { id, multiple, required, resource } from "@metreeca/blue/resource";
import { string } from "@metreeca/blue/string";
import type { Criteria } from "@metreeca/qest/model";
import { createElement, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { type Collection } from "./collection.core.js";
import { useCollection } from "./collection.js";
import { type Search, useSearch } from "./search.js";


describe("useSearch()", () => {

	const entry = "https://example.com/catalogue/";

	const Item = resource({ id: id(), label: required(string()) });
	const Catalogue = resource({ id: id(), members: multiple(reference(Item)) });


	function mount(criteria: Criteria = {}): {

		collection: () => Collection<typeof Catalogue, "members">
		search: () => Search

	} {

		const collections = vi.fn<(collection: Collection<typeof Catalogue, "members">) => void>();
		const searches = vi.fn<(search: Search) => void>();

		function Probe() {

			const collection = useCollection({ entry, shape: Catalogue, query: criteria });

			collections(collection);
			searches(useSearch(collection, "label"));

			return null;

		}

		act(() => render(createElement(Probe, {}), document.body));

		return {
			collection: () => collections.mock.lastCall![0], // test harness: Probe has rendered at least once
			search: () => searches.mock.lastCall![0]
		};
	}

	/**
	 * Performs a reader action, letting the collection notify its change, which it does in a microtask.
	 */
	async function step(action: () => unknown): Promise<void> {
		await act(async () => void action());
	}


	afterEach(async () => {
		act(() => render(null, document.body));
	});


	describe("text", () => {

		it("should start empty where no text narrows the collection", async () => {
			expect(mount().search().text).toBe("");
		});

		it("should start from the text narrowing the collection", async () => {
			expect(mount({ "~label": "item" }).search().text).toBe("item");
		});

		it("should follow the text as it is changed elsewhere", async () => {

			const { collection, search } = mount({ "~label": "item" });

			await step(() => collection().filter({ "~label": "other" }));

			expect(search().text).toBe("other");

		});

		it("should follow the text as it is cleared elsewhere", async () => {

			const { collection, search } = mount({ "~label": "item" });

			await step(() => collection().clear());

			expect(search().text).toBe("");

		});

	});

	describe("submit()", () => {

		it("should narrow the collection by the trimmed text at once", async () => {

			const { collection, search } = mount();

			await step(() => search().submit(" item "));

			expect(collection().query).toEqual({ "~label": "item" });

		});

		it("should update the text to the trimmed text narrowing the collection", async () => {

			const { search } = mount();

			await step(() => search().submit(" item "));

			expect(search().text).toBe("item");

		});

		it("should stop narrowing the collection on blank text", async () => {

			const { collection, search } = mount({ "~label": "item", "?university": ["u1"] });

			await step(() => search().submit("  "));

			expect(collection().query).toEqual({ "?university": ["u1"] });

		});

	});

});
