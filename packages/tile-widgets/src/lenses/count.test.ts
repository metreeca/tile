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
import type { Criteria } from "@metreeca/qest/model";
import { Store } from "@metreeca/tile";
import { type Collection, useCollection } from "@metreeca/tile/collection";
import { useCount } from "@metreeca/tile/count";
import { createElement, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Count } from "./count.js";


const entry = "https://example.com/catalogue/";

const Item = resource({ id: id(), label: required(string()) });
const Catalogue = resource({ id: id(), members: multiple(reference(Item)) });


/**
 * A store counting the number of items given, immutable as every store hands them out.
 */
function counting(count: number) {
	return vi.fn(async () => immutable({ id: entry, members: [{ count }] }));
}

function backend(lookup: unknown): Backend {
	return {
		lookup,
		observe: () => () => {}
	} as unknown as Backend; // ;(test stub) only the members the binding calls are provided
}

/**
 * Mounts a counter over a catalogue held by a store answering with `lookup`, worded by `labels` if given.
 *
 * @returns A getter for the collection as last rendered, so a test narrows it as a facet would
 */
function mount(
	lookup: unknown,
	criteria: Criteria = {},
	labels?: Parameters<typeof Count>[0]["labels"]
): () => Collection<typeof Catalogue, "members"> {

	const collections = vi.fn<(collection: Collection<typeof Catalogue, "members">) => void>();

	function Host() {

		const collection = useCollection({ entry, shape: Catalogue, query: criteria });

		collections(collection);

		return createElement(Count<typeof Catalogue, "members">, { collection, count: useCount(collection), labels });

	}

	act(() => render(createElement(Store, {
		factory: () => backend(lookup),
		children: createElement(Host, {})
	}), document.body));

	return () => collections.mock.lastCall![0]; // test harness: Host has rendered at least once

}

function counter(): Element | null {
	return document.querySelector("tile-count");
}


afterEach(async () => {
	act(() => render(null, document.body));
});


describe("Count", () => {

	it("should be a status region", async () => {

		mount(counting(3));

		expect(counter()?.getAttribute("role")).toBe("status");

	});

	it("should stay blank while the items are counted", async () => {

		mount(vi.fn(() => new Promise(() => {})));

		expect(counter()?.textContent).toBe("");

	});

	it("should stay blank if the count fails", async () => {

		const lookup = vi.fn(async () => { throw new Error("failed"); });

		mount(lookup);

		await vi.waitFor(() => expect(lookup).toHaveBeenCalled());
		await act(async () => {});

		expect(counter()?.textContent).toBe("");

	});

	describe("unnarrowed collections", () => {

		it("should tell no items", async () => {

			mount(counting(0));

			await vi.waitFor(() => expect(counter()?.textContent).toBe("no items"));

		});

		it("should tell a single item", async () => {

			mount(counting(1));

			await vi.waitFor(() => expect(counter()?.textContent).toBe("1 item"));

		});

		it("should tell several items, grouping digits as the locale does", async () => {

			mount(counting(1234));

			await vi.waitFor(() => expect(counter()?.textContent).toBe(`${(1234).toLocaleString()} items`));

		});

	});

	it("should keep the count and its wording together while counting again", async () => {

		const lookup = vi.fn().mockImplementationOnce(counting(62)).mockImplementation(() => new Promise(() => {}));
		const collection = mount(lookup);

		await vi.waitFor(() => expect(counter()?.textContent).toBe("62 items"));

		act(() => void collection().filter({ "~label": "item" }));

		await vi.waitFor(() => expect(lookup).toHaveBeenCalledTimes(2));
		await act(async () => {});

		expect(counter()?.textContent).toBe("62 items");

	});

	describe("narrowed collections", () => {

		const criteria = { "~label": "item" };

		it("should tell no matches", async () => {

			mount(counting(0), criteria);

			await vi.waitFor(() => expect(counter()?.textContent).toBe("no matches"));

		});

		it("should tell a single match", async () => {

			mount(counting(1), criteria);

			await vi.waitFor(() => expect(counter()?.textContent).toBe("1 match"));

		});

		it("should tell several matches", async () => {

			mount(counting(3), criteria);

			await vi.waitFor(() => expect(counter()?.textContent).toBe("3 matches"));

		});

	});

	describe("custom wording", () => {

		const labels = {
			empty: "nessun elemento",
			item: "elemento",
			items: "elementi",
			unmatched: "nessun risultato",
			match: "risultato",
			matches: "risultati"
		};

		const criteria = { "~label": "item" };

		it("should tell no items in the given wording", async () => {

			mount(counting(0), {}, labels);

			await vi.waitFor(() => expect(counter()?.textContent).toBe("nessun elemento"));

		});

		it("should tell items in the given wording", async () => {

			mount(counting(3), {}, labels);

			await vi.waitFor(() => expect(counter()?.textContent).toBe("3 elementi"));

		});

		it("should tell no matches in the given wording", async () => {

			mount(counting(0), criteria, labels);

			await vi.waitFor(() => expect(counter()?.textContent).toBe("nessun risultato"));

		});

		it("should tell a single match in the given wording", async () => {

			mount(counting(1), criteria, labels);

			await vi.waitFor(() => expect(counter()?.textContent).toBe("1 risultato"));

		});

	});

});
