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

import { css, type Tokens } from "@metreeca/tile";
import { type JSX, render } from "preact";
import { describe, expect, it } from "vitest";
import { Box } from "./box.js";


describe("Box", () => {

	const rendered = (element: JSX.Element): null | HTMLElement => {

		const container = document.createElement("div");

		render(element, container);

		return container.querySelector<HTMLElement>(":scope > tile-box");

	};


	it("renders what it holds inside a box", () => {

		expect(rendered(<Box><p>held</p></Box>)?.innerHTML).toBe("<p>held</p>");

	});

	it("assigns the tokens it is given to its box", () => {

		const tokens: Tokens = { padding: "spacing100", backgroundColor: "backgroundColorRaised" };
		const style = Object.entries(css(tokens));

		const box = rendered(<Box css={tokens}/>);

		expect(style.map(([ property ]) => [ property, box?.style.getPropertyValue(property) ])).toEqual(style);

	});

	it("assigns nothing when given no tokens", () => {

		expect(rendered(<Box/>)?.getAttribute("style")).toBeNull();

	});

});
