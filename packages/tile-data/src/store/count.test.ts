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
import type { Relay } from "@metreeca/core/relay";
import { immutable } from "@metreeca/core/values";
import type { Store as Backend } from "@metreeca/keep";
import { createElement, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { type Collection } from "./collection.core.js";
import { useCollection } from "./collection.js";
import { Store } from "./index.js";
import { type CountCases, useCount } from "./count.js";


describe("useCount()", () => {

	const entry = "https://example.com/catalogue/";

	const Item = resource({ id: id(), label: required(string()) });
	const Catalogue = resource({ id: id(), members: multiple(reference(Item)) });


	function backend(lookup: unknown, observe: unknown = () => () => {}): Backend {
		return { lookup, observe } as unknown as Backend; // ;(test stub) only the members called
	}

	function counting(count: number) {
		return vi.fn(async () => immutable({ id: entry, members: [{ count }] }));
	}

	function mount(store: Backend, scope = {}): {

		collection: () => Collection<typeof Catalogue, "members">
		count: () => Relay<CountCases>

	} {

		const collections = vi.fn<(collection: Collection<typeof Catalogue, "members">) => void>();
		const counts = vi.fn<(count: Relay<CountCases>) => void>();

		function Probe() {

			const collection = useCollection({ entry, shape: Catalogue, scope });

			collections(collection);
			counts(useCount(collection));

			return null;

		}

		act(() => render(createElement(Store, {
			factory: () => store,
			children: createElement(Probe, {})
		}), document.body));

		return {
			collection: () => collections.mock.lastCall![0], // test harness: Probe has rendered at least once
			count: () => counts.mock.lastCall![0]
		};
	}


	afterEach(async () => {
		act(() => render(null, document.body));
	});


	it("should count the items the collection criteria let through", async () => {

		const lookup = counting(3);
		const { collection } = mount(backend(lookup), { "?university": ["u1"] });

		act(() => void collection().filter({ "~label": "item" }));

		await vi.waitFor(() => expect(lookup).toHaveBeenCalledWith(expect.objectContaining({
			entry,
			model: { members: { "?university": ["u1"], "~label": "item", "count=count:": {} } }
		})));

	});

	it("should hand over the count", async () => {

		const { count } = mount(backend(counting(3)));

		await vi.waitFor(() => expect(count()({ ready: ({ state }) => state })).toBe(3));

	});

	it("should count nothing where the store holds no items", async () => {

		const { count } = mount(backend(vi.fn(async () => immutable({ id: entry, members: [] }))));

		await vi.waitFor(() => expect(count()({ ready: ({ state }) => state })).toBe(0));

	});

	it("should be blank until the items are first counted", async () => {

		const { count } = mount(backend(vi.fn(() => new Promise(() => {}))));

		expect(count()({ blank: "blank" })).toBe("blank");

	});

	it("should move to error on a failed count, counting again on reload", async () => {

		const lookup = vi.fn().mockRejectedValueOnce({ status: 503 }).mockImplementation(counting(3));
		const { count } = mount(backend(lookup));

		await vi.waitFor(() => expect(count()({ error: ({ state }) => state.status })).toBe(503));

		await act(() => count()({ error: ({ reload }) => reload() }));

		await vi.waitFor(() => expect(count()({ ready: ({ state }) => state })).toBe(3));

	});

	it("should count again as the store signals a change", async () => {

		const observers: (() => void)[] = [];
		const lookup = counting(3);

		const { count } = mount(backend(lookup, (observer: () => void) => {
			observers.push(observer);
			return () => {};
		}));

		await vi.waitFor(() => expect(count()({ ready: () => true })).toBe(true));

		const calls = lookup.mock.calls.length;

		act(() => observers.forEach(observer => observer()));

		await vi.waitFor(() => expect(lookup.mock.calls.length).toBeGreaterThan(calls));

	});

	it("should throw outside a store context", async () => {

		function Probe() {

			useCount(useCollection({ entry, shape: Catalogue }));

			return null;

		}

		expect(() => act(() => render(createElement(Probe, {}), document.body))).toThrow("missing <Store> context");

	});

});
