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

import { type JSX, render } from "preact";
import { describe, expect, it } from "vitest";
import { Info } from "./info.js";


describe("Info", () => {

	const rendered = (element: JSX.Element): null | HTMLElement => {

		const container = document.createElement("div");

		render(element, container);

		return container.querySelector<HTMLElement>(":scope > tile-info");

	};

	const labels = (element: JSX.Element): readonly (null | string)[] =>
		Array.from(rendered(element)?.querySelectorAll("dt") ?? [], ({ textContent }) => textContent);

	const values = (element: JSX.Element): readonly (null | string)[] =>
		Array.from(rendered(element)?.querySelectorAll("dd") ?? [], ({ textContent }) => textContent);


	describe("empty values", () => {

		it("leaves out undefined, null and empty string values", async () => {

			expect(labels(<Info>{{
				undefined: undefined,
				null: null,
				empty: "",
				shown: "value"
			}}</Info>)).toEqual([ "shown" ]);

		});

		it("shows zero", async () => {

			expect(values(<Info>{{ count: 0 }}</Info>)).toEqual([ "0" ]);

		});

		it("shows booleans by name", async () => {

			expect(values(<Info>{{ draft: false, published: true }}</Info>)).toEqual([ "false", "true" ]);

		});

		it("renders nothing if every value is empty", async () => {

			expect(rendered(<Info>{{ undefined: undefined, null: null, empty: "" }}</Info>)).toBeNull();

		});

	});

});
