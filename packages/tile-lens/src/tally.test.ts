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
import { id, multiple, optional, resource } from "@metreeca/blue/resource";
import { string } from "@metreeca/blue/string";
import { immutable } from "@metreeca/core/values";
import type { Store as Backend } from "@metreeca/keep";
import type { Criteria, Option } from "@metreeca/qest/model";
import { AutoDelay } from "@metreeca/tile-cell";
import { Store, useCollection, useTally } from "@metreeca/tile-data/store";
import type { TallyBucket } from "@metreeca/tile-data/store/tally";
import { type ComponentChildren, createElement, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Tally } from "./tally.js";


const entry = "https://example.com/catalogue/";

const Item = resource({ id: id(), category: optional(string()) });
const Catalogue = resource({ id: id(), members: multiple(reference(Item)) });

type Row = { readonly value: Option, readonly label?: string, readonly count: number };
type Members = { readonly members: { readonly [key: string]: unknown } };


/**
 * A store handing over the same options whatever the criteria, immutable as every store hands them out.
 */
function options(rows: readonly Row[]) {
	return vi.fn(async (_: { model: Members }) => immutable({ id: entry, members: rows }));
}

function backend(lookup: unknown): Backend {
	return {
		lookup,
		observe: () => () => {}
	} as unknown as Backend; // ;(test stub) only the members the binding calls are provided
}

function mount(lookup: unknown, {

	compact,
	criteria = {},
	size,
	onChange = () => {},
	children

}: {

	readonly compact?: boolean
	readonly criteria?: Criteria
	readonly size?: number
	readonly onChange?: (criteria: Criteria) => void
	readonly children?: (bucket: TallyBucket) => ComponentChildren

} = {}): void {

	function Host() {

		const collection = useCollection({ entry, shape: Catalogue, query: criteria, onChange });

		return createElement(Tally, {
			name: "Category",
			...(compact === undefined ? {} : { compact }),
			tally: useTally(collection, "category", size ? { size } : {}),
			...(children ? { children } : {})
		});

	}

	act(() => render(createElement(Store, {
		factory: () => backend(lookup),
		children: createElement(Host, {})
	}), document.body));

}

function facet(): Element | null {
	return document.querySelector("tile-tally");
}

function field(): HTMLInputElement | null {
	return document.querySelector("input[type=search]");
}

function checkboxes(): readonly HTMLInputElement[] {
	return [...document.querySelectorAll<HTMLInputElement>("input[type=checkbox]")];
}

function labels(): readonly (string | null)[] {
	return [...document.querySelectorAll("tile-tally label")].map(label => label.textContent);
}

function links(): readonly { readonly href: string | null, readonly text: string | null }[] {
	return [...document.querySelectorAll("tile-tally label a")].map(anchor => ({
		href: anchor.getAttribute("href"),
		text: anchor.textContent
	}));
}

function clear(): HTMLButtonElement | null {
	return document.querySelector("button[title=Clear]");
}

function reset(): HTMLButtonElement | null {
	return document.querySelector("button[title=Reset]");
}

function disclosure(): HTMLButtonElement | null {
	return document.querySelector("button[aria-expanded]");
}

function focus(target: Element | null, type: "focusin" | "focusout", relatedTarget: Element | null = null): void {
	act(() => void target!.dispatchEvent(new FocusEvent(type, { bubbles: true, relatedTarget })));
}

function type(text: string): void {
	act(() => {
		field()!.value = text; // test harness: the facet is ready
		field()!.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

function press(key: string): void {
	act(() => void field()!.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true })));
}

async function ready(): Promise<void> {
	await vi.waitFor(() => expect(facet()?.getAttribute("aria-busy")).not.toBe("true")); // the field shows from the start
}


afterEach(async () => {
	act(() => render(null, document.body));
});


describe("Tally", () => {

	describe("accessibility", () => {

		it("should be a group named by its name", async () => {

			mount(options([]));

			expect(facet()?.getAttribute("role")).toBe("group");
			expect(facet()?.getAttribute("aria-label")).toBe("Category");

		});

		it("should be busy while the options are retrieved for the first time", async () => {

			mount(vi.fn(() => new Promise(() => {})));

			expect(facet()?.getAttribute("aria-busy")).toBe("true");

		});

		it("should not be busy once the options are retrieved", async () => {

			mount(options([]));

			await ready();

			expect(facet()?.getAttribute("aria-busy")).not.toBe("true");

		});

		it("should name the search field", async () => {

			mount(options([]));

			await ready();

			expect(field()?.getAttribute("aria-label")).toBe("Search");

		});

		it("should show its header while the options are retrieved for the first time", async () => {

			mount(vi.fn(() => new Promise(() => {})));

			expect(field()?.placeholder).toBe("Category");
			expect(facet()?.querySelector("section")?.hidden).toBe(true);

		});

		it("should show its name in the search field while empty", async () => {

			mount(options([]));

			await ready();

			expect(field()?.placeholder).toBe("Category");

		});

		it("should offer no disclosure if compact is omitted", async () => {

			mount(options([{ value: "c1", label: "Arts", count: 1 }]));

			await vi.waitFor(() => expect(checkboxes()).toHaveLength(1));

			expect(disclosure()).toBeNull();

		});

		it("should state whether the options are on show by the disclosure", async () => {

			mount(options([{ value: "c1", label: "Arts", count: 1 }]), { compact: true });

			await vi.waitFor(() => expect(disclosure()).not.toBeNull());

			expect(disclosure()?.getAttribute("aria-expanded")).toBe("false");

			act(() => disclosure()?.click());

			await vi.waitFor(() => expect(disclosure()?.getAttribute("aria-expanded")).toBe("true"));

		});

		it("should control a rendered region by the disclosure", async () => {

			mount(options([{ value: "c1", label: "Arts", count: 1 }]), { compact: true });

			await vi.waitFor(() => expect(disclosure()).not.toBeNull());

			const controls = disclosure()?.getAttribute("aria-controls") ?? "";

			expect(controls).not.toBe("");
			expect(document.getElementById(controls)).not.toBeNull();

		});

	});

	describe("compact", () => {

		const rows: readonly Row[] = [
			{ value: "c1", label: "Arts", count: 1 },
			{ value: "c2", label: "Sciences", count: 1 }
		];

		it("should show only the ticked options while closed", async () => {

			mount(options(rows), { compact: true, criteria: { "?category": ["c2"] } });

			await vi.waitFor(() => expect(labels()).toEqual(["Sciences 1"]));

		});

		it("should show no options while closed with nothing ticked", async () => {

			mount(options(rows), { compact: true });

			await vi.waitFor(() => expect(disclosure()).not.toBeNull());

			expect(checkboxes()).toHaveLength(0);
			expect(facet()?.textContent).not.toContain("No Matches");

		});

		it("should not fetch more while closed", async () => {

			mount(options([...rows, { value: "c3", label: "Laws", count: 1 }]), {
				compact: true, size: 2, criteria: { "?category": ["c1"] }
			});

			await vi.waitFor(() => expect(checkboxes()).toHaveLength(1));

			expect(facet()?.querySelector("tile-more")).toBeNull();

		});

		it("should show every option once opened by the disclosure", async () => {

			mount(options(rows), { compact: true });

			await vi.waitFor(() => expect(disclosure()).not.toBeNull());

			act(() => disclosure()?.click());

			await vi.waitFor(() => expect(labels()).toEqual(["Arts 1", "Sciences 1"]));

		});

		it("should open as the search field takes focus", async () => {

			mount(options(rows), { compact: true });

			await ready();

			focus(field(), "focusin");

			await vi.waitFor(() => expect(checkboxes()).toHaveLength(2));

		});

		it("should close as focus leaves the facet", async () => {

			mount(options(rows), { compact: true });

			await ready();

			focus(field(), "focusin");

			await vi.waitFor(() => expect(checkboxes()).toHaveLength(2));

			focus(field(), "focusout", document.body);

			await vi.waitFor(() => expect(checkboxes()).toHaveLength(0));

		});

		it("should stay open as focus moves within the facet", async () => {

			mount(options(rows), { compact: true });

			await ready();

			focus(field(), "focusin");

			await vi.waitFor(() => expect(checkboxes()).toHaveLength(2));

			focus(field(), "focusout", checkboxes()[0] ?? null);

			await act(async () => {});

			expect(checkboxes()).toHaveLength(2);

		});

		it("should take focus itself, for browsers leaving it off the checkboxes and buttons pressed", async () => {

			mount(options(rows), { compact: true });

			await ready();

			expect(facet()?.getAttribute("tabindex")).toBe("-1");

		});

		it("should stay open as focus moves to the facet itself", async () => {

			mount(options(rows), { compact: true });

			await ready();

			focus(field(), "focusin");

			await vi.waitFor(() => expect(checkboxes()).toHaveLength(2));

			focus(field(), "focusout", facet());

			await act(async () => {});

			expect(checkboxes()).toHaveLength(2);

		});

		it("should stay open as focus leaves the facet once opened by the disclosure", async () => {

			mount(options(rows), { compact: true });

			await ready();

			act(() => disclosure()?.click());

			await vi.waitFor(() => expect(checkboxes()).toHaveLength(2));

			focus(checkboxes()[0] ?? null, "focusout", document.body);

			await act(async () => {});

			expect(checkboxes()).toHaveLength(2);

		});

		it("should close by the disclosure once opened by the search field", async () => {

			mount(options(rows), { compact: true });

			await ready();

			focus(field(), "focusin");

			await vi.waitFor(() => expect(checkboxes()).toHaveLength(2));

			act(() => disclosure()?.click());

			await vi.waitFor(() => expect(checkboxes()).toHaveLength(0));

		});

		it("should start open by the disclosure unless compact", async () => {

			mount(options(rows), { compact: false });

			await vi.waitFor(() => expect(labels()).toEqual(["Arts 1", "Sciences 1"]));

			expect(disclosure()?.getAttribute("aria-expanded")).toBe("true");

		});

		it("should stay open as focus leaves the facet unless compact", async () => {

			mount(options(rows), { compact: false });

			await vi.waitFor(() => expect(checkboxes()).toHaveLength(2));

			focus(checkboxes()[0] ?? null, "focusout", document.body);

			await act(async () => {});

			expect(checkboxes()).toHaveLength(2);

		});

		it("should close by the disclosure unless compact", async () => {

			mount(options(rows), { compact: false });

			await vi.waitFor(() => expect(checkboxes()).toHaveLength(2));

			act(() => disclosure()?.click());

			await vi.waitFor(() => expect(checkboxes()).toHaveLength(0));

		});

	});

	describe("options", () => {

		it("should offer a checkbox per option, labelled by its name and count", async () => {

			mount(options([
				{ value: "c1", label: "Arts", count: 1234 },
				{ value: "c2", label: "Sciences", count: 1 }
			]));

			await vi.waitFor(() => expect(checkboxes()).toHaveLength(2));

			expect(labels()).toEqual([`Arts ${(1234).toLocaleString()}`, "Sciences 1"]);

		});

		it("should name the option for the items holding no value", async () => {

			mount(options([{ value: null, count: 3 }]));

			await vi.waitFor(() => expect(labels()).toEqual(["‹blank› 3"]));

		});

		it("should name the option for the items holding no value itself, whatever the caller renders", async () => {

			mount(options([{ value: "c1", label: "Arts", count: 2 }, { value: null, count: 3 }]), {
				children: ({ label }) => `[${label}]`
			});

			await vi.waitFor(() => expect(labels()).toEqual(["[Arts] 2", "‹blank› 3"]));

		});

		it("should name options as the caller renders them", async () => {

			mount(options([{ value: "c1", label: "Arts", count: 2 }]), {
				children: ({ label }) => `[${label}]`
			});

			await vi.waitFor(() => expect(labels()).toEqual(["[Arts] 2"]));

		});

		it("should link options naming resources to the resources they name", async () => {

			mount(options([{ value: "https://example.com/categories/arts", label: "Arts", count: 2 }]));

			await vi.waitFor(() => expect(labels()).toEqual(["Arts 2"]));

			expect(links()).toEqual([{ href: "https://example.com/categories/arts", text: "Arts" }]);

		});

		it("should not link options naming literals", async () => {

			mount(options([{ value: "c1", label: "Arts", count: 2 }, { value: null, count: 3 }]));

			await vi.waitFor(() => expect(labels()).toEqual(["Arts 2", "‹blank› 3"]));

			expect(links()).toEqual([]);

		});

		it("should keep options the other criteria leave out on offer with no items", async () => {

			mount(options([{ value: "c1", label: "Arts", count: 0 }]));

			await vi.waitFor(() => expect(labels()).toEqual(["Arts 0"]));

		});

		it("should disable unticked options the other criteria leave out", async () => {

			mount(options([
				{ value: "c1", label: "Arts", count: 0 },
				{ value: "c2", label: "Sciences", count: 1 }
			]));

			await vi.waitFor(() => expect(checkboxes().map(({ disabled }) => disabled)).toEqual([true, false]));

		});

		it("should keep ticked options the other criteria leave out enabled, so they can be unticked", async () => {

			mount(options([{ value: "c1", label: "Arts", count: 0 }]), { criteria: { "?category": ["c1"] } });

			await vi.waitFor(() => expect(checkboxes().map(({ checked }) => checked)).toEqual([true]));

			expect(checkboxes()[0]?.disabled).toBe(false);

		});

		it("should tick the selected options", async () => {

			mount(options([
				{ value: "c1", label: "Arts", count: 1 },
				{ value: "c2", label: "Sciences", count: 1 }
			]), { criteria: { "?category": ["c2"] } });

			await vi.waitFor(() => expect(checkboxes().map(({ checked }) => checked)).toEqual([true, false]));

		});

		it("should tell when no option matches", async () => {

			mount(options([]));

			await vi.waitFor(() => expect(facet()?.textContent).toContain("No Matches"));

		});

		it("should close a long list with a trigger fetching more", async () => {

			mount(options([
				{ value: "c1", label: "Arts", count: 3 },
				{ value: "c2", label: "Sciences", count: 2 },
				{ value: "c3", label: "Laws", count: 1 }
			]), { size: 2 });

			await vi.waitFor(() => expect(checkboxes()).toHaveLength(2));

			expect(facet()?.querySelector("tile-more")).not.toBeNull();

		});

		it("should not close a complete list with a trigger", async () => {

			mount(options([{ value: "c1", label: "Arts", count: 3 }]), { size: 2 });

			await vi.waitFor(() => expect(checkboxes()).toHaveLength(1));

			expect(facet()?.querySelector("tile-more")).toBeNull();

		});

		it("should show a failed retrieval as a critical note", async () => {

			mount(vi.fn(async () => { throw new Error("failed"); }));

			await vi.waitFor(() => expect(facet()?.querySelector("tile-note")?.textContent).toContain("Not Available"));

		});

	});

	describe("selection", () => {

		it("should narrow the collection to the options ticked", async () => {

			const onChange = vi.fn();

			mount(options([{ value: "c1", label: "Arts", count: 1 }]), { onChange });

			await vi.waitFor(() => expect(checkboxes()).toHaveLength(1));

			act(() => checkboxes()[0]?.click());

			await vi.waitFor(() => expect(onChange).toHaveBeenLastCalledWith({ "?category": ["c1"] }));

		});

		it("should widen the collection as options are unticked", async () => {

			const onChange = vi.fn();

			mount(options([{ value: "c1", label: "Arts", count: 1 }]), { criteria: { "?category": ["c1"] }, onChange });

			await vi.waitFor(() => expect(checkboxes()[0]?.checked).toBe(true));

			act(() => checkboxes()[0]?.click());

			await vi.waitFor(() => expect(onChange).toHaveBeenLastCalledWith({}));

		});

	});

	describe("search", () => {

		function keywords(lookup: ReturnType<typeof options>) {
			return lookup.mock.calls.map(([{ model }]) => model.members["~category"]);
		}

		it("should narrow the options once the reader pauses typing", async () => {

			const lookup = options([]);

			mount(lookup);

			await ready();

			type("art");

			expect(keywords(lookup)).not.toContain("art");

			await vi.waitFor(() => expect(keywords(lookup)).toContain("art"), { timeout: 4 * AutoDelay });

		});

		it("should narrow the options at once on Enter", async () => {

			const lookup = options([]);

			mount(lookup);

			await ready();

			type("art");
			press("Enter");

			await vi.waitFor(() => expect(keywords(lookup)).toContain("art"), { timeout: AutoDelay / 2 });

		});

		it("should empty the field on Escape", async () => {

			mount(options([]));

			await ready();

			type("art");
			press("Enter");
			press("Escape");

			await vi.waitFor(() => expect(field()?.value).toBe(""));

		});

		it("should leave Escape to the page while the field is empty", async () => {

			mount(options([]));

			await ready();

			const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });

			act(() => void field()!.dispatchEvent(event));

			expect(event.defaultPrevented).toBe(false);

		});

		it("should not offer a clear while the field is empty", async () => {

			mount(options([{ value: "c1", label: "Arts", count: 1 }]), { criteria: { "?category": ["c1"] } });

			await vi.waitFor(() => expect(checkboxes()).toHaveLength(1));

			expect(clear()).toBeNull();

		});

		it("should empty the field on clear, leaving the options ticked", async () => {

			const lookup = options([{ value: "c1", label: "Arts", count: 1 }]);
			const onChange = vi.fn();

			mount(lookup, { criteria: { "?category": ["c1"] }, onChange });

			await vi.waitFor(() => expect(checkboxes()).toHaveLength(1));

			type("art");
			press("Enter");

			await vi.waitFor(() => expect(clear()).not.toBeNull());

			act(() => clear()?.click());

			await vi.waitFor(() => expect(field()?.value).toBe(""));
			await vi.waitFor(() => expect(keywords(lookup).at(-1)).not.toBe("art"));

			expect(onChange).not.toHaveBeenCalledWith({});
			expect(checkboxes()[0]?.checked).toBe(true);

		});

	});

	describe("reset", () => {

		it("should not offer a reset while nothing is ticked", async () => {

			mount(options([{ value: "c1", label: "Arts", count: 1 }]));

			await vi.waitFor(() => expect(checkboxes()).toHaveLength(1));

			expect(reset()).toBeNull();

		});

		it("should offer the clear in place of the reset while text is typed", async () => {

			mount(options([{ value: "c1", label: "Arts", count: 1 }]), { criteria: { "?category": ["c1"] } });

			await vi.waitFor(() => expect(reset()).not.toBeNull());

			type("art");

			await vi.waitFor(() => expect(clear()).not.toBeNull());

			expect(reset()).toBeNull();

		});

		it("should deselect every option", async () => {

			const onChange = vi.fn();

			mount(options([{ value: "c1", label: "Arts", count: 1 }]), { criteria: { "?category": ["c1"] }, onChange });

			await vi.waitFor(() => expect(reset()).not.toBeNull());

			act(() => reset()?.click());

			await vi.waitFor(() => expect(onChange).toHaveBeenLastCalledWith({}));

		});

	});

});
