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

import { Path } from "./path.js";


function mount(options: Parameters<typeof Path>[0]): void {
	act(() => render(createElement(Path, options), document.body));
}

function steps(): ReadonlyArray<Element> {
	return Array.from(document.querySelectorAll("tile-path > nav > ol > li"));
}


afterEach(async () => {
	act(() => render(null, document.body));
});


describe("Path", () => {

	it("should show each step as a list item, outermost first", async () => {

		mount({ children: ["Home", createElement("b", {}, "Users"), "Alice"] });

		expect(steps().map(step => step.textContent)).toEqual(["Home", "Users", "Alice"]);
		expect(steps()[1]?.querySelector("b")).not.toBeNull();

	});

	it("should drop empty steps", async () => {

		mount({ children: ["Home", undefined, null, false, "Alice"] });

		expect(steps().map(step => step.textContent)).toEqual(["Home", "Alice"]);

	});

	it("should announce the last step as the current page", async () => {

		mount({ children: ["Home", "Users", "Alice"] });

		expect(steps().map(step => step.getAttribute("aria-current"))).toEqual([null, null, "page"]);

	});

	it("should render no step for no children", async () => {

		mount({});

		expect(steps()).toEqual([]);

	});

	describe("name", () => {

		it("should name the landmark", async () => {

			mount({ name: "Breadcrumb", children: "Home" });

			expect(document.querySelector("tile-path > nav")?.getAttribute("aria-label")).toBe("Breadcrumb");

		});

		it("should leave the landmark unnamed if omitted", async () => {

			mount({ children: "Home" });

			expect(document.querySelector("tile-path > nav")?.hasAttribute("aria-label")).toBe(false);

		});

	});

});
