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
import { immutable } from "@metreeca/core/values";
import type { Store as Backend } from "@metreeca/keep";
import { Store } from "@metreeca/tile-data/store";
import { createElement, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Sheet } from "./sheet.js";


/**
 * The number of items in each batch, as the widget documents it.
 */
const batch = 25;

const entry = "https://example.com/catalogue/";

const Item = resource({ id: id(), label: required(string()) });
const Catalogue = resource({ id: id(), members: multiple(reference(Item)) });

const model: { readonly members: { readonly id: {}, readonly label: {}, readonly "^label": "asc" | "desc" } } = {
	members: { id: {}, label: {}, "^label": "asc" }
};


function pool(size: number): readonly { id: string, label: string }[] {
	return Array.from({ length: size }, (_, index) => ({
		id: `${entry}${index}`,
		label: `item ${index}`
	}));
}

/**
 * A store holding the items given, handing out as many of them as the model's limit asks for, immutable as every
 * store hands them out.
 */
function catalogue(items: readonly { id: string, label: string }[]) {
	return vi.fn(async ({ model }: { model: { members: { "#"?: number } } }) => immutable({
		id: entry,
		members: items.slice(0, model.members["#"] || items.length)
	}));
}

function backend(lookup: unknown): Backend {
	return {
		lookup,
		observe: () => () => {}
	} as unknown as Backend; // ;(test stub) only the members the binding calls are provided
}

function mount(lookup: unknown, placeholder?: string, current: typeof model = model): void {
	act(() => render(createElement(Store, {
		factory: () => backend(lookup),
		children: createElement(Sheet<typeof Catalogue, typeof model>, {
			entry,
			shape: Catalogue,
			model: current,
			placeholder,
			children: item => createElement("p", {}, item.label)
		})
	}), document.body));
}

function shown(): readonly string[] {
	return Array.from(document.querySelectorAll("tile-sheet p"), item => item.textContent ?? "");
}


/*
 * The page offers no viewport to scroll, so a stand-in observer lets a test bring the elements watched into view.
 */

const watched = new Map<Element, IntersectionObserverCallback>();

class Observer {

	readonly #callback: IntersectionObserverCallback;

	constructor(callback: IntersectionObserverCallback) {
		this.#callback = callback;
	}

	observe(element: Element): void {
		watched.set(element, this.#callback);
	}

	disconnect(): void {
		[...watched].filter(([, callback]) => callback === this.#callback).forEach(([element]) => watched.delete(element));
	}

}

function scroll(): void {
	act(() => [...watched].forEach(([target, callback]) => callback(
		[{ target, isIntersecting: true } as unknown as IntersectionObserverEntry], // ;(test stub) the entry fields read
		{} as IntersectionObserver // ;(test stub) the observer argument is never read
	)));
}


beforeEach(async () => {
	vi.stubGlobal("IntersectionObserver", Observer);
});

afterEach(async () => {
	act(() => render(null, document.body));
	watched.clear();
	vi.unstubAllGlobals();
});


describe("Sheet", () => {

	it("should list the items, rendering each through children", async () => {

		mount(catalogue(pool(3)));

		await vi.waitFor(() => expect(shown()).toEqual(["item 0", "item 1", "item 2"]));

	});

	it("should keep the criteria the model states", async () => {

		const lookup = catalogue(pool(3));

		mount(lookup);

		await vi.waitFor(() => expect(lookup).toHaveBeenCalled());

		expect(lookup.mock.lastCall?.[0].model).toMatchObject({ members: { "^label": "asc" } });

	});

	describe("batches", () => {

		it("should start with the first batch", async () => {

			mount(catalogue(pool(2 * batch)));

			await vi.waitFor(() => expect(shown()).toHaveLength(batch));

		});

		it("should close with a trigger while more items are held", async () => {

			mount(catalogue(pool(batch + 1)));

			await vi.waitFor(() => expect(shown()).toHaveLength(batch));

			expect(document.querySelector("tile-sheet > tile-more")).not.toBeNull();

		});

		it("should not close with a trigger once every item is shown", async () => {

			mount(catalogue(pool(batch)));

			await vi.waitFor(() => expect(shown()).toHaveLength(batch));

			expect(document.querySelector("tile-more")).toBeNull();

		});

		it("should fetch the next batch once the trigger comes into view", async () => {

			mount(catalogue(pool(3 * batch)));

			await vi.waitFor(() => expect(shown()).toHaveLength(batch));

			scroll();

			await vi.waitFor(() => expect(shown()).toHaveLength(2 * batch));

		});

		it("should keep the items on show while the next batch is on its way", async () => {

			const items = pool(3 * batch);
			const lookup = catalogue(items);

			mount(lookup);

			await vi.waitFor(() => expect(shown()).toHaveLength(batch));

			lookup.mockImplementation(() => new Promise(() => {}));

			scroll();

			await vi.waitFor(() => expect(lookup).toHaveBeenCalledTimes(2));

			expect(shown()).toHaveLength(batch);

		});

	});

	describe("model changes", () => {

		it("should start again from the first batch", async () => {

			const lookup = catalogue(pool(3 * batch));

			mount(lookup);

			await vi.waitFor(() => expect(shown()).toHaveLength(batch));

			scroll();

			await vi.waitFor(() => expect(shown()).toHaveLength(2 * batch));

			mount(lookup, undefined, { members: { ...model.members, "^label": "desc" } });

			await vi.waitFor(() => expect(shown()).toHaveLength(batch));

			expect(lookup.mock.lastCall?.[0].model).toMatchObject({ members: { "#": batch + 1 } });

		});

	});

	describe("placeholder", () => {

		it("should word the area as loading while nothing is retrieved", async () => {

			mount(vi.fn(() => new Promise(() => {})), "Items");

			expect(document.querySelector("tile-hint")?.textContent).toContain("Loading");

		});

		it("should word the area as matching nothing for an empty collection", async () => {

			mount(catalogue([]), "Items");

			await vi.waitFor(() => expect(document.querySelector("tile-hint")?.textContent).toContain("No Matches"));

		});

		it("should render nothing for an empty collection if omitted", async () => {

			const lookup = catalogue([]);

			mount(lookup);

			await vi.waitFor(() => expect(lookup).toHaveBeenCalled());

			expect(document.body.innerHTML).toBe("");

		});

	});

	describe("failures", () => {

		it("should show a fault in place of the list", async () => {

			mount(vi.fn(async () => Promise.reject({ status: 503 })));

			await vi.waitFor(() => expect(document.querySelector("tile-note[role=alert]")).not.toBeNull());

			expect(document.querySelector("tile-sheet")).toBeNull();

		});

	});

});
