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

import { number } from "@metreeca/blue/number";
import { reference } from "@metreeca/blue/reference";
import { id, multiple, required, resource } from "@metreeca/blue/resource";
import type { Relay } from "@metreeca/core/relay";
import { immutable } from "@metreeca/core/values";
import type { Store as Backend } from "@metreeca/keep";
import type { Criteria } from "@metreeca/qest/model";
import { createElement, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { type Collection } from "./collection.core.js";
import { useCollection } from "./collection.js";
import { Store } from "./index.js";
import { type RangeCases, useRange } from "./range.js";


describe("useRange()", () => {

	const entry = "https://example.com/catalogue/";

	const Item = resource({ id: id(), year: required(number()) });
	const Catalogue = resource({ id: id(), members: multiple(reference(Item)) });


	function backend(lookup: unknown, observe: unknown = () => () => {}): Backend {
		return { lookup, observe } as unknown as Backend; // ;(test stub) only the members called
	}

	function spanning(min: number, max: number) {
		return vi.fn(async () => immutable({ id: entry, members: [{ min, max }] }));
	}

	function mount(store: Backend, { scope = {}, sieve = {} }: {

		readonly scope?: Criteria
		readonly sieve?: Criteria

	} = {}): {

		collection: () => Collection<typeof Catalogue, "members">
		range: () => Relay<RangeCases>

	} {

		const collections = vi.fn<(collection: Collection<typeof Catalogue, "members">) => void>();
		const ranges = vi.fn<(range: Relay<RangeCases>) => void>();

		function Probe() {

			const collection = useCollection({ entry, shape: Catalogue, scope, sieve });

			collections(collection);
			ranges(useRange(collection, "year"));

			return null;

		}

		act(() => render(createElement(Store, {
			factory: () => store,
			children: createElement(Probe, {})
		}), document.body));

		return {
			collection: () => collections.mock.lastCall![0], // test harness: Probe has rendered at least once
			range: () => ranges.mock.lastCall![0]
		};
	}


	afterEach(async () => {
		act(() => render(null, document.body));
	});


	it("should retrieve the range of the items the collection criteria let through, its own bounds included", async () => {

		const lookup = spanning(1, 9);

		mount(backend(lookup), { scope: { "?university": ["u1"] }, sieve: { ">=year": 3 } });

		await vi.waitFor(() => expect(lookup).toHaveBeenCalledWith(expect.objectContaining({
			entry,
			model: {
				members: {
					"?university": ["u1"], ">=year": 3,
					"min=min:year": {}, "max=max:year": {}
				}
			}
		})));

	});

	it("should hand over the lowest and highest values", async () => {

		const { range } = mount(backend(spanning(1, 9)));

		await vi.waitFor(() => expect(range()({ ready: ({ state }) => state })).toEqual({ min: 1, max: 9 }));

	});

	it("should hand over no values where the collection holds no items", async () => {

		const { range } = mount(backend(vi.fn(async () => immutable({ id: entry, members: [] }))));

		await vi.waitFor(() => expect(range()({ ready: ({ state }) => state })).toEqual({
			min: undefined,
			max: undefined
		}));

	});

	it("should hand over the bounds narrowing the collection", async () => {

		const { range } = mount(backend(spanning(1, 9)), { sieve: { ">=year": 3, "<=year": 7 } });

		await vi.waitFor(() => expect(range()({ ready: ({ lower, upper }) => [lower, upper] })).toEqual([3, 7]));

	});

	describe("narrow()", () => {

		it("should set the bounds given", async () => {

			const { collection, range } = mount(backend(spanning(1, 9)), { sieve: { "?university": ["u1"] } });

			await vi.waitFor(() => expect(range()({ ready: () => true })).toBe(true));

			act(() => range()({ ready: ({ narrow }) => narrow({ lower: 3, upper: 7 }) }));

			await vi.waitFor(() => expect(collection().sieve).toEqual({
				"?university": ["u1"], ">=year": 3, "<=year": 7
			}));

		});

		it("should leave a bound left undefined as it stands", async () => {

			const { collection, range } = mount(backend(spanning(1, 9)), { sieve: { ">=year": 3, "<=year": 7 } });

			await vi.waitFor(() => expect(range()({ ready: () => true })).toBe(true));

			act(() => range()({ ready: ({ narrow }) => narrow({ upper: 8 }) }));

			await vi.waitFor(() => expect(collection().sieve).toEqual({ ">=year": 3, "<=year": 8 }));

		});

		it("should remove a bound set to null", async () => {

			const { collection, range } = mount(backend(spanning(1, 9)), { sieve: { ">=year": 3, "<=year": 7 } });

			await vi.waitFor(() => expect(range()({ ready: () => true })).toBe(true));

			act(() => range()({ ready: ({ narrow }) => narrow({ lower: null }) }));

			await vi.waitFor(() => expect(collection().sieve).toEqual({ "<=year": 7 }));

		});

	});

	describe("clear()", () => {

		it("should remove both bounds, leaving the other criteria in place", async () => {

			const { collection, range } = mount(backend(spanning(1, 9)), {
				sieve: { "?university": ["u1"], ">=year": 3, "<=year": 7 }
			});

			await vi.waitFor(() => expect(range()({ ready: () => true })).toBe(true));

			act(() => range()({ ready: ({ clear }) => clear() }));

			await vi.waitFor(() => expect(collection().sieve).toEqual({ "?university": ["u1"] }));

		});

	});

	it("should be blank until the range is first retrieved", async () => {

		const { range } = mount(backend(vi.fn(() => new Promise(() => {}))));

		expect(range()({ blank: "blank" })).toBe("blank");

	});

	it("should move to error on a failed retrieval, retrieving the range again on reload", async () => {

		const lookup = vi.fn().mockRejectedValueOnce({ status: 503 }).mockImplementation(spanning(1, 9));
		const { range } = mount(backend(lookup));

		await vi.waitFor(() => expect(range()({ error: ({ state }) => state.status })).toBe(503));

		await act(() => range()({ error: ({ reload }) => reload() }));

		await vi.waitFor(() => expect(range()({ ready: ({ state }) => state })).toEqual({ min: 1, max: 9 }));

	});

	it("should throw outside a store context", async () => {

		function Probe() {

			useRange(useCollection({ entry, shape: Catalogue }), "year");

			return null;

		}

		expect(() => act(() => render(createElement(Probe, {}), document.body))).toThrow("missing <Store> context");

	});

});
