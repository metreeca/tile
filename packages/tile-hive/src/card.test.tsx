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
import { Card } from "./card.js";


describe("Card", () => {

	const rendered = (element: JSX.Element): null | HTMLElement => {

		const container = document.createElement("div");

		render(element, container);

		return container.querySelector<HTMLElement>(":scope > tile-card");

	};

	const parts = (element: JSX.Element): readonly string[] =>
		Array.from(rendered(element)?.children ?? [], ({ localName }) => localName);


	describe("parts", () => {

		it("shows every part given", async () => {

			expect(parts(<Card title="Title" tags="Tags" image={<b>T</b>}>Description</Card>))
				.toEqual([ "span", "span", "div", "i" ]);

		});

		it("leaves out parts not given", async () => {

			expect(parts(<Card>Description</Card>)).toEqual([ "div" ]);
			expect(parts(<Card title="Title"/>)).toEqual([ "span" ]);

		});

		it("leaves out undefined, null, empty string and boolean parts", async () => {

			expect(parts(<Card title={undefined} tags={null} image={false}>{""}</Card>)).toEqual([]);
			expect(parts(<Card title="" tags={true}>Description</Card>)).toEqual([ "div" ]);

		});

		it("shows zero", async () => {

			expect(rendered(<Card title={0}/>)?.querySelector(":scope > span")?.textContent).toBe("0");

		});

		it("renders nothing if every part is empty", async () => {

			expect(rendered(<Card title="" tags={null}/>)).toBeNull();

		});

		it("shows a string image as a decorative picture", async () => {

			const image = rendered(<Card image="https://example.com/image.png"/>)?.querySelector("i > img");

			expect(image?.getAttribute("src")).toBe("https://example.com/image.png");
			expect(image?.getAttribute("alt")).toBe("");

		});

	});

});
