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
import { id, multiple, optional, resource } from "@metreeca/blue/resource";
import { AutoDelay } from "@metreeca/clay-cell";
import { immutable } from "@metreeca/core/values";
import type { Store as Backend } from "@metreeca/keep";
import type { Criteria } from "@metreeca/qest/model";
import { Store, useCollection, useRange } from "@metreeca/tile";
import type { Type } from "@metreeca/tile-type";
import { date } from "@metreeca/tile-type/date";
import { decimal } from "@metreeca/tile-type/decimal";
import { instant } from "@metreeca/tile-type/instant";
import { integer } from "@metreeca/tile-type/integer";
import { string } from "@metreeca/tile-type/string";
import { time } from "@metreeca/tile-type/time";
import { year } from "@metreeca/tile-type/year";
import { createElement, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Range } from "./range.js";


const entry = "https://example.com/catalogue/";

const Item = resource({ id: id(), year: optional(number()) });
const Catalogue = resource({ id: id(), members: multiple(reference(Item)) });


/**
 * A store handing over the lowest and highest values given, immutable as every store hands them out.
 */
function bounds(min?: unknown, max?: unknown) {
	return vi.fn(async () => immutable({ id: entry, members: [{ min, max }] }));
}

function backend(lookup: unknown): Backend {
	return {
		lookup,
		observe: () => () => {}
	} as unknown as Backend; // ;(test stub) only the members the binding calls are provided
}

function mount(lookup: unknown, {

	compact,
	type = integer,
	criteria = {},
	onChange = () => {}

}: {

	readonly compact?: boolean
	readonly type?: Type
	readonly criteria?: Criteria
	readonly onChange?: (criteria: Criteria) => void

} = {}): void {

	function Host() {

		const collection = useCollection({ entry, shape: Catalogue, query: criteria, onChange });

		return createElement(Range, {
			name: "Year",
			...(compact === undefined ? {} : { compact }),
			type,
			range: useRange(collection, "year")
		});

	}

	act(() => render(createElement(Store, {
		factory: () => backend(lookup),
		children: createElement(Host, {})
	}), document.body));

}

function facet(): Element | null {
	return document.querySelector("tile-range");
}

function header(): HTMLElement | null {
	return document.querySelector("tile-range > header");
}

function lower(): HTMLInputElement | null {
	return document.querySelector("input[aria-label=From]");
}

function upper(): HTMLInputElement | null {
	return document.querySelector("input[aria-label=To]");
}

function clear(): HTMLButtonElement | null {
	return document.querySelector("button[title=Reset]");
}

function disclosure(): HTMLButtonElement | null {
	return document.querySelector("button[aria-expanded]");
}

function focus(target: Element | null, type: "focusin" | "focusout", relatedTarget: Element | null = null): void {
	act(() => void target!.dispatchEvent(new FocusEvent(type, { bubbles: true, relatedTarget })));
}

function edit(input: HTMLInputElement | null, text: string): void {
	act(() => {
		input!.value = text; // test harness: the facet is ready
		input!.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

/**
 * Edits a field and leaves it, as a reader committing the field does.
 */
function commit(input: HTMLInputElement | null, text: string): void {
	edit(input, text);
	act(() => void input!.dispatchEvent(new FocusEvent("focusout", { bubbles: true })));
}

async function ready(): Promise<void> {
	await vi.waitFor(() => expect(lower()).not.toBeNull());
}


afterEach(async () => {
	act(() => render(null, document.body));
});


describe("Range", () => {

	describe("accessibility", () => {

		it("should be a group named by its name, shown in its header", async () => {

			mount(bounds(1990, 2020));

			const labelledby = facet()?.getAttribute("aria-labelledby") ?? "";

			expect(facet()?.getAttribute("role")).toBe("group");
			expect(document.getElementById(labelledby)?.textContent).toBe("Year");
			expect(facet()?.querySelector("header")?.contains(document.getElementById(labelledby))).toBe(true);

		});

		it("should be busy while the values are retrieved for the first time", async () => {

			mount(vi.fn(() => new Promise(() => {})));

			expect(facet()?.getAttribute("aria-busy")).toBe("true");

		});

		it("should hide the fields while the values are retrieved for the first time", async () => {

			mount(vi.fn(() => new Promise(() => {})));

			expect(facet()?.querySelector("header")?.textContent).toBe("Year");
			expect(facet()?.querySelector("section")?.hidden).toBe(true);

		});

		it("should not be busy once the values are retrieved", async () => {

			mount(bounds(1990, 2020));

			await ready();

			expect(facet()?.getAttribute("aria-busy")).not.toBe("true");

		});

		it("should name both fields", async () => {

			mount(bounds(1990, 2020));

			await ready();

			expect(upper()).not.toBeNull();

		});

		it("should offer no disclosure if compact is omitted", async () => {

			mount(bounds(1990, 2020));

			await ready();

			expect(disclosure()).toBeNull();

		});

		it("should state whether the fields are on show by the disclosure", async () => {

			mount(bounds(1990, 2020), { compact: true });

			await vi.waitFor(() => expect(disclosure()).not.toBeNull());

			expect(disclosure()?.getAttribute("aria-expanded")).toBe("false");

			act(() => disclosure()?.click());

			await vi.waitFor(() => expect(disclosure()?.getAttribute("aria-expanded")).toBe("true"));

		});

		it("should control a rendered region by the disclosure", async () => {

			mount(bounds(1990, 2020), { compact: true });

			await vi.waitFor(() => expect(disclosure()).not.toBeNull());

			const controls = disclosure()?.getAttribute("aria-controls") ?? "";

			expect(controls).not.toBe("");
			expect(document.getElementById(controls)).not.toBeNull();

		});

	});

	describe("compact", () => {

		it("should show no fields while closed with no bound set", async () => {

			mount(bounds(1990, 2020), { compact: true });

			await vi.waitFor(() => expect(disclosure()).not.toBeNull());

			expect(lower()).toBeNull();

		});

		it("should show the fields while closed with a bound set", async () => {

			mount(bounds(1990, 2020), { compact: true, criteria: { ">=year": 2000 } });

			await ready();

			expect(disclosure()?.getAttribute("aria-expanded")).toBe("false");

		});

		it("should show the fields once opened by the disclosure", async () => {

			mount(bounds(1990, 2020), { compact: true });

			await vi.waitFor(() => expect(disclosure()).not.toBeNull());

			act(() => disclosure()?.click());

			await ready();

		});

		it("should open as its header takes focus", async () => {

			mount(bounds(1990, 2020), { compact: true });

			await vi.waitFor(() => expect(disclosure()).not.toBeNull());

			focus(header(), "focusin");

			await ready();

		});

		it("should not open as the disclosure takes focus", async () => {

			mount(bounds(1990, 2020), { compact: true });

			await vi.waitFor(() => expect(disclosure()).not.toBeNull());

			focus(disclosure(), "focusin");

			await act(async () => {});

			expect(lower()).toBeNull();

		});

		it("should close as focus leaves the facet once opened by its header", async () => {

			mount(bounds(1990, 2020), { compact: true });

			await vi.waitFor(() => expect(disclosure()).not.toBeNull());

			focus(header(), "focusin");

			await ready();

			focus(lower(), "focusout", document.body);

			await vi.waitFor(() => expect(lower()).toBeNull());

		});

		it("should stay open as focus leaves the facet once opened by the disclosure", async () => {

			mount(bounds(1990, 2020), { compact: true });

			await vi.waitFor(() => expect(disclosure()).not.toBeNull());

			act(() => disclosure()?.click());

			await ready();

			focus(lower(), "focusout", document.body);

			await act(async () => {});

			expect(lower()).not.toBeNull();

		});

		it("should stay open as focus moves within the facet", async () => {

			mount(bounds(1990, 2020), { compact: true });

			await vi.waitFor(() => expect(disclosure()).not.toBeNull());

			focus(header(), "focusin");

			await ready();

			focus(lower(), "focusout", upper());

			await act(async () => {});

			expect(lower()).not.toBeNull();

		});

		it("should start open by the disclosure unless compact", async () => {

			mount(bounds(1990, 2020), { compact: false });

			await ready();

			expect(disclosure()?.getAttribute("aria-expanded")).toBe("true");

		});

		it("should stay open as focus leaves the facet unless compact", async () => {

			mount(bounds(1990, 2020), { compact: false });

			await ready();

			focus(lower(), "focusout", document.body);

			await act(async () => {});

			expect(lower()).not.toBeNull();

		});

		it("should close by the disclosure unless compact", async () => {

			mount(bounds(1990, 2020), { compact: false });

			await ready();

			act(() => disclosure()?.click());

			await vi.waitFor(() => expect(lower()).toBeNull());

		});

	});

	describe("fields", () => {

		it("should work on the native input the type works on", async () => {

			const inputs = async (type: Type) => {

				mount(bounds(), { type });

				await ready();

				focus(lower(), "focusin");

				await act(async () => {});

				const from = lower()!.type; // test harness: the facet is ready

				focus(lower(), "focusout", upper());
				focus(upper(), "focusin");

				await act(async () => {});

				return [from, upper()!.type];

			};

			expect(await inputs(integer)).toEqual(["number", "number"]);
			expect(await inputs(decimal)).toEqual(["number", "number"]);
			expect(await inputs(year)).toEqual(["number", "number"]);
			expect(await inputs(date)).toEqual(["date", "date"]);
			expect(await inputs(time)).toEqual(["time", "time"]);
			expect(await inputs(instant)).toEqual(["datetime-local", "datetime-local"]);
			expect(await inputs(instant.as(date))).toEqual(["date", "date"]);
			expect(await inputs(string)).toEqual(["text", "text"]);

		});

		it("should suggest the lowest and highest values as the type shows them", async () => {

			mount(bounds(1990, 2020));

			await vi.waitFor(() => expect([lower()?.placeholder, upper()?.placeholder]).toEqual([
				integer.format(1990), integer.format(2020)
			]));

		});

		it("should suggest the lowest and highest values on text fields while temporal fields are empty and unfocused", async () => {

			mount(bounds("2020-01-01", "2020-12-31"), { type: date });

			await ready();

			expect([lower()?.type, upper()?.type]).toEqual(["text", "text"]);
			expect([lower()?.placeholder, upper()?.placeholder]).toEqual([
				date.format("2020-01-01"), date.format("2020-12-31")
			]);

		});

		it("should switch temporal fields to the native input as they take focus", async () => {

			mount(bounds("2020-01-01", "2020-12-31"), { type: date });

			await ready();

			focus(lower(), "focusin");

			await vi.waitFor(() => expect([lower()?.type, upper()?.type]).toEqual(["date", "text"]));

			focus(lower(), "focusout", upper());
			focus(upper(), "focusin");

			await vi.waitFor(() => expect([lower()?.type, upper()?.type]).toEqual(["text", "date"]));

		});

		it("should suggest nothing where no item holds a value", async () => {

			mount(bounds());

			await ready();

			expect([lower()?.placeholder, upper()?.placeholder]).toEqual(["", ""]);

		});

		it("should hold the bounds set, as the input takes them", async () => {

			mount(bounds(1990, 2020), { criteria: { ">=year": 2000, "<=year": 2010 } });

			await ready();

			expect([lower()?.value, upper()?.value]).toEqual(["2000", "2010"]);

		});

		it("should constrain each field by the other", async () => {

			mount(bounds(1990, 2020), { criteria: { ">=year": 2000, "<=year": 2010 } });

			await ready();

			expect([lower()?.max, upper()?.min]).toEqual(["2010", "2000"]);

		});

		it("should not hold a bound field to the values on offer on its own side, which the bound narrows", async () => {

			mount(bounds(2005, 2008), { criteria: { ">=year": 2000, "<=year": 2010 } });

			await ready();

			expect([lower()?.hasAttribute("min"), upper()?.hasAttribute("max")]).toEqual([false, false]);
			expect([lower()?.checkValidity(), upper()?.checkValidity()]).toEqual([true, true]);

		});

		it("should constrain each field by the values on offer while the other is empty", async () => {

			mount(bounds(1990, 2020));

			await ready();

			expect([lower()?.min, lower()?.max, upper()?.min, upper()?.max]).toEqual(["1990", "2020", "1990", "2020"]);

		});

		it("should leave text fields unconstrained", async () => {

			mount(bounds("a", "z"), { type: string });

			await ready();

			expect([lower()?.hasAttribute("min"), upper()?.hasAttribute("max")]).toEqual([false, false]);

		});

		it("should show a failed retrieval as a critical note", async () => {

			mount(vi.fn(async () => { throw new Error("failed"); }));

			await vi.waitFor(() => expect(facet()?.querySelector("clay-note")?.textContent).toContain("Not Available"));

		});

	});

	describe("narrowing", () => {

		it("should hold an edit back until the reader pauses", async () => {

			const onChange = vi.fn();

			mount(bounds(1990, 2020), { onChange });

			await ready();

			edit(lower(), "2000");

			expect(onChange).not.toHaveBeenCalled();
			expect(lower()?.value).toBe("2000");

			await vi.waitFor(() => expect(onChange).toHaveBeenLastCalledWith({ ">=year": 2000 }), {
				timeout: 4 * AutoDelay
			});

		});

		it("should hold an edit the field rejects across a pause, as typing a value slowly does", async () => {

			const onChange = vi.fn();

			mount(bounds(1990, 2020), { onChange });

			await ready();

			focus(lower(), "focusin");
			edit(lower(), "19");

			await new Promise(resolve => setTimeout(resolve, 3 * AutoDelay));

			expect(onChange).not.toHaveBeenCalled();
			expect(lower()?.value).toBe("19");

			edit(lower(), "1995");

			await vi.waitFor(() => expect(onChange).toHaveBeenLastCalledWith({ ">=year": 1995 }), {
				timeout: 4 * AutoDelay
			});

			expect(onChange).toHaveBeenCalledTimes(1);

		});

		it("should apply a run of edits once, as stepping through values does", async () => {

			const onChange = vi.fn();

			mount(bounds(1990, 2020), { onChange });

			await ready();

			edit(lower(), "1991");
			edit(lower(), "1992");
			edit(lower(), "1993");

			await vi.waitFor(() => expect(onChange).toHaveBeenCalled(), { timeout: 4 * AutoDelay });

			expect(onChange.mock.calls).toEqual([[{ ">=year": 1993 }]]);

		});

		it("should hold an edit on a masked field back until the reader commits it", async () => {

			const onChange = vi.fn();

			mount(bounds("2020-01-01", "2020-12-31"), { type: date, onChange });

			await ready();

			focus(lower(), "focusin");
			edit(lower(), "2020-06-01");

			await new Promise(resolve => setTimeout(resolve, 3 * AutoDelay));

			expect(onChange).not.toHaveBeenCalled();

			focus(lower(), "focusout");

			await vi.waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));

		});

		it("should start an empty field from the value it suggests as it takes focus", async () => {

			mount(bounds(1990, 2020));

			await ready();

			focus(upper(), "focusin");

			await vi.waitFor(() => expect(upper()?.value).toBe("2020"));

		});

		it("should select the bound a field holds as it takes focus", async () => {

			mount(bounds("a", "z"), { type: string, criteria: { ">=year": "m" } });

			await vi.waitFor(() => expect(lower()?.value).toBe("m"));

			focus(lower(), "focusin");

			await vi.waitFor(() => expect([lower()?.selectionStart, lower()?.selectionEnd]).toEqual([0, 1]));

		});

		it("should select the value an empty field suggests as it takes focus", async () => {

			const selected = vi.spyOn(HTMLInputElement.prototype, "select");

			mount(bounds(1990, 2020));

			await ready();

			focus(upper(), "focusin");

			const values = () => selected.mock.contexts.map(context => context === upper() ? upper()?.value : undefined);

			await vi.waitFor(() => expect(values()).toEqual(["2020"]));

			selected.mockRestore();

		});

		it("should apply nothing for a suggestion left as it is", async () => {

			const onChange = vi.fn();

			mount(bounds(1990, 2020), { onChange });

			await ready();

			focus(upper(), "focusin");

			await vi.waitFor(() => expect(upper()?.value).toBe("2020"));

			focus(upper(), "focusout");

			await act(async () => {});

			expect(onChange).not.toHaveBeenCalled();
			expect(upper()?.value).toBe("");

		});

		it("should show an empty field once its applied bound is reset", async () => {

			const onChange = vi.fn();

			mount(bounds(1990, 2020), { onChange });

			await ready();

			commit(lower(), "2000");

			await vi.waitFor(() => expect(clear()).not.toBeNull());

			act(() => clear()?.click());

			await vi.waitFor(() => expect(onChange).toHaveBeenLastCalledWith({}));
			await vi.waitFor(() => expect(lower()?.value).toBe(""));

		});

		it("should apply an edit at once on Enter", async () => {

			const onChange = vi.fn();

			mount(bounds(1990, 2020), { onChange });

			await ready();

			edit(lower(), "2000");

			act(() => void lower()!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));

			await vi.waitFor(() => expect(onChange).toHaveBeenLastCalledWith({ ">=year": 2000 }), {
				timeout: AutoDelay / 2
			});

		});

		it("should apply a lower bound once committed", async () => {

			const onChange = vi.fn();

			mount(bounds(1990, 2020), { onChange });

			await ready();

			commit(lower(), "2000");

			await vi.waitFor(() => expect(onChange).toHaveBeenLastCalledWith({ ">=year": 2000 }));

		});

		it("should apply an upper bound once committed", async () => {

			const onChange = vi.fn();

			mount(bounds(1990, 2020), { onChange });

			await ready();

			commit(upper(), "2010");

			await vi.waitFor(() => expect(onChange).toHaveBeenLastCalledWith({ "<=year": 2010 }));

		});

		it("should bound instants shown as days by whole days", async () => {

			const onChange = vi.fn();

			mount(bounds("2020-01-01T10:00:00Z", "2020-12-31T10:00:00Z"), { type: instant.as(date), onChange });

			await ready();

			commit(lower(), "2020-06-01");

			await vi.waitFor(() => expect(onChange).toHaveBeenLastCalledWith({
				">=year": new Date(2020, 5, 1).toISOString()
			}));

			commit(upper(), "2020-06-30");

			await vi.waitFor(() => expect(onChange).toHaveBeenLastCalledWith({
				">=year": new Date(2020, 5, 1).toISOString(),
				"<=year": new Date(new Date(2020, 6, 1).getTime()-1).toISOString()
			}));

		});

		it("should remove a bound once its field is emptied", async () => {

			const onChange = vi.fn();

			mount(bounds(1990, 2020), { criteria: { ">=year": 2000, "<=year": 2010 }, onChange });

			await ready();

			commit(lower(), "");

			await vi.waitFor(() => expect(onChange).toHaveBeenLastCalledWith({ "<=year": 2010 }));

		});

		it("should leave the bound as it was on text the type cannot read", async () => {

			const onChange = vi.fn();

			mount(bounds("a", "z"), { type: { ...string, parse: () => { throw new SyntaxError("malformed"); } }, onChange });

			await ready();

			commit(lower(), "m");

			await act(async () => {});

			expect(onChange).not.toHaveBeenCalled();

		});

	});

	describe("reset", () => {

		it("should not offer a reset while no bound is set", async () => {

			mount(bounds(1990, 2020));

			await ready();

			expect(clear()).toBeNull();

		});

		it("should remove both bounds", async () => {

			const onChange = vi.fn();

			mount(bounds(1990, 2020), { criteria: { ">=year": 2000, "<=year": 2010 }, onChange });

			await vi.waitFor(() => expect(clear()).not.toBeNull());

			act(() => clear()?.click());

			await vi.waitFor(() => expect(onChange).toHaveBeenLastCalledWith({}));

		});

	});

});
