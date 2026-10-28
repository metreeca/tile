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
import { createMembers } from "./members.core.js";
import { useMembers } from "./members.js";


const batch = 10;


describe("createMembers()", () => {

	const members = () => createMembers({ order: { label: "asc" }, batch });


	describe("creation", () => {

		it("should start over the first batch", async () => {
			expect(members().limit).toBe(batch);
		});

		it("should retrieve the items in batches of the given size", async () => {
			expect(members().load().batch).toBe(batch);
		});

		it("should retrieve 100 items per batch by default", async () => {
			expect(createMembers().batch).toBe(100);
		});

		it("should sort the items as given", async () => {
			expect(members().order).toEqual({ label: "asc" });
		});

		it("should start unsorted by default", async () => {
			expect(createMembers().order).toEqual({});
		});

		it.each([0, -1, 1.5])("should reject a batch size of %s", async batch => {
			expect(() => createMembers({ batch })).toThrow(TypeError);
		});

	});

	describe("load()", () => {

		it("should retrieve one more batch", async () => {
			expect(members().load().load().limit).toBe(3*batch);
		});

	});

	describe("sort()", () => {

		it("should restart from the first batch in the new order", async () => {

			const sorted = members().load().sort({ label: "desc" });

			expect(sorted.order).toEqual({ label: "desc" });
			expect(sorted.limit).toBe(batch);

		});

		it("should replace the sort order rather than merge into it", async () => {
			expect(members().sort({ id: 1 }).order).toEqual({ id: 1 });
		});

		it("should leave the members as they stand where the order is unchanged", async () => {

			const initial = members().load();

			expect(initial.sort({ label: "asc" })).toBe(initial);

		});

	});

});


describe("useMembers()", () => {

	const entry = "https://example.com/catalogue/";

	const Item = resource({ id: id(), label: required(string()) });
	const Catalogue = resource({ id: id(), members: multiple(reference(Item)) });

	type Binding = ReturnType<typeof useMembers<typeof Catalogue, "members", { readonly label: {} }>>;


	function backend(lookup: unknown, observers: Set<() => void> = new Set()): Backend {
		return {
			lookup,
			observe: (observer: () => void) => {
				observers.add(observer);
				return () => observers.delete(observer);
			}
		} as unknown as Backend; // ;(test stub) only the members called
	}

	function items(size: number) {
		return Array.from({ length: size }, (_, index) => ({ id: `${entry}${index}`, label: `item ${index}` }));
	}

	/**
	 * A store holding as many items as given, handing out the page the model offset and limit ask for.
	 */
	function catalogue(size: number = batch/2) {
		return vi.fn(async ({ model }: { model: { members: { "@": number, "#": number } } }) => immutable({
			id: entry,
			members: items(size).slice(model.members["@"], model.members["@"]+model.members["#"])
		}));
	}

	function mount(lookup: unknown, criteria = {}): {

		collection: () => Collection<typeof Catalogue, "members">
		members: () => Binding

		signal(): void

	} {

		const observers = new Set<() => void>();

		const collections = vi.fn<(collection: Collection<typeof Catalogue, "members">) => void>();
		const bindings = vi.fn<(members: Binding) => void>();

		function Probe() {

			const collection = useCollection({ entry, shape: Catalogue, criteria });

			collections(collection);

			bindings(useMembers(collection, {
				model: { label: {} },
				order: { label: "asc" },
				batch
			}));

			return null;

		}

		act(() => render(createElement(Store, {
			factory: () => backend(lookup, observers),
			children: createElement(Probe, {})
		}), document.body));

		return {
			collection: () => collections.mock.lastCall![0], // test harness: Probe has rendered at least once
			members: () => bindings.mock.lastCall![0],
			signal: () => act(() => observers.forEach(observer => observer()))
		};
	}

	function models(lookup: ReturnType<typeof catalogue>) {
		return lookup.mock.calls.map(([{ model }]) => model);
	}

	function load(members: Binding) {
		return members({ ready: ({ load }) => load });
	}


	afterEach(async () => {
		act(() => render(null, document.body));
	});


	it("should retrieve the members narrowed by the collection, arranged by the view", async () => {

		const lookup = catalogue();
		const { collection } = mount(lookup, { "?university": ["u1"] });

		act(() => void collection().filter({ "~label": "item" }));

		await vi.waitFor(() => expect(models(lookup)).toContainEqual({
			members: {
				label: {},
				"?university": ["u1"], "~label": "item",
				"^label": "asc",
				"@": 0,
				"#": batch
			}
		}));

	});

	it("should throw outside a store context", async () => {

		function Probe() {

			useMembers(useCollection({ entry, shape: Catalogue }), { model: { label: {} } });

			return null;

		}

		expect(() => act(() => render(createElement(Probe, {}), document.body))).toThrow("missing <Store> context");

	});

	it("should be blank until the first batch is retrieved", async () => {

		const { members } = mount(vi.fn(() => new Promise(() => {})));

		expect(members()({ blank: "blank" })).toBe("blank");

	});

	it("should move to error on a failed retrieval, retrieving the members again on reload", async () => {

		const lookup = vi.fn().mockRejectedValueOnce({ status: 503 }).mockImplementation(catalogue());
		const { members } = mount(lookup);

		await vi.waitFor(() => expect(members()({ error: ({ state }) => state.status })).toBe(503));

		await act(() => members()({ error: ({ reload }) => reload() }));

		await vi.waitFor(() => expect(members()({ ready: ({ state }) => state })).toEqual(items(batch/2)));

	});

	it("should retrieve the members again as the store signals a change", async () => {

		const lookup = catalogue();
		const { members, signal } = mount(lookup);

		await vi.waitFor(() => expect(members()({ ready: () => true })).toBe(true));

		const calls = lookup.mock.calls.length;

		signal();

		await vi.waitFor(() => expect(lookup.mock.calls.length).toBeGreaterThan(calls));

	});

	it("should retrieve again every batch on show as the store signals a change", async () => {

		const lookup = catalogue(3*batch);
		const { members, signal } = mount(lookup);

		await vi.waitFor(() => expect(load(members())).toBeTypeOf("function"));

		act(() => load(members())!());

		await vi.waitFor(() => expect(members()({ ready: ({ state }) => state.length })).toBe(2*batch));

		const calls = lookup.mock.calls.length;

		signal();

		await vi.waitFor(() => expect(models(lookup).slice(calls)).toEqual([
			{ members: expect.objectContaining({ "@": 0, "#": batch }) },
			{ members: expect.objectContaining({ "@": batch, "#": batch }) }
		]));

		expect(members()({ ready: ({ state }) => state })).toEqual(items(2*batch));

	});

	it("should hand over the members retrieved", async () => {

		const { members } = mount(catalogue());

		await vi.waitFor(() => expect(members()({ ready: ({ state }) => state })).toEqual(items(batch/2)));

	});

	describe("load()", () => {

		it("should be offered while the last batch is full", async () => {

			const { members } = mount(catalogue(3*batch));

			await vi.waitFor(() => expect(load(members())).toBeTypeOf("function"));

		});

		it("should be withheld once the collection is exhausted", async () => {

			const { members } = mount(catalogue(batch/2));

			await vi.waitFor(() => expect(members()({ ready: () => true })).toBe(true));

			expect(load(members())).toBeUndefined();

		});

		it("should retrieve the next batch alone, appending it to the items on show", async () => {

			const lookup = catalogue(3*batch);
			const { members } = mount(lookup);

			await vi.waitFor(() => expect(load(members())).toBeTypeOf("function"));

			const calls = lookup.mock.calls.length;

			act(() => load(members())!());

			await vi.waitFor(() => expect(members()({ ready: ({ state }) => state })).toEqual(items(2*batch)));

			expect(models(lookup).slice(calls)).toEqual([
				{ members: expect.objectContaining({ "@": batch, "#": batch }) }
			]);

		});

		it("should be withheld once a batch comes back short", async () => {

			const { members } = mount(catalogue(batch+batch/2));

			await vi.waitFor(() => expect(load(members())).toBeTypeOf("function"));

			act(() => load(members())!());

			await vi.waitFor(() => expect(members()({ ready: ({ state }) => state.length })).toBe(batch+batch/2));

			expect(load(members())).toBeUndefined();

		});

		it("should stay on offer while the next batch is retrieved, asking for nothing more", async () => {

			const lookup = vi.fn().mockImplementationOnce(catalogue(3*batch)).mockImplementation(() => new Promise(() => {}));

			const { members } = mount(lookup);

			await vi.waitFor(() => expect(load(members())).toBeTypeOf("function"));

			await act(async () => load(members())!()); // the members notify their change in a microtask
			await act(async () => load(members())!());

			expect(members()({ ready: ({ state }) => state.length })).toBe(batch);
			expect(models(lookup).slice(1)).toEqual([
				{ members: expect.objectContaining({ "@": batch, "#": batch }) }
			]);

		});

	});

	it("should sort the items again from the first batch", async () => {

		const lookup = catalogue(3*batch);
		const { members } = mount(lookup);

		await vi.waitFor(() => expect(load(members())).toBeTypeOf("function"));

		act(() => load(members())!());
		act(() => members()({ ready: ({ sort }) => sort({ label: "desc" }) }));

		await vi.waitFor(() => expect(models(lookup).at(-1)).toMatchObject({
			members: { "^label": "desc", "@": 0, "#": batch }
		}));

	});

	it("should start again from the first batch as the criteria change", async () => {

		const lookup = catalogue(3*batch);
		const { collection, members } = mount(lookup);

		await vi.waitFor(() => expect(load(members())).toBeTypeOf("function"));

		act(() => load(members())!());
		act(() => void collection().filter({ "~label": "item" }));

		await vi.waitFor(() => expect(models(lookup).at(-1)).toMatchObject({
			members: { "~label": "item", "@": 0, "#": batch }
		}));

	});

});
