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

import { reference } from "@metreeca/blue/reference";
import { id, multiple, required, resource } from "@metreeca/blue/resource";
import { string } from "@metreeca/blue/string";
import type { Criteria } from "@metreeca/qest/model";
import { useCollection } from "@metreeca/tile-data/store";
import { createElement, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Clear } from "./clear.js";


const entry = "https://example.com/catalogue/";

const Item = resource({ id: id(), label: required(string()) });
const Catalogue = resource({ id: id(), members: multiple(reference(Item)) });


function mount(criteria: Criteria, onChange: (criteria: Criteria) => void = () => {}): void {

	function Host() {
		return createElement(Clear<typeof Catalogue, "members">, {
			collection: useCollection({ entry, shape: Catalogue, criteria, onChange })
		});
	}

	act(() => render(createElement(Host, {}), document.body));

}

function button(): HTMLButtonElement | null {
	return document.querySelector("button");
}


afterEach(async () => {
	act(() => render(null, document.body));
});


describe("Clear", () => {

	it("should be named for assistive technology", async () => {

		mount({});

		expect(button()?.title).toBe("Clear Filters");

	});

	it("should be disabled while no criterion narrows the collection", async () => {

		mount({});

		expect(button()?.disabled).toBe(true);

	});

	it("should be enabled while a criterion narrows the collection", async () => {

		mount({ "~label": "item" });

		expect(button()?.disabled).toBe(false);

	});

	it("should remove every criterion narrowing the collection", async () => {

		const onChange = vi.fn();

		mount({ "~label": "item", ">=label": "a" }, onChange);

		act(() => button()?.click());

		await vi.waitFor(() => expect(onChange).toHaveBeenLastCalledWith({}));

		expect(button()?.disabled).toBe(true);

	});

});
