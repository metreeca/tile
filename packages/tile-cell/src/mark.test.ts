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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Mark } from "./mark.js";


function mount(text: string, meta?: Parameters<typeof Mark>[0]["meta"]): void {
	act(() => render(createElement(Mark, { meta, children: text }), document.body));
}

function texts(selector: string): string[] {
	return Array.from(document.querySelectorAll(selector), element => element.textContent ?? "");
}

function attributes(selector: string, name: string): string[] {
	return Array.from(document.querySelectorAll(selector), element => element.getAttribute(name) ?? "");
}


beforeEach(async () => {
	history.replaceState(null, "", "/");
});

afterEach(async () => {
	act(() => render(null, document.body));
	vi.restoreAllMocks();
});


describe("Mark", () => {

	describe("document", () => {

		it("should render the text in a tile-mark element", async () => {

			mount("# Title\n\nSome *text*.");

			expect(texts("tile-mark > h1")).toEqual(["Title"]);
			expect(texts("tile-mark > p > em")).toEqual(["text"]);

		});

		it("should leave the front matter unrendered", async () => {

			mount("---\ntitle: Hidden\n---\n\nShown");

			expect(document.body.textContent).not.toContain("Hidden");
			expect(texts("tile-mark > p")).toEqual(["Shown"]);

		});

		it("should give headings unique slug ids", async () => {

			mount("# Hello World\n\n## Hello World");

			expect(attributes("h1, h2", "id")).toEqual(["hello-world", "hello-world-1"]);

		});

		it("should render GitHub Flavored Markdown tables", async () => {

			mount("| a | b |\n|---|---|\n| 1 | 2 |");

			expect(texts("table td")).toEqual(["1", "2"]);

		});

		it("should render GitHub alerts", async () => {

			mount("> [!NOTE]\n> Noted");

			expect(document.querySelector(".markdown-alert-note")?.textContent).toContain("Noted");

		});

		it("should replace emoji shortcodes", async () => {

			mount("Fine :+1:");

			expect(texts("p")).toEqual(["Fine 👍"]);

		});

		it("should highlight fenced code by language", async () => {

			mount("```js\nconst x = 1;\n```");

			expect(document.querySelectorAll("pre > code.hljs span[class^='hljs-']").length).toBeGreaterThan(0);

		});

		it("should trim fenced code and compact its indentation", async () => {

			mount("```\n\n\ta\n        b\n\n```");

			expect(texts("pre > code")).toEqual(["a\n    b\n"]); // the closing newline is added to every block

		});

		it("should never render raw HTML", async () => {

			mount("<script>alert(1)</script>\n\n<b>bold</b>");

			expect(document.querySelectorAll("script, b").length).toBe(0);

		});

		describe("links", () => {

			it("should rewrite links to Markdown files to their routes", async () => {

				mount([
					"[a](guide.md)",
					"[b](docs/guide.md#part)",
					"[c](index.md)",
					"[d](docs/index.md#part)",
					"[e](https://example.com/page)",
					"[f](notes.md.txt)"
				].join(" "));

				expect(attributes("a", "href")).toEqual([
					"guide",
					"docs/guide#part",
					"",
					"docs/#part",
					"https://example.com/page",
					"notes.md.txt"
				]);

			});

			it("should drop links and sources with unsafe protocols", async () => {

				mount("[a](javascript:alert(1)) ![b](data:image/png;base64,AAAA) [c](mailto:x@example.com)");

				expect(attributes("a", "href")).toEqual(["", "mailto:x@example.com"]);
				expect(attributes("img", "src")).toEqual([""]);

			});

		});

		describe("scrolling", () => {

			it("should scroll the heading named by the fragment into view on render", async () => {

				const scroll = vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(() => {});

				history.replaceState(null, "", "/#second");

				mount("# First\n\n# Second");

				expect(scroll.mock.contexts.map(element => element.id)).toEqual(["second"]);

			});

			it("should scroll the heading named by the fragment into view on fragment change", async () => {

				const scroll = vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(() => {});

				mount("# First\n\n# Second");

				history.replaceState(null, "", "/#first");

				act(() => { window.dispatchEvent(new HashChangeEvent("hashchange")); });

				expect(scroll.mock.contexts.map(element => element.id)).toEqual(["first"]);

			});

			it("should stop following the fragment once removed", async () => {

				const scroll = vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(() => {});

				mount("# First");

				act(() => render(null, document.body));

				history.replaceState(null, "", "/#first");

				window.dispatchEvent(new HashChangeEvent("hashchange"));

				expect(scroll).not.toHaveBeenCalled();

			});

		});

	});

	describe("table of contents", () => {

		it("should list headings as links to their slug ids", async () => {

			mount("---\ntitle: T\n---\n\n# Hello World\n\nText\n\n## Hello World\n\n### Other", "toc");

			expect(texts("tile-mark a")).toEqual(["Hello World", "Hello World", "Other"]);
			expect(attributes("tile-mark a", "href")).toEqual(["#hello-world", "#hello-world-1", "#other"]);

		});

		it("should keep the heading levels", async () => {

			mount("# A\n\n## B", "toc");

			expect(texts("tile-mark > h1 > a")).toEqual(["A"]);
			expect(texts("tile-mark > h2 > a")).toEqual(["B"]);

		});

		it("should leave non-heading content out", async () => {

			mount("# A\n\nText\n\n- item", "toc");

			expect(document.querySelectorAll("tile-mark p, tile-mark ul").length).toBe(0);

		});

	});

	describe("front matter", () => {

		const text = "---\ntitle: The Title\nauthor:  Someone  \n---\n\n# Body";

		it("should render the value of a key", async () => {

			mount(text, "author");

			expect(document.body.textContent).toBe("Someone");

		});

		it("should render nothing for a missing key", async () => {

			mount(text, "date");

			expect(document.body.textContent).toBe("");

		});

		it("should render nothing for a text without front matter", async () => {

			mount("# Body", "title");

			expect(document.body.textContent).toBe("");

		});

		it("should hand all values to a function", async () => {

			const meta = vi.fn(() => "rendered");

			mount(text, meta);

			expect(meta).toHaveBeenCalledWith({ title: "The Title", author: "Someone" });
			expect(document.body.textContent).toBe("rendered");

		});

	});

});
