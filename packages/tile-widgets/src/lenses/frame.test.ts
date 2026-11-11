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

import { id, required, resource } from "@metreeca/blue/resource";
import { string } from "@metreeca/blue/string";
import { immutable } from "@metreeca/core/values";
import type { Store as Backend } from "@metreeca/keep";
import { Store } from "@metreeca/tile";
import { useResource } from "@metreeca/tile/resource";
import { createElement, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Frame } from "./frame.js";


const entry = "https://example.com/catalogue/1";

const Item = resource({ id: id(), label: required(string()) });


function backend(lookup: unknown): Backend {
	return {
		lookup,
		observe: () => () => {}
	} as unknown as Backend; // ;(test stub) only the members the binding calls are provided
}

function mount(lookup: unknown, placeholder?: string): void {

	function Host() {

		const item = useResource({ entry, shape: Item, model: { id: {}, label: {} } });

		return createElement(Frame<typeof Item, { id: {}, label: {} }>, {
			resource: item,
			placeholder,
			children: item => createElement("h1", {}, item.label)
		});

	}

	act(() => render(createElement(Store, {
		factory: () => backend(lookup),
		children: createElement(Host, {})
	}), document.body));

}


afterEach(async () => {
	act(() => render(null, document.body));
});


describe("Frame", () => {

	it("should show the resource, rendering it through children", async () => {

		mount(vi.fn(async () => immutable({ id: entry, label: "item" })));

		await vi.waitFor(() => expect(document.querySelector("tile-frame h1")?.textContent).toBe("item"));

	});

	describe("placeholder", () => {

		it("should word the area as loading while nothing is retrieved", async () => {

			mount(vi.fn(() => new Promise(() => {})), "Item");

			expect(document.querySelector("tile-hint")?.textContent).toContain("Loading");

		});

		it("should render nothing while nothing is retrieved if omitted", async () => {

			mount(vi.fn(() => new Promise(() => {})));

			expect(document.body.innerHTML).toBe("");

		});

	});

	describe("failures", () => {

		it("should show a note in place of the frame for a missing resource", async () => {

			mount(vi.fn(async () => Promise.reject({ status: 404 })));

			await vi.waitFor(() => expect(document.querySelector("tile-note[role=alert]")).not.toBeNull());

			expect(document.querySelector("tile-frame")).toBeNull();

		});

		it("should show a note in place of the frame for a failed exchange", async () => {

			mount(vi.fn(async () => Promise.reject({ status: 503 })));

			await vi.waitFor(() => expect(document.querySelector("tile-note[role=alert]")).not.toBeNull());

			expect(document.querySelector("tile-frame")).toBeNull();

		});

	});

});
