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

import { integer } from "@metreeca/blue/number";
import { reference } from "@metreeca/blue/reference";
import { id, multiple, required, resource } from "@metreeca/blue/resource";
import { string } from "@metreeca/blue/string";
import { immutable } from "@metreeca/core/values";
import type { Store as Backend } from "@metreeca/keep";
import type { Order } from "@metreeca/qest/model";
import { Store } from "@metreeca/tile";
import { useCollection } from "@metreeca/tile/collection";
import { useMembers } from "@metreeca/tile/members";
import { createElement, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Table } from "./table.js";


const entry = "https://example.com/catalogue/";

const Item = resource({ id: id(), label: required(string()), year: required(integer()) });
const Catalogue = resource({ id: id(), members: multiple(reference(Item)) });

type Row = { id: string, label: string, year: number };


const rows: readonly Row[] = [
	{ id: `${entry}0`, label: "alpha", year: 2020 },
	{ id: `${entry}1`, label: "beta", year: 2020 },
	{ id: `${entry}2`, label: "gamma", year: 2021 }
];


/**
 * A store holding the items given, immutable as every store hands them out.
 */
function catalogue(items: readonly Row[]) {
	return vi.fn(async (_: { model: { members: object } }) => immutable({ id: entry, members: items }));
}

function backend(lookup: unknown): Backend {
	return {
		lookup,
		observe: () => () => {}
	} as unknown as Backend; // ;(test stub) only the members the binding calls are provided
}

function mount(lookup: unknown, {

	name,
	hierarchy,
	striped,
	placeholder,
	order = { label: "asc" }

}: {

	name?: string
	hierarchy?: boolean
	striped?: boolean
	placeholder?: string
	order?: { readonly label?: Order, readonly year?: Order }

} = {}): void {

	function Host() {

		const members = useMembers(useCollection({ entry, shape: Catalogue }), {
			model: { id: {}, label: {}, year: {} },
			order
		});

		return createElement(Table<typeof Catalogue, "members", { id: {}, label: {}, year: {} }>, {
			name,
			hierarchy,
			striped,
			members,
			placeholder,
			columns: {
				Year: { sort: "year", align: "end", render: item => item.year },
				Label: { sort: "label", render: item => item.label },
				Code: { render: item => createElement("code", {}, item.label) }
			}
		});

	}

	act(() => render(createElement(Store, {
		factory: () => backend(lookup),
		children: createElement(Host, {})
	}), document.body));

}

function models(lookup: ReturnType<typeof catalogue>) {
	return lookup.mock.calls.map(([{ model }]) => model);
}

function headers(): readonly string[] {
	return Array.from(document.querySelectorAll("tile-table thead th"), cell => cell.textContent ?? "");
}

function cells(): readonly (readonly string[])[] {
	return Array.from(document.querySelectorAll("tile-table tbody tr"), row =>
		Array.from(row.querySelectorAll("td"), cell => cell.textContent ?? "")
	);
}

function header(text: string): HTMLTableCellElement {
	return Array.from(document.querySelectorAll<HTMLTableCellElement>("tile-table thead th"))
		.find(cell => cell.textContent === text)!; // test harness: the header is rendered
}

function sorter(text: string) {
	return header(text).querySelector("button");
}

function reset() {
	return document.querySelector<HTMLButtonElement>("tile-table thead th:last-child button");
}


afterEach(async () => {
	act(() => render(null, document.body));
});


describe("Table", () => {

	it("should show a row per member and a column per entry, headed by its key", async () => {

		mount(catalogue(rows));

		await vi.waitFor(() => expect(cells()).toHaveLength(3));

		expect(headers().slice(0, 3)).toEqual(["Year", "Label", "Code"]);
		expect(cells().map(row => row.slice(0, 3))).toEqual([
			["2020", "alpha", "alpha"],
			["2020", "beta", "beta"],
			["2021", "gamma", "gamma"]
		]);

	});

	it("should head each column for the cells below it", async () => {

		mount(catalogue(rows));

		await vi.waitFor(() => expect(cells()).toHaveLength(3));

		expect(header("Label").getAttribute("scope")).toBe("col");

	});

	it("should be named as given", async () => {

		mount(catalogue(rows), { name: "Courses" });

		await vi.waitFor(() => expect(document.querySelector("tile-table table")?.getAttribute("aria-label")).toBe("Courses"));

	});

	it("should set the values of an end-aligned column at the end of their cells", async () => {

		mount(catalogue(rows));

		await vi.waitFor(() => expect(cells()).toHaveLength(3));

		expect(header("Year").classList.contains("end")).toBe(true);
		expect(document.querySelector("tile-table tbody td")?.classList.contains("end")).toBe(true);
		expect(header("Label").classList.contains("end")).toBe(false);

	});

	describe("sorting", () => {

		it("should offer a sort button on sortable columns only", async () => {

			mount(catalogue(rows));

			await vi.waitFor(() => expect(cells()).toHaveLength(3));

			expect(sorter("Year")).not.toBeNull();
			expect(sorter("Code")).toBeNull();

		});

		it("should mark the direction on the columns the items are sorted on only", async () => {

			mount(catalogue(rows));

			await vi.waitFor(() => expect(cells()).toHaveLength(3));

			expect(header("Label").querySelector("svg")).not.toBeNull();
			expect(header("Year").querySelector("svg")).toBeNull();
			expect(header("Code").querySelector("svg")).toBeNull();

		});

		it("should mark every column the items are sorted on", async () => {

			mount(catalogue(rows), { order: { label: 1, year: -2 } });

			await vi.waitFor(() => expect(cells()).toHaveLength(3));

			expect(header("Label").querySelector("svg")).not.toBeNull();
			expect(header("Year").querySelector("svg")).not.toBeNull();

		});

		it("should announce the column the items are sorted on", async () => {

			mount(catalogue(rows));

			await vi.waitFor(() => expect(cells()).toHaveLength(3));

			expect(header("Label").getAttribute("aria-sort")).toBe("ascending");
			expect(header("Year").hasAttribute("aria-sort")).toBe(false);

		});

		it("should sort increasing on a column the items aren't sorted on", async () => {

			const lookup = catalogue(rows);

			mount(lookup);

			await vi.waitFor(() => expect(cells()).toHaveLength(3));

			act(() => sorter("Year")!.click());

			await vi.waitFor(() => expect(models(lookup).at(-1)).toMatchObject({ members: { "^year": "asc" } }));
			await vi.waitFor(() => expect(header("Year").getAttribute("aria-sort")).toBe("ascending"));

		});

		it("should reverse the order on the column the items are sorted on", async () => {

			const lookup = catalogue(rows);

			mount(lookup);

			await vi.waitFor(() => expect(cells()).toHaveLength(3));

			act(() => sorter("Label")!.click());

			await vi.waitFor(() => expect(models(lookup).at(-1)).toMatchObject({ members: { "^label": "desc" } }));
			await vi.waitFor(() => expect(header("Label").getAttribute("aria-sort")).toBe("descending"));

		});

	});

	describe("order reset", () => {

		it("should be withheld while the items are in the starting order", async () => {

			mount(catalogue(rows));

			await vi.waitFor(() => expect(cells()).toHaveLength(3));

			expect(reset()).toBeNull();

		});

		it("should restore the starting order", async () => {

			const lookup = catalogue(rows);

			mount(lookup);

			await vi.waitFor(() => expect(cells()).toHaveLength(3));

			act(() => sorter("Year")!.click());

			await vi.waitFor(() => expect(reset()).not.toBeNull());

			act(() => reset()!.click());

			await vi.waitFor(() => expect(models(lookup).at(-1)).toMatchObject({ members: { "^label": "asc" } }));
			await vi.waitFor(() => expect(reset()).toBeNull());

		});

	});

	it("should end each row with a link to the item", async () => {

		mount(catalogue(rows));

		await vi.waitFor(() => expect(cells()).toHaveLength(3));

		expect(Array.from(document.querySelectorAll("tile-table tbody a"), link => link.getAttribute("href")))
			.toEqual(rows.map(row => row.id));

	});

	describe("hierarchy", () => {

		function faded(): readonly (readonly boolean[])[] {
			return Array.from(document.querySelectorAll("tile-table tbody tr"), row =>
				Array.from(row.querySelectorAll("td"), cell => cell.classList.contains("repeated")).slice(0, 3)
			);
		}

		it("should fade the leading cells repeating the ones above", async () => {

			mount(catalogue(rows), { hierarchy: true });

			await vi.waitFor(() => expect(cells()).toHaveLength(3));

			expect(faded()).toEqual([
				[false, false, false],
				[true, false, false],
				[false, false, false]
			]);

		});

		it("should never count a cell rendering an element as repeating", async () => {

			mount(catalogue([rows[0]!, rows[0]!]), { hierarchy: true }); // test fixture: the rows are given

			await vi.waitFor(() => expect(cells()).toHaveLength(2));

			expect(faded()[1]).toEqual([true, true, false]);

		});

		it("should fade nothing if not asked to", async () => {

			mount(catalogue(rows));

			await vi.waitFor(() => expect(cells()).toHaveLength(3));

			expect(faded().flat()).not.toContain(true);

		});

	});

	describe("striping", () => {

		function striped(): boolean {
			return document.querySelector("tile-table > table")?.hasAttribute("data-striped") ?? false;
		}

		it("should mark the table as striped if asked to", async () => {

			mount(catalogue(rows), { striped: true });

			await vi.waitFor(() => expect(cells()).toHaveLength(3));

			expect(striped()).toBe(true);

		});

		it("should leave the table unstriped if not asked to", async () => {

			mount(catalogue(rows));

			await vi.waitFor(() => expect(cells()).toHaveLength(3));

			expect(striped()).toBe(false);

		});

	});

	describe("placeholder", () => {

		it("should word the area as loading while nothing is retrieved", async () => {

			mount(vi.fn(() => new Promise(() => {})), { placeholder: "Items" });

			expect(document.querySelector("tile-hint")?.textContent).toContain("Loading");

		});

		it("should word the area as matching nothing for an empty collection", async () => {

			mount(catalogue([]), { placeholder: "Items" });

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

		it("should show a note in place of the table", async () => {

			mount(vi.fn(async () => Promise.reject({ status: 503 })));

			await vi.waitFor(() => expect(document.querySelector("tile-note[role=alert]")).not.toBeNull());

			expect(document.querySelector("tile-table")).toBeNull();

		});

	});

});
