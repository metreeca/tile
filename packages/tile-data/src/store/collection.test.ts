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
import { id, multiple, optional, required, resource } from "@metreeca/blue/resource";
import { string } from "@metreeca/blue/string";
import { union } from "@metreeca/blue/union";
import type { Store as Backend } from "@metreeca/keep";
import { createElement, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { type Collection, createCollection } from "./collection.core.js";
import { useCollection } from "./collection.js";
import { Store } from "./index.js";


const entry = "https://example.com/catalogue/";

const Item = resource({ id: id(), label: required(string()) });
const Other = resource({ id: id(), title: required(string()) });

const Catalogue = resource({

	id: id(),

	members: multiple(reference(Item)),
	featured: optional(reference(Item)),
	tags: multiple(string())

});


describe("createCollection()", () => {

	describe("target", () => {

		it("should take the only collection of resources as the collecting property", async () => {
			expect(createCollection({ entry, shape: Catalogue }).target.field).toBe("members");
		});

		it("should take embedded collections and union collections of resources alike", async () => {

			const Embedded = resource({ id: id(), members: multiple(Item), tags: multiple(string()) });
			const Mixed = resource({ id: id(), members: multiple(union(reference(Item), reference(Other))) });

			expect(createCollection({ entry, shape: Embedded }).target.field).toBe("members");
			expect(createCollection({ entry, shape: Mixed }).target.field).toBe("members");

		});

		it("should count inherited collections", async () => {

			const Archive = resource(Catalogue, { id: id() });

			expect(createCollection({ entry, shape: Archive }).target.field).toBe("members");

		});

		it("should pass over a union collection admitting literals", async () => {

			const Loose = resource({ id: id(), members: multiple(reference(Item)), notes: multiple(union(reference(Item), string())) });

			expect(createCollection({ entry, shape: Loose }).target.field).toBe("members");

		});

		it("should take the collecting property as given", async () => {

			const Shelves = resource({ id: id(), members: multiple(reference(Item)), archive: multiple(Item) });

			expect(createCollection({ entry, shape: Shelves, field: "archive" }).target.field).toBe("archive");

		});

		it("should reject a shape holding no collection of resources", async () => {

			const Labels = resource({ id: id(), tags: multiple(string()) });

			expect(() => createCollection({ entry, shape: Labels })).toThrow(TypeError);

		});

		it("should reject a shape holding several collections of resources", async () => {

			const Shelves = resource({ id: id(), members: multiple(reference(Item)), archive: multiple(Item) });

			expect(() => createCollection({ entry, shape: Shelves })).toThrow(TypeError);

		});

	});

	describe("criteria", () => {

		it("should start from no criterion by default", async () => {

			const collection = createCollection({ entry, shape: Catalogue });

			expect(collection.scope).toEqual({});
			expect(collection.sieve).toEqual({});

		});

		it("should start from the criteria given", async () => {

			const collection = createCollection({
				entry,
				shape: Catalogue,
				scope: { "?university": ["https://example.com/u/1"] },
				sieve: { "~label": "chemistry" }
			});

			expect(collection.scope).toEqual({ "?university": ["https://example.com/u/1"] });
			expect(collection.sieve).toEqual({ "~label": "chemistry" });

		});

		it.each([
			["order", { "^label": 1 }],
			["focus", { "+label": ["one"] }]
		])("should reject %s criteria in the scope or the reader's criteria", async (_, criteria) => {
			expect(() => createCollection({ entry, shape: Catalogue, scope: criteria })).toThrow(TypeError);
			expect(() => createCollection({ entry, shape: Catalogue, sieve: criteria })).toThrow(TypeError);
		});

	});

	describe("filter()", () => {

		const chemistry = () => createCollection({ entry, shape: Catalogue, sieve: { "~label": "chemistry" } });

		it("should merge criteria into the reader's ones", async () => {
			expect(chemistry().filter({ ">=credits": 6 }).sieve).toEqual({ "~label": "chemistry", ">=credits": 6 });
		});

		it("should replace a criterion on the same key", async () => {
			expect(chemistry().filter({ "~label": "physics" }).sieve).toEqual({ "~label": "physics" });
		});

		it("should remove a criterion set to undefined", async () => {
			expect(chemistry().filter({ "~label": undefined }).sieve).toEqual({});
		});

		it("should leave the collection as it stands where nothing changes", async () => {

			const collection = chemistry();

			expect(collection.filter({ "~label": "chemistry", ">=credits": undefined })).toBe(collection);

		});

		it("should compare criteria by content", async () => {

			const selected = chemistry().filter({ "?university": ["https://example.com/u/1"] });

			expect(selected.filter({ "?university": ["https://example.com/u/1"] })).toBe(selected);

		});

		it("should leave the scope in place", async () => {

			const scoped = createCollection({ entry, shape: Catalogue, scope: { "?university": ["u"] } });

			expect(scoped.filter({ "~label": "chemistry" }).scope).toEqual({ "?university": ["u"] });

		});

		it.each([
			["order", { "^label": 1 }],
			["focus", { "+label": ["one"] }]
		])("should reject %s criteria", async (_, criteria) => {
			expect(() => chemistry().filter(criteria)).toThrow(TypeError);
		});

	});

	describe("clear()", () => {

		it("should remove every criterion the reader set, leaving the scope in place", async () => {

			const collection = createCollection({
				entry,
				shape: Catalogue,
				scope: { "?university": ["u"] },
				sieve: { "~label": "chemistry" }
			});

			const cleared = collection.clear();

			expect(cleared.sieve).toEqual({});
			expect(cleared.scope).toEqual({ "?university": ["u"] });

		});

		it("should leave the collection as it stands where the reader set no criterion", async () => {

			const collection = createCollection({ entry, shape: Catalogue });

			expect(collection.clear()).toBe(collection);

		});

	});

});


describe("useCollection()", () => {

	function backend(overrides: { readonly [K in keyof Backend]?: unknown }): Backend {
		return {
			lookup: async () => undefined,
			observe: () => () => {},
			...overrides
		} as Backend; // ;(cast) test mock: only the members the hook calls are provided
	}

	function mount(store: Backend, target: string = entry): () => Collection<typeof Catalogue, "members"> {

		const seen = vi.fn<(collection: Collection<typeof Catalogue, "members">) => void>();

		function Probe() {

			const collection = useCollection({ entry: target, shape: Catalogue });

			seen(collection);

			return createElement("output", {}, JSON.stringify(collection.sieve));

		}

		act(() => render(createElement(Store, {
			factory: () => store,
			children: createElement(Probe, {})
		}), document.body));

		return () => seen.mock.lastCall![0]; // test harness: Probe has rendered at least once
	}

	async function settled(expected: string): Promise<void> {
		await vi.waitFor(() => expect(document.body.textContent).toBe(expected));
	}


	afterEach(async () => {
		act(() => render(null, document.body));
		vi.unstubAllGlobals();
	});


	it("should resolve a relative identifier against the current location", async () => {

		vi.stubGlobal("location", new URL("https://example.com/catalogue/"));

		expect(mount(backend({}), "../other/")().target.entry).toBe("https://example.com/other/");

	});

	it("should hand over the target and the criteria", async () => {

		const collection = mount(backend({}))();

		expect(collection.target).toEqual({ entry, shape: Catalogue, field: "members" });
		expect(collection.target.shape).toBe(Catalogue);
		expect(collection.scope).toEqual({});
		expect(collection.sieve).toEqual({});

	});

	it("should render again as the reader's criteria are revised", async () => {

		const collection = mount(backend({}));

		act(() => void collection().filter({ "~label": "chemistry" }));

		await settled(JSON.stringify({ "~label": "chemistry" }));

		act(() => void collection().clear());

		await settled(JSON.stringify({}));

	});

});
