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

import { createElement, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it } from "vitest";

import { Toc } from "./toc.js";


function mount(options: Parameters<typeof Toc>[0]): void {
	act(() => render(createElement(Toc, options), document.body));
}

function texts(selector: string): string[] {
	return Array.from(document.querySelectorAll(selector), element => element.textContent ?? "");
}

function attributes(selector: string, name: string): string[] {
	return Array.from(document.querySelectorAll(selector), element => element.getAttribute(name) ?? "");
}


afterEach(async () => {
	act(() => render(null, document.body));
});


describe("Toc", () => {

	it("should list entries as links to their locations, in order", async () => {

		mount({ entries: [{ label: "Intro", href: "#intro" }, { label: "Usage", href: "#usage" }] });

		expect(texts("tile-toc > nav > ul > li > a")).toEqual(["Intro", "Usage"]);
		expect(attributes("tile-toc > nav > ul > li > a", "href")).toEqual(["#intro", "#usage"]);

	});

	it("should nest entries in lists under the entry holding them", async () => {

		mount({
			entries: [
				{
					label: "A", href: "#a", entries: [
						{ label: "B", href: "#b", entries: [{ label: "C", href: "#c" }] },
						{ label: "D", href: "#d" }
					]
				},
				{ label: "E", href: "#e" }
			]
		});

		expect(texts("tile-toc > nav > ul > li > a")).toEqual(["A", "E"]);
		expect(texts("tile-toc > nav > ul > li > ul > li > a")).toEqual(["B", "D"]);
		expect(texts("tile-toc > nav > ul > li > ul > li > ul > li > a")).toEqual(["C"]);

	});

	it("should render no nested list for an entry holding none", async () => {

		mount({ entries: [{ label: "A", href: "#a", entries: [] }, { label: "B", href: "#b" }] });

		expect(document.querySelectorAll("tile-toc li > ul").length).toBe(0);

	});

	it("should render rich labels", async () => {

		mount({ entries: [{ label: createElement("code", {}, "Toc"), href: "#toc" }] });

		expect(texts("tile-toc a > code")).toEqual(["Toc"]);

	});

	it("should render nothing for no entries", async () => {

		mount({ entries: [] });

		expect(document.querySelectorAll("tile-toc").length).toBe(0);

	});

	describe("name", () => {

		it("should name the landmark", async () => {

			mount({ name: "Contents", entries: [{ label: "A", href: "#a" }] });

			expect(document.querySelector("tile-toc > nav")?.getAttribute("aria-label")).toBe("Contents");

		});

		it("should leave the landmark unnamed if omitted", async () => {

			mount({ entries: [{ label: "A", href: "#a" }] });

			expect(document.querySelector("tile-toc > nav")?.hasAttribute("aria-label")).toBe(false);

		});

	});

});
