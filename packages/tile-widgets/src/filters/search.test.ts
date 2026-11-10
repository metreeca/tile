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
import type { Criteria } from "@metreeca/qest/model";
import { useCollection } from "@metreeca/tile/collection";
import { useSearch } from "@metreeca/tile/search";
import { createElement, Fragment, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AutoDelay } from "../index.js";

import { Search } from "./search.js";


const entry = "https://example.com/catalogue/";

const Item = resource({ id: id(), label: required(string()) });
const Catalogue = resource({ id: id(), members: multiple(reference(Item)) });


function mount(criteria: Criteria = {}, onChange: (criteria: Criteria) => void = () => {}): void {

	function Host() {

		const collection = useCollection({ entry, shape: Catalogue, query: criteria, onChange });

		return createElement(Fragment, {},
			createElement(Search, { name: "Label", search: useSearch(collection, "label") }),
			createElement("button", { type: "button", title: "Clear Filters", onClick: collection.clear })
		);

	}

	act(() => render(createElement(Host, {}), document.body));

}

function field(): HTMLInputElement | null {
	return document.querySelector("tile-search input[type=search]");
}

function reset(): HTMLButtonElement | null {
	return document.querySelector("tile-search button[title=Reset]");
}

function clear(): HTMLButtonElement | null {
	return document.querySelector("button[title='Clear Filters']");
}

function type(text: string): void {
	act(() => {
		field()!.value = text; // test harness: the field is rendered
		field()!.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

function press(key: string): KeyboardEvent {

	const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });

	act(() => void field()!.dispatchEvent(event)); // test harness: the field is rendered

	return event;

}


afterEach(async () => {
	act(() => render(null, document.body));
});


describe("Search", () => {

	describe("accessibility", () => {

		it("should name the field by its name", async () => {

			mount();

			expect(field()?.getAttribute("aria-label")).toBe("Label");

		});

		it("should show its name in the field while empty", async () => {

			mount();

			expect(field()?.placeholder).toBe("Label");

		});

	});

	describe("focus", () => {

		it("should select the whole text on focus", async () => {

			mount({ "~label": "art" });

			act(() => void field()!.dispatchEvent(new FocusEvent("focus"))); // test harness: the field is rendered

			expect([field()?.selectionStart, field()?.selectionEnd]).toEqual([0, 3]);

		});

	});

	describe("text", () => {

		it("should show the text narrowing the collection", async () => {

			mount({ "~label": "art" });

			expect(field()?.value).toBe("art");

		});

		it("should narrow the collection once the reader pauses typing", async () => {

			const onChange = vi.fn();

			mount({}, onChange);

			type("art ");

			expect(onChange).not.toHaveBeenCalled();

			await vi.waitFor(() => expect(onChange).toHaveBeenLastCalledWith({ "~label": "art" }), {
				timeout: 4 * AutoDelay
			});

		});

		it("should keep the text as typed while narrowing by the trimmed text", async () => {

			mount();

			type("art ");
			press("Enter");

			await vi.waitFor(() => expect(field()?.value).toBe("art "));

		});

		it("should narrow the collection at once on Enter", async () => {

			const onChange = vi.fn();

			mount({}, onChange);

			type("art");
			press("Enter");

			await vi.waitFor(() => expect(onChange).toHaveBeenLastCalledWith({ "~label": "art" }), {
				timeout: AutoDelay / 2
			});

		});

		it("should follow text cleared elsewhere", async () => {

			mount({ "~label": "art" });

			act(() => clear()?.click());

			await vi.waitFor(() => expect(field()?.value).toBe(""));

		});

	});

	describe("reset", () => {

		it("should not offer a reset while the field is empty", async () => {

			mount();

			expect(reset()).toBeNull();

		});

		it("should offer a reset while text is typed", async () => {

			mount();

			type("art");

			expect(reset()).not.toBeNull();

		});

		it("should empty the field on reset, no longer narrowing the collection", async () => {

			const onChange = vi.fn();

			mount({ "~label": "art" }, onChange);

			act(() => reset()?.click());

			await vi.waitFor(() => expect(field()?.value).toBe(""));
			await vi.waitFor(() => expect(onChange).toHaveBeenLastCalledWith({}));

		});

		it("should empty the field on Escape, no longer narrowing the collection", async () => {

			const onChange = vi.fn();

			mount({ "~label": "art" }, onChange);

			press("Escape");

			await vi.waitFor(() => expect(field()?.value).toBe(""));
			await vi.waitFor(() => expect(onChange).toHaveBeenLastCalledWith({}));

		});

		it("should leave Escape to the page while the field is empty", async () => {

			mount();

			expect(press("Escape").defaultPrevented).toBe(false);

		});

	});

});
