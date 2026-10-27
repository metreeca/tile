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
import { Conflict, NotFound } from "@metreeca/http";
import type { Store as Backend } from "@metreeca/keep";
import { createElement, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useCollection } from "./collection.js";
import { Store } from "./index.js";
import { useMembers } from "./members.js";


const entry = "https://example.com/catalogue/";

const Item = resource({ id: id(), label: required(string()) });
const Catalogue = resource({ id: id(), members: multiple(reference(Item)) });


describe("useMembers()", () => {

	type Members = ReturnType<typeof useMembers<typeof Catalogue, "members">>;


	function backend(overrides: { readonly [K in keyof Backend]?: unknown }): Backend {
		return {
			lookup: async () => undefined,
			observe: () => () => {},
			...overrides
		} as Backend; // ;(cast) test mock: only the members the hook calls are provided
	}

	function mount(store: Backend): () => Members {

		const seen = vi.fn<(members: Members) => void>();

		function Probe() {

			seen(useMembers(useCollection({ entry, shape: Catalogue })));

			return null;

		}

		act(() => render(createElement(Store, {
			factory: () => store,
			children: createElement(Probe, {})
		}), document.body));

		return () => seen.mock.lastCall![0]; // test harness: Probe has rendered at least once
	}


	afterEach(async () => {
		act(() => render(null, document.body));
	});


	it("should throw outside a store context", async () => {

		function Probe() {

			useMembers(useCollection({ entry, shape: Catalogue }));

			return null;

		}

		expect(() => act(() => render(createElement(Probe, {}), document.body))).toThrow("missing <Store> context");

	});

	describe("create()", () => {

		const item = { label: "two" };
		const location = "https://example.com/catalogue/2";

		it("should add the item to the collection, resolving to its identifier", async () => {

			const create = vi.fn(async () => location);

			await expect(mount(backend({ create }))().create(item)).resolves.toBe(location);

			expect(create).toHaveBeenCalledWith({ entry, shape: Catalogue, model: { members: {} }, state: item });

		});

		it("should reject on an existing item", async () => {
			await expect(mount(backend({ create: async () => undefined }))().create(item))
				.rejects.toMatchObject({ status: Conflict });
		});

		it("should reject on a failed creation", async () => {
			await expect(mount(backend({ create: async () => { throw { status: 422 }; } }))().create(item))
				.rejects.toMatchObject({ status: 422 });
		});

	});

	describe("delete()", () => {

		const one = "https://example.com/catalogue/1";
		const two = "https://example.com/catalogue/2";

		it("should remove an item, resolving its identifier against the collection", async () => {

			const remove = vi.fn(async ({ entry }: { entry: string }) => entry);

			await expect(mount(backend({ delete: remove }))().delete("1")).resolves.toEqual([one]);

			expect(remove).toHaveBeenCalledWith(expect.objectContaining({ entry: one }));

		});

		it("should remove the items given, resolving to their identifiers in order", async () => {

			const remove = vi.fn(async ({ entry }: { entry: string }) => entry);

			await expect(mount(backend({ delete: remove }))().delete(["1", two])).resolves.toEqual([one, two]);

			expect(remove).toHaveBeenCalledTimes(2);

		});

		it("should check removed items against the item shape", async () => {

			const remove = vi.fn(async ({ entry }: { entry: string }) => entry);

			await mount(backend({ delete: remove }))().delete("1");

			expect(remove.mock.lastCall?.[0]).toMatchObject({ shape: { members: { label: {} } } });

		});

		it("should resolve to no identifier for no item", async () => {

			const remove = vi.fn(async ({ entry }: { entry: string }) => entry);

			await expect(mount(backend({ delete: remove }))().delete([])).resolves.toEqual([]);

			expect(remove).not.toHaveBeenCalled();

		});

		it("should reject on a missing item", async () => {
			await expect(mount(backend({ delete: async () => undefined }))().delete("1"))
				.rejects.toMatchObject({ status: NotFound });
		});

		it("should reject on a failed removal", async () => {
			await expect(mount(backend({ delete: async () => { throw { status: 422 }; } }))().delete("1"))
				.rejects.toMatchObject({ status: 422 });
		});

	});

});
