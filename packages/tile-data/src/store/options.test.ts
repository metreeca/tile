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
import type { Criteria, Template } from "@metreeca/qest/model";
import { createElement, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { type Collection } from "./collection.core.js";
import { useCollection } from "./collection.js";
import { Store } from "./index.js";
import { createOptions } from "./options.core.js";
import { type OptionsCases, useOptions } from "./options.js";


describe("createOptions()", () => {

	describe("creation", () => {

		it("should start with no keywords from the first option, showing them all by default", async () => {

			const options = createOptions();

			expect([options.keywords, options.offset, options.limit]).toEqual(["", 0, 0]);

		});

		it("should show as many options as given", async () => {
			expect(createOptions({ size: 10 }).limit).toBe(10);
		});

	});

	describe("search()", () => {

		it("should narrow the options by keywords, leaving the page as it stands", async () => {

			const options = createOptions().seek(20).search("item");

			expect([options.keywords, options.offset]).toEqual(["item", 20]);

		});

		it("should show the options from the first one again on empty keywords", async () => {

			const options = createOptions().search("item").seek(20).search("");

			expect([options.keywords, options.offset]).toEqual(["", 0]);

		});

	});

	describe("seek()", () => {

		it("should move the options on show", async () => {
			expect(createOptions().seek(20).offset).toBe(20);
		});

		it("should take a negative index for the first option", async () => {
			expect(createOptions().seek(-5).offset).toBe(0);
		});

	});

	describe("resize()", () => {

		it("should resize the options on show", async () => {
			expect(createOptions().resize(5).limit).toBe(5);
		});

		it("should take a negative number for all the options", async () => {
			expect(createOptions({ size: 10 }).resize(-5).limit).toBe(0);
		});

	});

	describe("reset()", () => {

		it("should show the options as they stood when created", async () => {

			const options = createOptions({ size: 10 }).search("item").seek(20).resize(5).reset();

			expect([options.keywords, options.offset, options.limit]).toEqual(["", 0, 10]);

		});

	});

});


describe("useOptions()", () => {

	const entry = "https://example.com/catalogue/";

	const Item = resource({ id: id(), category: required(string()) });
	const Catalogue = resource({ id: id(), members: multiple(reference(Item)) });

	type Members = { readonly members: { readonly [key: string]: unknown } };


	function backend(lookup: unknown, observe: unknown = () => () => {}): Backend {
		return { lookup, observe } as unknown as Backend; // ;(test stub) only the members called
	}

	/**
	 * A store answering the options retrieved under the scope alone with `baseline`, and those retrieved under the
	 * `?region` criterion too with `matching`.
	 */
	function options(
		baseline: readonly { value: string, count: number }[],
		matching: readonly { value: string, count: number }[] = baseline
	) {
		return vi.fn(async ({ model }: { model: Members }) => immutable({
			id: entry,
			members: "?region" in model.members ? matching : baseline
		}));
	}

	function models(lookup: ReturnType<typeof options>) {
		return lookup.mock.calls.map(([{ model }]) => model);
	}

	function mount(store: Backend, { scope = {}, sieve = {}, model, text, size }: {

		readonly scope?: Criteria
		readonly sieve?: Criteria

		readonly model?: Template
		readonly text?: string
		readonly size?: number

	} = {}): {

		collection: () => Collection<typeof Catalogue, "members">
		options: () => Relay<OptionsCases>

	} {

		const collections = vi.fn<(collection: Collection<typeof Catalogue, "members">) => void>();
		const bindings = vi.fn<(options: Relay<OptionsCases>) => void>();

		function Probe() {

			const collection = useCollection({ entry, shape: Catalogue, scope, sieve });

			collections(collection);
			bindings(useOptions(collection, "category", {
				...(model ? { model } : {}),
				...(text ? { text } : {}),
				...(size ? { size } : {})
			}));

			return null;

		}

		act(() => render(createElement(Store, {
			factory: () => store,
			children: createElement(Probe, {})
		}), document.body));

		return {
			collection: () => collections.mock.lastCall![0], // test harness: Probe has rendered at least once
			options: () => bindings.mock.lastCall![0]
		};
	}

	async function ready(options: () => Relay<OptionsCases>): Promise<void> {
		await vi.waitFor(() => expect(options()({ ready: () => true })).toBe(true));
	}


	afterEach(async () => {
		act(() => render(null, document.body));
	});


	describe("retrieval", () => {

		it("should retrieve the options under the collection scope alone", async () => {

			const lookup = options([]);

			mount(backend(lookup), { scope: { "?university": ["u1"] }, sieve: { "?region": ["r1"] } });

			await vi.waitFor(() => expect(models(lookup)).toContainEqual({
				members: {
					"?university": ["u1"],
					"value=category": {}, "count=count:": {},
					"^count:": -2,
					"@": 0, "#": 0
				}
			}));

		});

		it("should retrieve the options under the collection criteria other than their own", async () => {

			const lookup = options([]);

			mount(backend(lookup), {
				scope: { "?university": ["u1"] },
				sieve: { "?region": ["r1"], "?category": ["c1"] }
			});

			await vi.waitFor(() => expect(models(lookup)).toContainEqual({
				members: {
					"?university": ["u1"], "?region": ["r1"],
					"value=category": {}, "count=count:": {},
					"^count:": -2, "+category": ["c1"],
					"@": 0, "#": 0
				}
			}));

		});

		it("should keep the selected options on top", async () => {

			const lookup = options([]);

			mount(backend(lookup), { sieve: { "?category": ["c1", "c2"] } });

			await vi.waitFor(() => expect(models(lookup)).toContainEqual({
				members: expect.objectContaining({ "+category": ["c1", "c2"] })
			}));

		});

		it("should retrieve the values the option model asks for", async () => {

			const lookup = options([]);

			mount(backend(lookup), { model: { id: {}, label: {} } });

			await vi.waitFor(() => expect(models(lookup)).toContainEqual({
				members: expect.objectContaining({ "frame=category": { id: {}, label: {} } })
			}));

		});

		it("should narrow the options by keywords matched against the expression", async () => {

			const lookup = options([]);
			const { options: binding } = mount(backend(lookup));

			await ready(binding);

			act(() => binding()({ ready: ({ search }) => search("art") }));

			await vi.waitFor(() => expect(models(lookup).at(-1)).toMatchObject({
				members: { "~category": "art" }
			}));

		});

		it("should narrow the options by keywords matched against the text expression, if given", async () => {

			const lookup = options([]);
			const { options: binding } = mount(backend(lookup), { text: "category.label" });

			await ready(binding);

			act(() => binding()({ ready: ({ search }) => search("art") }));

			await vi.waitFor(() => expect(models(lookup).at(-1)).toMatchObject({
				members: { "~category.label": "art" }
			}));

		});

		it("should retrieve one option past the page to tell whether more follow", async () => {

			const lookup = options([]);
			const { options: binding } = mount(backend(lookup), { size: 10 });

			await ready(binding);

			act(() => binding()({ ready: ({ seek }) => seek(20) }));

			await vi.waitFor(() => expect(models(lookup).at(-1)).toMatchObject({
				members: { "@": 20, "#": 11 }
			}));

		});

	});

	describe("state", () => {

		it("should list the selected options first, then the others, those the other criteria let through first", async () => {

			const { options: binding } = mount(backend(options(
				[{ value: "a", count: 9 }, { value: "b", count: 8 }, { value: "c", count: 7 }, { value: "d", count: 6 }],
				[{ value: "b", count: 5 }, { value: "c", count: 2 }]
			)), { sieve: { "?region": ["r1"], "?category": ["a", "b"] } });

			await vi.waitFor(() => expect(binding()({ ready: ({ state }) => state })).toEqual([
				{ value: "b", count: 5, selected: true },
				{ value: "a", count: 0, selected: true },
				{ value: "c", count: 2, selected: false },
				{ value: "d", count: 0, selected: false }
			]));

		});

		it("should hand over the values the option model asks for", async () => {

			const { options: binding } = mount(backend(vi.fn(async () => immutable({
				id: entry,
				members: [{ value: "https://example.com/c1", frame: { id: "https://example.com/c1", label: "C1" }, count: 3 }]
			}))), { model: { id: {}, label: {} } });

			await vi.waitFor(() => expect(binding()({ ready: ({ state }) => state })).toEqual([{
				value: "https://example.com/c1",
				frame: { id: "https://example.com/c1", label: "C1" },
				count: 3,
				selected: false
			}]));

		});

		it("should tell whether more options follow the ones on show", async () => {

			const { options: binding } = mount(backend(options([
				{ value: "a", count: 3 }, { value: "b", count: 2 }, { value: "c", count: 1 }
			])), { size: 2 });

			await vi.waitFor(() => expect(binding()({ ready: ({ state, more }) => ({ state, more }) })).toEqual({
				state: [{ value: "a", count: 3, selected: false }, { value: "b", count: 2, selected: false }],
				more: true
			}));

		});

	});

	describe("select()", () => {

		it("should narrow the collection to the items holding the selected values", async () => {

			const { collection, options: binding } = mount(backend(options([])), { sieve: { "?category": ["a"] } });

			await ready(binding);

			act(() => binding()({ ready: ({ select }) => select("b", true) }));

			await vi.waitFor(() => expect(collection().sieve).toEqual({ "?category": ["a", "b"] }));

		});

		it("should stop narrowing the collection once no value is selected", async () => {

			const { collection, options: binding } = mount(backend(options([])), {
				sieve: { "?region": ["r1"], "?category": ["a"] }
			});

			await ready(binding);

			act(() => binding()({ ready: ({ select }) => select("a", false) }));

			await vi.waitFor(() => expect(collection().sieve).toEqual({ "?region": ["r1"] }));

		});

	});

	describe("clear()", () => {

		it("should deselect every value and show the options from the start", async () => {

			const lookup = options([]);
			const { collection, options: binding } = mount(backend(lookup), {
				sieve: { "?region": ["r1"], "?category": ["a", "b"] },
				size: 10
			});

			await ready(binding);

			// each transition notifies its change in a microtask, so the next one starts from the state it produced

			await act(async () => binding()({ ready: ({ search }) => search("art") }));
			await act(async () => binding()({ ready: ({ seek }) => seek(20) }));
			await act(async () => binding()({ ready: ({ clear }) => clear() }));

			await vi.waitFor(() => expect(collection().sieve).toEqual({ "?region": ["r1"] }));
			await vi.waitFor(() => expect(binding()({ ready: ({ keywords, offset }) => [keywords, offset] })).toEqual(["", 0]));

		});

	});

	it("should be blank until the options are first retrieved", async () => {

		const { options: binding } = mount(backend(vi.fn(() => new Promise(() => {}))));

		expect(binding()({ blank: "blank" })).toBe("blank");

	});

	it("should move to error on a failed retrieval, retrieving the options again on reload", async () => {

		const lookup = vi.fn().mockRejectedValue({ status: 503 });
		const { options: binding } = mount(backend(lookup));

		await vi.waitFor(() => expect(binding()({ error: ({ state }) => state.status })).toBe(503));

		lookup.mockImplementation(options([{ value: "a", count: 1 }]));

		await act(() => binding()({ error: ({ reload }) => reload() }));

		await vi.waitFor(() => expect(binding()({ ready: ({ state }) => state })).toEqual([
			{ value: "a", count: 1, selected: false }
		]));

	});

	it("should throw outside a store context", async () => {

		function Probe() {

			useOptions(useCollection({ entry, shape: Catalogue }), "category");

			return null;

		}

		expect(() => act(() => render(createElement(Probe, {}), document.body))).toThrow("missing <Store> context");

	});

});
