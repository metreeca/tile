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
import { More } from "@metreeca/tile-cell/more";
import { Store, useCollection, useMembers } from "@metreeca/tile-data/store";
import { createElement, Fragment, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Sheet } from "./sheet.js";


const entry = "https://example.com/catalogue/";

const Item = resource({ id: id(), label: required(string()) });
const Catalogue = resource({ id: id(), members: multiple(reference(Item)) });


function pool(size: number): readonly { id: string, label: string }[] {
	return Array.from({ length: size }, (_, index) => ({
		id: `${entry}${index}`,
		label: `item ${index}`
	}));
}

/**
 * A store holding the items given, immutable as every store hands them out.
 */
function catalogue(items: readonly { id: string, label: string }[]) {
	return vi.fn(async () => immutable({ id: entry, members: items }));
}

function backend(lookup: unknown): Backend {
	return {
		lookup,
		observe: () => () => {}
	} as unknown as Backend; // ;(test stub) only the members the binding calls are provided
}

function mount(lookup: unknown, placeholder?: string): void {

	function Host() {

		const members = useMembers(useCollection({ entry, shape: Catalogue }), { model: { id: {}, label: {} } });

		return createElement(Sheet<typeof Catalogue, "members", { id: {}, label: {} }>, {
			members,
			placeholder,
			children: item => createElement("p", {}, item.label)
		});

	}

	act(() => render(createElement(Store, {
		factory: () => backend(lookup),
		children: createElement(Host, {})
	}), document.body));

}

function shown(): readonly string[] {
	return Array.from(document.querySelectorAll("tile-sheet p"), item => item.textContent ?? "");
}


afterEach(async () => {
	act(() => render(null, document.body));
});


describe("Sheet", () => {

	it("should list the members, rendering each through children", async () => {

		mount(catalogue(pool(3)));

		await vi.waitFor(() => expect(shown()).toEqual(["item 0", "item 1", "item 2"]));

	});

	describe("progressive loading", () => {

		const batch = 10;

		/**
		 * A store holding the items given, handing out the page the model offset and limit ask for.
		 */
		function limited(items: readonly { id: string, label: string }[]) {
			return vi.fn(async ({ model }: { model: { members: { "@": number, "#": number } } }) => immutable({
				id: entry,
				members: items.slice(model.members["@"], model.members["@"]+model.members["#"])
			}));
		}

		/*
		 * The page lays nothing out, so a stand-in observer puts every trigger in view as soon as it watches it.
		 */
		class Observer {

			readonly #callback: IntersectionObserverCallback;

			constructor(callback: IntersectionObserverCallback) {
				this.#callback = callback;
			}

			observe(target: Element): void {
				queueMicrotask(() => this.#callback(
					[{ target, isIntersecting: true } as unknown as IntersectionObserverEntry], // ;(test stub) the fields read
					this as unknown as IntersectionObserver // ;(test stub) the observer argument is never read
				));
			}

			disconnect(): void {}

		}

		function wire(lookup: unknown): void {

			function Host() {

				const members = useMembers(useCollection({ entry, shape: Catalogue }), { model: { id: {}, label: {} }, batch });

				return createElement(Fragment, {},
					createElement(Sheet<typeof Catalogue, "members", { id: {}, label: {} }>, {
						members,
						children: item => createElement("p", {}, item.label)
					}),
					members({ ready: ({ load }) => load && createElement(More, { onLoad: load }) })
				);

			}

			act(() => render(createElement(Store, {
				factory: () => backend(lookup),
				children: createElement(Host, {})
			}), document.body));

		}


		beforeEach(async () => {
			vi.stubGlobal("IntersectionObserver", Observer);
		});

		afterEach(async () => {
			vi.unstubAllGlobals();
		});


		it("should grow batch by batch as a trigger placed after it comes into view", async () => {

			wire(limited(pool(3*batch+batch/2)));

			await vi.waitFor(() => expect(shown()).toHaveLength(3*batch+batch/2));

		});

		it("should drop the trigger once the collection is exhausted", async () => {

			wire(limited(pool(batch/2)));

			await vi.waitFor(() => expect(shown()).toHaveLength(batch/2));

			expect(document.querySelector("tile-more")).toBeNull();

		});

	});

	describe("placeholder", () => {

		it("should word the area as loading while nothing is retrieved", async () => {

			mount(vi.fn(() => new Promise(() => {})), "Items");

			expect(document.querySelector("tile-hint")?.textContent).toContain("Loading");

		});

		it("should word the area as matching nothing for an empty collection", async () => {

			mount(catalogue([]), "Items");

			await vi.waitFor(() => expect(document.querySelector("tile-hint")?.textContent).toContain("No Matches"));

		});

		it("should render nothing for an empty collection if omitted", async () => {

			const lookup = catalogue([]);

			mount(lookup);

			await vi.waitFor(() => expect(lookup).toHaveBeenCalled());

			expect(document.body.innerHTML).toBe("");

		});

	});

	describe("failures", () => {

		it("should show a note in place of the list", async () => {

			mount(vi.fn(async () => Promise.reject({ status: 503 })));

			await vi.waitFor(() => expect(document.querySelector("tile-note[level=critical]")).not.toBeNull());

			expect(document.querySelector("tile-sheet")).toBeNull();

		});

	});

});
