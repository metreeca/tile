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

import { Router } from "@metreeca/tile-data/router";
import { createElement, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Link } from "./link.js";


function mount(...links: Parameters<typeof Link>[0][]): void {
	act(() => render(createElement(Router, {
		children: createElement("nav", {}, links.map(link => createElement(Link, { key: link.href, ...link })))
	}), document.body));
}

function anchors(selector: string = "a"): string[] {
	return Array.from(document.querySelectorAll(selector), anchor => anchor.getAttribute("href") ?? "");
}


beforeEach(async () => {
	history.replaceState(null, "", "/");
});

afterEach(async () => {
	act(() => render(null, document.body));
});


describe("Link", () => {

	it("should link to the route", async () => {

		mount({ href: "/a" });

		expect(anchors()).toEqual(["/a"]);

	});

	it("should strip the wildcard from the link", async () => {

		mount({ href: "/*" });

		expect(anchors()).toEqual(["/"]);

	});

	it("should take a trailing star as a wildcard only after a slash", async () => {

		history.replaceState(null, "", "/ab");

		mount({ active: true, href: "/a*" });

		expect(anchors()).toEqual(["/a*"]);
		expect(anchors("a[active]")).toEqual([]);

	});

	describe("active", () => {

		it("should mark active links to the current route", async () => {

			history.replaceState(null, "", "/a");

			mount({ active: true, href: "/a" }, { active: true, href: "/b" });

			expect(anchors("a[active]")).toEqual(["/a"]);
			expect(anchors("a[aria-current='page']")).toEqual(["/a"]);

		});

		it("should mark active wildcard links to enclosing routes", async () => {

			history.replaceState(null, "", "/a/b");

			mount({ active: true, href: "/a/*" }, { active: true, href: "/a" }, { active: true, href: "/b/*" });

			expect(anchors("a[active]")).toEqual(["/a/"]);
			expect(anchors("a[aria-current='true']")).toEqual(["/a/"]);

		});

		it("should not mark links not flagged as active", async () => {

			history.replaceState(null, "", "/a");

			mount({ href: "/a" });

			expect(anchors("a[active]")).toEqual([]);
			expect(anchors("a[aria-current]")).toEqual([]);

		});

	});

	describe("look", () => {

		it("should state the look on the element", async () => {

			mount({ look: "subtle", href: "/a" }, { look: "strong", href: "/b" });

			expect(Array.from(document.querySelectorAll("tile-link"), link => link.getAttribute("look")))
				.toEqual(["subtle", "strong"]);

		});

		it("should leave an unstated look off the element", async () => {

			mount({ href: "/a" });

			expect(document.querySelectorAll("tile-link[look]")).toHaveLength(0);

		});

	});

	describe("native", () => {

		it("should mark native links", async () => {

			mount({ native: true, href: "/a" }, { href: "/b" });

			expect(anchors("a[native]")).toEqual(["/a"]);

		});

	});

	describe("onClick", () => {

		function click(): void {
			act(() => void document.querySelector("a")?.click());
		}

		it("should hand the activation to the handler", async () => {

			const onClick = vi.fn();

			mount({ href: "/a", onClick });
			click();

			expect(onClick).toHaveBeenCalledOnce();

		});

		it("should not follow links given a handler", async () => {

			mount({ href: "/a", onClick: () => {} });
			click();

			expect(location.pathname).toBe("/");

		});

		it("should follow links given no handler", async () => {

			mount({ href: "/a" });
			click();

			expect(location.pathname).toBe("/a");

		});

	});

});
