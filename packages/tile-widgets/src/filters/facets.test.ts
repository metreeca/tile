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

import { Facets } from "./facets.js";


afterEach(async () => {
	act(() => render(null, document.body));
});


describe("Facets", () => {

	it("should render its own element", async () => {

		act(() => render(createElement(Facets, {}), document.body));

		expect(document.querySelector("tile-facets")).not.toBeNull();

	});

	it("should hold the facets given, in order", async () => {

		act(() => render(createElement(Facets, {},
			createElement("tile-search", {}),
			createElement("tile-tally", {})
		), document.body));

		expect(Array.from(document.querySelectorAll("tile-facets > *"), element => element.localName))
			.toEqual(["tile-search", "tile-tally"]);

	});

});
