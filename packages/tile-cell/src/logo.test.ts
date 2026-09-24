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
import { afterEach, describe, expect, it, vi } from "vitest";

import { Logo } from "./logo.js";


/*
 * The app icon is read off the document as the app module loads, so the tag stating it is in place before any import.
 */

const icon = vi.hoisted(() => {

	const link = document.createElement("link");

	link.rel = "icon";
	link.href = "/icon.svg";

	document.head.append(link);

	return link.href;

});


function mount(options: Parameters<typeof Logo>[0]): void {
	act(() => render(createElement(Logo, options), document.body));
}


afterEach(async () => {
	act(() => render(null, document.body));
});


describe("Logo", () => {

	it("should show the app mark alone", async () => {

		mount({});

		const logo = document.querySelector("tile-logo");

		expect(Array.from(logo?.children ?? [], child => child.tagName)).toEqual(["IMG"]);
		expect(logo?.querySelector("img")?.getAttribute("src")).toBe(icon);

	});

	describe("name", () => {

		it("should name the mark", async () => {

			mount({ name: "App" });

			expect(document.querySelector("tile-logo > img")?.getAttribute("alt")).toBe("App");

		});

		it("should leave an unnamed mark decorative", async () => {

			mount({});

			expect(document.querySelector("tile-logo > img")?.getAttribute("alt")).toBe("");

		});

	});

});
