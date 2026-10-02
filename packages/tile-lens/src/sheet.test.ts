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

/**
 * The height of a row, as the stand-in observer measures it.
 */
const row = 20;

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
 * A store holding the items given, handing out the slice the model's offset and limit ask for, or their count if the
 * model asks for it, immutable as every store hands them out.
 */
function catalogue(items: readonly { id: string, label: string }[]) {
	return vi.fn(async ({ model }: { model: { members: { "@"?: number, "#"?: number } } }) => immutable({
		id: entry,
		members: "count=count:" in model.members ? [{ count: items.length }] : items.slice(
			model.members["@"] ?? 0,
			(model.members["@"] ?? 0)+(model.members["#"] || items.length)
		)
	}));
}

/**
 * The calls asking for the items of a lookup, as against those asking for their count.
 */
function slices(lookup: ReturnType<typeof catalogue>) {
	return lookup.mock.calls.map(([{ model }]) => model).filter(model => !("count=count:" in model.members));
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

function sheet(): HTMLElement {
	return document.querySelector("tile-sheet") as HTMLElement; // ;(test query) every test calling it renders the sheet
}

function shown(): readonly string[] {
	return Array.from(document.querySelectorAll("tile-sheet p"), item => item.textContent ?? "");
}


/*
 * The page lays nothing out, so a stand-in observer lets a test measure the rows rendered, and a stubbed bounding box
 * lets it scroll the sheet.
 */

const observed = new Map<Element, ResizeObserverCallback>();

class Observer {

	readonly #callback: ResizeObserverCallback;

	constructor(callback: ResizeObserverCallback) {
		this.#callback = callback;
	}

	observe(element: Element): void {
		observed.set(element, this.#callback);
	}

	disconnect(): void {
		[...observed].filter(([, callback]) => callback === this.#callback).forEach(([element]) => observed.delete(element));
	}

}

function measure(): void {
	act(() => [...observed].forEach(([target, callback]) => callback(
		[{ target, contentRect: { height: shown().length*row } } as unknown as ResizeObserverEntry], // ;(test stub) the entry fields read
		{} as ResizeObserver // ;(test stub) the observer argument is never read
	)));
}

function scroll(index: number): void {
	vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(
		{ top: -index*row } as DOMRect // ;(test stub) the field read
	);
	act(() => { window.dispatchEvent(new Event("scroll")); });
}


beforeEach(async () => {
	vi.stubGlobal("ResizeObserver", Observer);
});

afterEach(async () => {
	act(() => render(null, document.body));
	observed.clear();
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});


describe("Sheet", () => {

	it("should list the items, rendering each through children", async () => {

		mount(catalogue(pool(3)));

		await vi.waitFor(() => expect(shown()).toEqual(["item 0", "item 1", "item 2"]));

	});

	it("should keep the criteria the model states", async () => {

		const lookup = catalogue(pool(3));

		mount(lookup);

		await vi.waitFor(() => expect(slices(lookup)).not.toHaveLength(0));

		expect(slices(lookup).at(-1)).toMatchObject({ members: { "^label": "asc" } });

	});

	describe("window", () => {

		it("should start with the first batch and the one after it", async () => {

			mount(catalogue(pool(5*batch)));

			await vi.waitFor(() => expect(shown()).toHaveLength(2*batch));

			expect(shown()[0]).toBe("item 0");

		});

		it("should count the items under the filters the model states", async () => {

			const lookup = catalogue(pool(3));

			mount(lookup);

			await vi.waitFor(() => expect(lookup).toHaveBeenCalledWith(expect.objectContaining({
				model: { members: { "count=count:": {} } }
			})));

		});

		it("should reserve the room of the items past the window", async () => {

			mount(catalogue(pool(5*batch)));

			await vi.waitFor(() => expect(shown()).toHaveLength(2*batch));

			measure();

			await vi.waitFor(() => expect(sheet().style.paddingBottom).toBe(`${3*batch*row}px`));

			expect(sheet().style.paddingTop).toBe("0px");

		});

		it("should move with the items in view", async () => {

			mount(catalogue(pool(10*batch)));

			await vi.waitFor(() => expect(shown()).toHaveLength(2*batch));

			measure();
			scroll(3*batch);

			await vi.waitFor(() => expect(shown()[0]).toBe(`item ${2*batch}`));

			expect(sheet().style.paddingTop).toBe(`${2*batch*row}px`);

		});

		it("should keep the items held where they stand while the new window is on its way", async () => {

			const lookup = catalogue(pool(10*batch));

			mount(lookup);

			await vi.waitFor(() => expect(shown()).toHaveLength(2*batch));

			measure();

			lookup.mockImplementation(() => new Promise(() => {}));

			scroll(3*batch);

			await vi.waitFor(() => expect(slices(lookup).at(-1)).toMatchObject({ members: { "@": 2*batch } }));

			expect(shown()[0]).toBe("item 0");
			expect(sheet().style.paddingTop).toBe("0px");

		});

	});

	describe("model changes", () => {

		it("should start again from the first window", async () => {

			const lookup = catalogue(pool(10*batch));

			mount(lookup);

			await vi.waitFor(() => expect(shown()).toHaveLength(2*batch));

			measure();
			scroll(3*batch);

			await vi.waitFor(() => expect(shown()[0]).toBe(`item ${2*batch}`));

			mount(lookup, undefined, { members: { ...model.members, "^label": "desc" } });

			await vi.waitFor(() => expect(slices(lookup).at(-1)).toMatchObject({
				members: { "^label": "desc", "@": 0, "#": 2*batch }
			}));

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
