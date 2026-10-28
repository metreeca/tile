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

import { dictionary } from "@metreeca/blue/dictionary";
import { number } from "@metreeca/blue/number";
import { reference } from "@metreeca/blue/reference";
import { id, multiple, optional, required, resource } from "@metreeca/blue/resource";
import { string } from "@metreeca/blue/string";
import { union } from "@metreeca/blue/union";
import type { Relay } from "@metreeca/core/relay";
import { immutable } from "@metreeca/core/values";
import type { Store as Backend } from "@metreeca/keep";
import type { Criteria, Option } from "@metreeca/qest/model";
import { createElement, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { type Collection } from "./collection.core.js";
import { useCollection } from "./collection.js";
import { Store } from "./index.js";
import { createTally } from "./tally.core.js";
import { type TallyCases, useTally } from "./tally.js";


describe("createTally()", () => {

	describe("creation", () => {

		it("should start with no keywords from the first option, showing them all by default", async () => {

			const options = createTally();

			expect([options.keywords, options.offset, options.limit]).toEqual(["", 0, 0]);

		});

		it("should show as many options as given", async () => {
			expect(createTally({ size: 10 }).limit).toBe(10);
		});

	});

	describe("search()", () => {

		it("should narrow the options by keywords, leaving the page as it stands", async () => {

			const options = createTally().seek(20).search("item");

			expect([options.keywords, options.offset]).toEqual(["item", 20]);

		});

		it("should show the options from the first one again on empty keywords", async () => {

			const options = createTally().search("item").seek(20).search("");

			expect([options.keywords, options.offset]).toEqual(["", 0]);

		});

	});

	describe("seek()", () => {

		it("should move the options on show", async () => {
			expect(createTally().seek(20).offset).toBe(20);
		});

		it("should take a negative index for the first option", async () => {
			expect(createTally().seek(-5).offset).toBe(0);
		});

	});

	describe("resize()", () => {

		it("should resize the options on show", async () => {
			expect(createTally().resize(5).limit).toBe(5);
		});

		it("should take a negative number for all the options", async () => {
			expect(createTally({ size: 10 }).resize(-5).limit).toBe(0);
		});

	});

	describe("reset()", () => {

		it("should show the options as they stood when created", async () => {

			const options = createTally({ size: 10 }).search("item").seek(20).resize(5).reset();

			expect([options.keywords, options.offset, options.limit]).toEqual(["", 0, 10]);

		});

	});

});


describe("useTally()", () => {

	const entry = "https://example.com/catalogue/";

	const Topic = resource({
		id: id(),
		name: required(string()),
		title: required(dictionary()),
		alias: optional(string()),
		tags: multiple(string()),
		rank: optional(number())
	});

	const Item = resource({
		id: id(),
		category: required(string()),
		year: optional(number()),
		keywords: multiple(string()),
		topic: optional(reference(Topic)),
		mixed: optional(union(string(), reference(Topic))),
		nested: optional(Topic)
	});

	const Catalogue = resource({ id: id(), members: multiple(reference(Item)) });

	type Members = { readonly members: { readonly [key: string]: unknown } };

	type Row = { readonly value: Option, readonly label?: string, readonly count: number };


	function backend(lookup: unknown, observe: unknown = () => () => {}): Backend {
		return { lookup, observe } as unknown as Backend; // ;(test stub) only the members called
	}

	/**
	 * A store answering the options retrieved under no criteria with `baseline`, and those retrieved under the `?region`
	 * criterion with `matching`, so that a test tells the two retrievals apart by what they hand over.
	 */
	function options(baseline: readonly Row[], matching: readonly Row[] = baseline) {
		return vi.fn(async ({ model }: { model: Members }) => immutable({
			id: entry,
			members: "?region" in model.members ? matching : baseline
		}));
	}

	function models(lookup: ReturnType<typeof options>) {
		return lookup.mock.calls.map(([{ model }]) => model);
	}

	function mount(store: Backend, { criteria = {}, expression = "category", label, size }: {

		readonly criteria?: Criteria

		readonly expression?: string
		readonly label?: string
		readonly size?: number

	} = {}): {

		collection: () => Collection<typeof Catalogue, "members">
		options: () => Relay<TallyCases>

	} {

		const collections = vi.fn<(collection: Collection<typeof Catalogue, "members">) => void>();
		const bindings = vi.fn<(options: Relay<TallyCases>) => void>();

		function Probe() {

			const collection = useCollection({ entry, shape: Catalogue, criteria });

			collections(collection);
			bindings(useTally(collection, expression, {
				...(label ? { label } : {}),
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

	async function ready(options: () => Relay<TallyCases>): Promise<void> {
		await vi.waitFor(() => expect(options()({ ready: () => true })).toBe(true));
	}


	afterEach(async () => {
		act(() => render(null, document.body));
	});


	describe("retrieval", () => {

		it("should retrieve the options under no criteria", async () => {

			const lookup = options([]);

			mount(backend(lookup), { criteria: { "?region": ["r1"] } });

			await vi.waitFor(() => expect(models(lookup)).toContainEqual({
				members: {
					"value=category": {}, "count=count:": {},
					"^count:": -1, "^category": 2,
					"@": 0, "#": 0
				}
			}));

		});

		it("should retrieve the options under the collection criteria other than their own", async () => {

			const lookup = options([]);

			mount(backend(lookup), { criteria: { "?region": ["r1"], "?category": ["c1"] } });

			await vi.waitFor(() => expect(models(lookup)).toContainEqual({
				members: {
					"?region": ["r1"],
					"value=category": {}, "count=count:": {},
					"^count:": -1, "^category": 2, "+category": ["c1"],
					"@": 0, "#": 0
				}
			}));

		});

		it("should keep the selected options on top", async () => {

			const lookup = options([]);

			mount(backend(lookup), { criteria: { "?category": ["c1", "c2"] } });

			await vi.waitFor(() => expect(models(lookup)).toContainEqual({
				members: expect.objectContaining({ "+category": ["c1", "c2"] })
			}));

		});

		it("should keep the selected resource options on top", async () => {

			const lookup = options([]);

			mount(backend(lookup), { criteria: { "?topic": ["https://example.com/t1"] }, expression: "topic", label: "name" });

			await vi.waitFor(() => expect(models(lookup)).toContainEqual({
				members: expect.objectContaining({ "+topic": ["https://example.com/t1"] })
			}));

		});

		it("should retrieve resource options with their label, ordered by count and then by label", async () => {

			const lookup = options([]);

			mount(backend(lookup), { expression: "topic", label: "name" });

			await vi.waitFor(() => expect(models(lookup)).toContainEqual({
				members: {
					"value=topic": {}, "label=topic.name": {}, "count=count:": {},
					"^count:": -1, "^topic.name": 2,
					"@": 0, "#": 0
				}
			}));

		});

		it("should accept a localised label", async () => {

			const lookup = options([]);

			mount(backend(lookup), { expression: "topic", label: "title" });

			await vi.waitFor(() => expect(models(lookup)).toContainEqual({
				members: expect.objectContaining({ "label=topic.title": {}, "^topic.title": 2 })
			}));

		});

		it("should accept a label computed by a transform pipe", async () => {

			const lookup = options([]);
			const { options: binding } = mount(backend(lookup), { expression: "topic", label: "lower:name" });

			await ready(binding);

			act(() => binding()({ ready: ({ search }) => search("art") }));

			await vi.waitFor(() => expect(models(lookup).at(-1)).toMatchObject({
				members: { "label=lower:topic.name": {}, "^lower:topic.name": 2, "~lower:topic.name": "art" }
			}));

		});

		it("should accept literal options whatever the number of values each item holds", async () => {

			const lookup = options([]);

			mount(backend(lookup), { expression: "year" });
			mount(backend(lookup), { expression: "keywords" });
			mount(backend(lookup), { expression: "abs:year" });

			await vi.waitFor(() => expect(models(lookup)).toEqual(expect.arrayContaining([
				{ members: expect.objectContaining({ "value=year": {}, "^year": 2 }) },
				{ members: expect.objectContaining({ "value=keywords": {}, "^keywords": 2 }) },
				{ members: expect.objectContaining({ "value=abs:year": {}, "^abs:year": 2 }) }
			])));

		});

		it("should ignore the label of literal options, whatever it reaches", async () => {

			const lookup = options([]);

			mount(backend(lookup), { expression: "keywords", label: "unknown" });

			await vi.waitFor(() => expect(models(lookup)).toContainEqual({
				members: expect.objectContaining({ "value=keywords": {}, "^keywords": 2 })
			}));

		});

		it("should ignore the label of literal options", async () => {

			const lookup = options([]);

			mount(backend(lookup), { label: "name" });

			await vi.waitFor(() => expect(models(lookup)).toContainEqual({
				members: {
					"value=category": {}, "count=count:": {},
					"^count:": -1, "^category": 2,
					"@": 0, "#": 0
				}
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

		it("should narrow resource options by keywords matched against their label", async () => {

			const lookup = options([]);
			const { options: binding } = mount(backend(lookup), { expression: "topic", label: "name" });

			await ready(binding);

			act(() => binding()({ ready: ({ search }) => search("art") }));

			await vi.waitFor(() => expect(models(lookup).at(-1)).toMatchObject({
				members: { "~topic.name": "art" }
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
			)), { criteria: { "?region": ["r1"], "?category": ["a", "b"] } });

			await vi.waitFor(() => expect(binding()({ ready: ({ state }) => state })).toEqual([
				{ value: "b", label: "b", count: 5, selected: true },
				{ value: "a", label: "a", count: 0, selected: true },
				{ value: "c", label: "c", count: 2, selected: false },
				{ value: "d", label: "d", count: 0, selected: false }
			]));

		});

		it("should name literal options as text", async () => {

			const { options: binding } = mount(backend(options([{ value: 2020, count: 3 }])), { expression: "year" });

			await vi.waitFor(() => expect(binding()({ ready: ({ state }) => state })).toEqual([
				{ value: 2020, label: "2020", count: 3, selected: false }
			]));

		});

		it("should name resource options by their label", async () => {

			const { options: binding } = mount(backend(options([
				{ value: "https://example.com/t1", label: "Arts", count: 3 }
			])), { expression: "topic", label: "name" });

			await vi.waitFor(() => expect(binding()({ ready: ({ state }) => state })).toEqual([
				{ value: "https://example.com/t1", label: "Arts", count: 3, selected: false }
			]));

		});

		it("should leave the option for the items holding no value unnamed", async () => {

			const { options: binding } = mount(backend(options([{ value: null, count: 3 }])));

			await vi.waitFor(() => expect(binding()({ ready: ({ state }) => state })).toEqual([
				{ value: null, count: 3, selected: false }
			]));

		});

		it("should tell whether more options follow the ones on show", async () => {

			const { options: binding } = mount(backend(options([
				{ value: "a", count: 3 }, { value: "b", count: 2 }, { value: "c", count: 1 }
			])), { size: 2 });

			await vi.waitFor(() => expect(binding()({ ready: ({ state, more }) => ({ state, more }) })).toEqual({
				state: [
					{ value: "a", label: "a", count: 3, selected: false },
					{ value: "b", label: "b", count: 2, selected: false }
				],
				more: true
			}));

		});

	});

	describe("select()", () => {

		it("should narrow the collection to the items holding the selected values", async () => {

			const { collection, options: binding } = mount(backend(options([])), { criteria: { "?category": ["a"] } });

			await ready(binding);

			act(() => binding()({ ready: ({ select }) => select("b", true) }));

			await vi.waitFor(() => expect(collection().criteria).toEqual({ "?category": ["a", "b"] }));

		});

		it("should stop narrowing the collection once no value is selected", async () => {

			const { collection, options: binding } = mount(backend(options([])), {
				criteria: { "?region": ["r1"], "?category": ["a"] }
			});

			await ready(binding);

			act(() => binding()({ ready: ({ select }) => select("a", false) }));

			await vi.waitFor(() => expect(collection().criteria).toEqual({ "?region": ["r1"] }));

		});

	});

	describe("clear()", () => {

		it("should deselect every value and show the options from the start", async () => {

			const lookup = options([]);
			const { collection, options: binding } = mount(backend(lookup), {
				criteria: { "?region": ["r1"], "?category": ["a", "b"] },
				size: 10
			});

			await ready(binding);

			// each transition notifies its change in a microtask, so the next one starts from the state it produced

			await act(async () => binding()({ ready: ({ search }) => search("art") }));
			await act(async () => binding()({ ready: ({ seek }) => seek(20) }));
			await act(async () => binding()({ ready: ({ clear }) => clear() }));

			await vi.waitFor(() => expect(collection().criteria).toEqual({ "?region": ["r1"] }));
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
			{ value: "a", label: "a", count: 1, selected: false }
		]));

	});

	describe("validation", () => {

		const store = backend(options([]));

		it("should throw on a malformed expression", async () => {
			expect(() => mount(store, { expression: "category." })).toThrow("malformed");
		});

		it("should throw on an expression reaching no value", async () => {
			expect(() => mount(store, { expression: "unknown" })).toThrow(RangeError);
		});

		it("should throw on an expression reaching literals and resources alike", async () => {
			expect(() => mount(store, { expression: "mixed", label: "name" })).toThrow(RangeError);
		});

		it("should throw on an expression reaching nested resources", async () => {
			expect(() => mount(store, { expression: "nested", label: "name" })).toThrow(RangeError);
		});

		it("should throw on resource options with no label", async () => {
			expect(() => mount(store, { expression: "topic" })).toThrow(RangeError);
		});

		it("should throw on a malformed label", async () => {
			expect(() => mount(store, { expression: "topic", label: "name." })).toThrow("malformed");
		});

		it("should throw on a label reaching no value", async () => {
			expect(() => mount(store, { expression: "topic", label: "unknown" })).toThrow(RangeError);
		});

		it("should throw on a label possibly reaching no value", async () => {
			expect(() => mount(store, { expression: "topic", label: "alias" })).toThrow(RangeError);
		});

		it("should throw on a label computed by a transform pipe possibly reaching no value", async () => {
			expect(() => mount(store, { expression: "topic", label: "lower:alias" })).toThrow(RangeError);
		});

		it("should throw on a label reaching more than one value", async () => {
			expect(() => mount(store, { expression: "topic", label: "tags" })).toThrow(RangeError);
		});

		it("should throw on a label reaching a value other than text", async () => {
			expect(() => mount(store, { expression: "topic", label: "rank" })).toThrow(RangeError);
		});

	});

	it("should throw outside a store context", async () => {

		function Probe() {

			useTally(useCollection({ entry, shape: Catalogue }), "category");

			return null;

		}

		expect(() => act(() => render(createElement(Probe, {}), document.body))).toThrow("missing <Store> context");

	});

});
