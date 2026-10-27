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
import { createElement, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { type Collection } from "./collection.core.js";
import { useCollection } from "./collection.js";
import { Store } from "./index.js";
import { createWindow } from "./window.core.js";
import { useWindow } from "./window.js";


const batch = 10;


describe("createWindow()", () => {

	const window = () => createWindow({ order: { label: "asc" }, batch });


	describe("creation", () => {

		it("should start over the first batch and the one after it", async () => {

			const initial = window();

			expect([initial.lower, initial.upper]).toEqual([0, 2*batch]);

		});

		it("should sort the items as given", async () => {
			expect(window().order).toEqual({ label: "asc" });
		});

		it("should start unsorted by default", async () => {
			expect(createWindow().order).toEqual({});
		});

		it.each([0, -1, 1.5])("should reject a batch size of %s", async batch => {
			expect(() => createWindow({ batch })).toThrow(TypeError);
		});

	});

	describe("move()", () => {

		it("should span the batches in view and one more on either side", async () => {

			const moved = window().move(3*batch, 4*batch-1);

			expect([moved.lower, moved.upper]).toEqual([2*batch, 5*batch]);

		});

		it("should start from the first item near the top", async () => {

			const moved = window().move(0, batch/2);

			expect([moved.lower, moved.upper]).toEqual([0, 2*batch]);

		});

		it("should leave the window as it stands where the batches in view are unchanged", async () => {

			const initial = window();

			expect(initial.move(1, batch-1)).toBe(initial);

		});

		it.each([
			["a negative index", -1, 0],
			["a fractional index", 0, 1.5],
			["a reversed range", 5, 4]
		])("should reject %s", async (_, first, last) => {
			expect(() => window().move(first, last)).toThrow(TypeError);
		});

	});

	describe("sort()", () => {

		it("should restart from the first items in the new order", async () => {

			const sorted = window().move(3*batch, 4*batch-1).sort({ label: "desc" });

			expect(sorted.order).toEqual({ label: "desc" });
			expect([sorted.lower, sorted.upper]).toEqual([0, 2*batch]);

		});

		it("should replace the sort order rather than merge into it", async () => {
			expect(window().sort({ id: 1 }).order).toEqual({ id: 1 });
		});

		it("should leave the window as it stands where the order is unchanged", async () => {

			const initial = window();

			expect(initial.sort({ label: "asc" })).toBe(initial);

		});

	});

});


describe("useWindow()", () => {

	const entry = "https://example.com/catalogue/";

	const Item = resource({ id: id(), label: required(string()) });
	const Catalogue = resource({ id: id(), members: multiple(reference(Item)) });

	const items = Array.from({ length: 3 }, (_, index) => ({ id: `${entry}${index}`, label: `item ${index}` }));

	type Binding = ReturnType<typeof useWindow<typeof Catalogue, "members", { readonly label: {} }>>;


	function backend(lookup: unknown): Backend {
		return { lookup, observe: () => () => {} } as unknown as Backend; // ;(test stub) only the members called
	}

	function catalogue() {
		return vi.fn(async ({ model }: { model: { members: object } }) => immutable({
			id: entry,
			members: "count=count:" in model.members ? [{ count: items.length }] : items
		}));
	}

	function mount(lookup: unknown, scope = {}): {

		collection: () => Collection<typeof Catalogue, "members">
		window: () => Binding

	} {

		const collections = vi.fn<(collection: Collection<typeof Catalogue, "members">) => void>();
		const windows = vi.fn<(window: Binding) => void>();

		function Probe() {

			const collection = useCollection({ entry, shape: Catalogue, scope });

			collections(collection);

			windows(useWindow(collection, {
				model: { label: {} },
				order: { label: "asc" },
				batch
			}));

			return null;

		}

		act(() => render(createElement(Store, {
			factory: () => backend(lookup),
			children: createElement(Probe, {})
		}), document.body));

		return {
			collection: () => collections.mock.lastCall![0], // test harness: Probe has rendered at least once
			window: () => windows.mock.lastCall![0]
		};
	}

	function models(lookup: ReturnType<typeof catalogue>) {
		return lookup.mock.calls.map(([{ model }]) => model);
	}

	function slices(lookup: ReturnType<typeof catalogue>) {
		return models(lookup).filter(model => !("count=count:" in model.members));
	}


	afterEach(async () => {
		act(() => render(null, document.body));
	});


	it("should retrieve the window narrowed by the collection, arranged by the view", async () => {

		const lookup = catalogue();
		const { collection } = mount(lookup, { "?university": ["u1"] });

		act(() => void collection().filter({ "~label": "item" }));

		await vi.waitFor(() => expect(models(lookup)).toContainEqual({
			members: {
				label: {},
				"?university": ["u1"], "~label": "item",
				"^label": "asc",
				"@": 0, "#": 2*batch
			}
		}));

	});

	it("should count the items the collection criteria let through", async () => {

		const lookup = catalogue();
		const { collection } = mount(lookup, { "?university": ["u1"] });

		act(() => void collection().filter({ "~label": "item" }));

		await vi.waitFor(() => expect(models(lookup)).toContainEqual({
			members: { "?university": ["u1"], "~label": "item", "count=count:": {} }
		}));

	});

	it("should throw outside a store context", async () => {

		function Probe() {

			useWindow(useCollection({ entry, shape: Catalogue }), { model: { label: {} } });

			return null;

		}

		expect(() => act(() => render(createElement(Probe, {}), document.body))).toThrow("missing <Store> context");

	});

	it("should be blank until the first window is retrieved", async () => {

		const { window } = mount(vi.fn(() => new Promise(() => {})));

		expect(window()({ blank: "blank" })).toBe("blank");

	});

	it("should move to error on a failed retrieval, retrieving the window again on reload", async () => {

		const lookup = vi.fn().mockRejectedValueOnce({ status: 503 }).mockImplementation(catalogue());
		const { window } = mount(lookup);

		await vi.waitFor(() => expect(window()({ error: ({ state }) => state.status })).toBe(503));

		await act(() => window()({ error: ({ reload }) => reload() }));

		await vi.waitFor(() => expect(window()({ ready: ({ state }) => state })).toEqual(items));

	});

	it("should retrieve the window again as the store signals a change", async () => {

		const observers: (() => void)[] = [];
		const lookup = catalogue();

		const store = {
			lookup,
			observe: (observer: () => void) => { observers.push(observer); return () => {}; }
		} as unknown as Backend; // ;(test stub) only the members called

		const windows = vi.fn<(window: Binding) => void>();

		function Probe() {
			windows(useWindow(useCollection({ entry, shape: Catalogue }), { model: { label: {} }, batch }));
			return null;
		}

		act(() => render(createElement(Store, {
			factory: () => store,
			children: createElement(Probe, {})
		}), document.body));

		await vi.waitFor(() => expect(windows.mock.lastCall![0]({ ready: () => true })).toBe(true));

		const calls = lookup.mock.calls.length;

		act(() => observers.forEach(observer => observer()));

		await vi.waitFor(() => expect(lookup.mock.calls.length).toBeGreaterThan(calls));

	});

	it("should hand over the items, where they stand and how many there are", async () => {

		const { window } = mount(catalogue());

		await vi.waitFor(() => expect(window()({ ready: ({ total }) => total })).toBe(items.length));

		expect(window()({ ready: ({ state, offset }) => ({ state, offset }) })).toEqual({ state: items, offset: 0 });

	});

	it("should move over the items in view", async () => {

		const lookup = catalogue();
		const { window } = mount(lookup);

		await vi.waitFor(() => expect(window()({ ready: () => true })).toBe(true));

		act(() => window()({ ready: ({ move }) => move(3*batch, 4*batch-1) }));

		await vi.waitFor(() => expect(slices(lookup).at(-1)).toMatchObject({
			members: { "@": 2*batch, "#": 3*batch }
		}));

	});

	it("should sort the items again from the first ones", async () => {

		const lookup = catalogue();
		const { window } = mount(lookup);

		await vi.waitFor(() => expect(window()({ ready: () => true })).toBe(true));

		act(() => window()({ ready: ({ sort }) => sort({ label: "desc" }) }));

		await vi.waitFor(() => expect(slices(lookup).at(-1)).toMatchObject({
			members: { "^label": "desc", "@": 0 }
		}));

	});

	it("should start again from the first items as the sieve changes", async () => {

		const lookup = catalogue();
		const { collection, window } = mount(lookup);

		await vi.waitFor(() => expect(window()({ ready: () => true })).toBe(true));

		act(() => window()({ ready: ({ move }) => move(5*batch, 6*batch-1) }));
		act(() => void collection().filter({ "~label": "item" }));

		await vi.waitFor(() => expect(slices(lookup).at(-1)).toMatchObject({
			members: { "~label": "item", "@": 0, "#": 2*batch }
		}));

	});

});
