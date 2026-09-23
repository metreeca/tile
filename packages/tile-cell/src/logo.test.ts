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


function mount(options: Parameters<typeof Logo>[0]): void {
	act(() => render(createElement(Logo, options), document.body));
}


afterEach(async () => {
	act(() => render(null, document.body));
});


describe("Logo", () => {

	describe("onClick", () => {

		it("should show the lockup as a button", async () => {

			mount({ onClick: () => {}, children: "App" });

			const button = document.querySelector("tile-logo > button");

			expect(button?.getAttribute("type")).toBe("button");
			expect(button?.textContent).toBe("App");

		});

		it("should hand activations to the handler", async () => {

			const onClick = vi.fn();

			mount({ onClick, children: "App" });

			act(() => document.querySelector<HTMLButtonElement>("tile-logo > button")?.click());

			expect(onClick).toHaveBeenCalledOnce();

		});

		it("should show the lockup as a link to a route", async () => {

			mount({ onClick: "/home", children: "App" });

			const anchor = document.querySelector("tile-logo > a");

			expect(anchor?.getAttribute("href")).toBe("/home");
			expect(anchor?.textContent).toBe("App");
			expect(document.querySelectorAll("button")).toHaveLength(0);

		});

		it("should show neither button nor link without a handler", async () => {

			mount({ children: "App" });

			expect(document.querySelector("tile-logo")?.textContent).toBe("App");
			expect(document.querySelectorAll("button, a")).toHaveLength(0);

		});

	});

});
