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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type Collection } from "./collection.core.js";
import { useCollection } from "./collection.js";
import { type Keywords, useKeywords } from "./keywords.js";


describe("useKeywords()", () => {

	const entry = "https://example.com/catalogue/";
	const delay = 300;

	const Item = resource({ id: id(), label: required(string()) });
	const Catalogue = resource({ id: id(), members: multiple(reference(Item)) });


	function mount(sieve: Criteria = {}): {

		collection: () => Collection<typeof Catalogue, "members">
		keywords: () => Keywords

	} {

		const collections = vi.fn<(collection: Collection<typeof Catalogue, "members">) => void>();
		const keywords = vi.fn<(keywords: Keywords) => void>();

		function Probe() {

			const collection = useCollection({ entry, shape: Catalogue, sieve });

			collections(collection);
			keywords(useKeywords(collection, "label", { delay }));

			return null;

		}

		act(() => render(createElement(Probe, {}), document.body));

		return {
			collection: () => collections.mock.lastCall![0], // test harness: Probe has rendered at least once
			keywords: () => keywords.mock.lastCall![0]
		};
	}

	/**
	 * Performs a reader action, letting the collection notify its change, which it does in a microtask.
	 */
	async function step(action: () => unknown): Promise<void> {
		await act(async () => void action());
	}


	beforeEach(async () => {
		vi.useFakeTimers();
	});

	afterEach(async () => {
		act(() => render(null, document.body));
		vi.useRealTimers();
	});


	describe("text", () => {

		it("should start empty where no keywords narrow the collection", async () => {
			expect(mount().keywords().text).toBe("");
		});

		it("should start from the keywords narrowing the collection", async () => {
			expect(mount({ "~label": "item" }).keywords().text).toBe("item");
		});

		it("should follow the keywords as they are changed elsewhere", async () => {

			const { collection, keywords } = mount({ "~label": "item" });

			await step(() => collection().filter({ "~label": "other" }));

			expect(keywords().text).toBe("other");

		});

		it("should follow the keywords as they are cleared elsewhere", async () => {

			const { collection, keywords } = mount({ "~label": "item" });

			await step(() => collection().clear());

			expect(keywords().text).toBe("");

		});

	});

	describe("search()", () => {

		it("should update the text at once", async () => {

			const { keywords } = mount();

			await step(() => keywords().search("ite"));

			expect(keywords().text).toBe("ite");

		});

		it("should leave the collection as it stands until the reader pauses", async () => {

			const { collection, keywords } = mount();

			await step(() => keywords().search("item"));
			await step(() => vi.advanceTimersByTime(delay-1));

			expect(collection().sieve).toEqual({});

		});

		it("should narrow the collection by the trimmed text once the reader pauses", async () => {

			const { collection, keywords } = mount();

			await step(() => keywords().search(" item "));
			await step(() => vi.advanceTimersByTime(delay));

			expect(collection().sieve).toEqual({ "~label": "item" });

		});

		it("should wait for the reader to pause after the last keystroke", async () => {

			const { collection, keywords } = mount();

			await step(() => keywords().search("it"));
			await step(() => vi.advanceTimersByTime(delay-1));
			await step(() => keywords().search("item"));
			await step(() => vi.advanceTimersByTime(delay-1));

			expect(collection().sieve).toEqual({});

			await step(() => vi.advanceTimersByTime(1));

			expect(collection().sieve).toEqual({ "~label": "item" });

		});

		it("should stop narrowing the collection on blank text", async () => {

			const { collection, keywords } = mount({ "~label": "item", "?university": ["u1"] });

			await step(() => keywords().search("  "));
			await step(() => vi.advanceTimersByTime(delay));

			expect(collection().sieve).toEqual({ "?university": ["u1"] });

		});

	});

	describe("commit()", () => {

		it("should narrow the collection at once", async () => {

			const { collection, keywords } = mount();

			await step(() => keywords().search("item"));
			await step(() => keywords().commit());

			expect(collection().sieve).toEqual({ "~label": "item" });

		});

		it("should leave the collection to the committed text after the pause", async () => {

			const { collection, keywords } = mount();

			await step(() => keywords().search("item"));
			await step(() => keywords().commit());
			await step(() => collection().filter({ "~label": "other" }));
			await step(() => vi.advanceTimersByTime(delay));

			expect(collection().sieve).toEqual({ "~label": "other" });

		});

	});

});
