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


	function backend(lookup: unknown): Backend {
		return { lookup, observe: () => () => {} } as unknown as Backend; // ;(test stub) only the members called
	}

	function items(size: number) {
		return Array.from({ length: size }, (_, index) => ({ id: `${entry}${index}`, label: `item ${index}` }));
	}

	function catalogue(size: number = batch/2) {
		return vi.fn(async ({ model }: { model: { members: { "#": number } } }) => immutable({
			id: entry,
			members: items(Math.min(size, model.members["#"]))
		}));
	}

	function mount(lookup: unknown, scope = {}): {

		collection: () => Collection<typeof Catalogue, "members">
		members: () => Binding

	} {

		const collections = vi.fn<(collection: Collection<typeof Catalogue, "members">) => void>();
		const bindings = vi.fn<(members: Binding) => void>();

		function Probe() {

			const collection = useCollection({ entry, shape: Catalogue, scope });

			collections(collection);

			bindings(useMembers(collection, {
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
			members: () => bindings.mock.lastCall![0]
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

		const observers: (() => void)[] = [];
		const lookup = catalogue();

		const store = {
			lookup,
			observe: (observer: () => void) => { observers.push(observer); return () => {}; }
		} as unknown as Backend; // ;(test stub) only the members called

		const bindings = vi.fn<(members: Binding) => void>();

		function Probe() {
			bindings(useMembers(useCollection({ entry, shape: Catalogue }), { model: { label: {} }, batch }));
			return null;
		}

		act(() => render(createElement(Store, {
			factory: () => store,
			children: createElement(Probe, {})
		}), document.body));

		await vi.waitFor(() => expect(bindings.mock.lastCall![0]({ ready: () => true })).toBe(true));

		const calls = lookup.mock.calls.length;

		act(() => observers.forEach(observer => observer()));

		await vi.waitFor(() => expect(lookup.mock.calls.length).toBeGreaterThan(calls));

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

		it("should retrieve one more batch", async () => {

			const lookup = catalogue(3*batch);
			const { members } = mount(lookup);

			await vi.waitFor(() => expect(load(members())).toBeTypeOf("function"));

			act(() => load(members())!());

			await vi.waitFor(() => expect(members()({ ready: ({ state }) => state.length })).toBe(2*batch));

			expect(models(lookup).at(-1)).toMatchObject({ members: { "#": 2*batch } });

		});

		it("should stay on offer while the next batch is retrieved, asking for nothing more", async () => {

			const lookup = vi.fn().mockImplementationOnce(catalogue(3*batch)).mockImplementation(() => new Promise(() => {}));

			const { members } = mount(lookup);

			await vi.waitFor(() => expect(load(members())).toBeTypeOf("function"));

			await act(async () => load(members())!()); // the members notify their change in a microtask
			await act(async () => load(members())!());

			expect(members()({ ready: ({ state }) => state.length })).toBe(batch);
			expect(models(lookup).at(-1)).toMatchObject({ members: { "#": 2*batch } });

		});

	});

	it("should sort the items again from the first batch", async () => {

		const lookup = catalogue(3*batch);
		const { members } = mount(lookup);

		await vi.waitFor(() => expect(load(members())).toBeTypeOf("function"));

		act(() => load(members())!());
		act(() => members()({ ready: ({ sort }) => sort({ label: "desc" }) }));

		await vi.waitFor(() => expect(models(lookup).at(-1)).toMatchObject({
			members: { "^label": "desc", "#": batch }
		}));

	});

	it("should start again from the first batch as the sieve changes", async () => {

		const lookup = catalogue(3*batch);
		const { collection, members } = mount(lookup);

		await vi.waitFor(() => expect(load(members())).toBeTypeOf("function"));

		act(() => load(members())!());
		act(() => void collection().filter({ "~label": "item" }));

		await vi.waitFor(() => expect(models(lookup).at(-1)).toMatchObject({
			members: { "~label": "item", "#": batch }
		}));

	});

});
