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

import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { css, tile } from "./index.js";


describe("tile", () => {

	const declared: ReadonlyArray<string> = Object.values(tile);

	const stylesheets = readdirSync(new URL(".", import.meta.url))
		.filter(name => name.endsWith(".css"))
		.map(name => readFileSync(new URL(`./${ name }`, import.meta.url), "utf-8"));

	const referenced = stylesheets
		.flatMap(text => Array.from(text.matchAll(/var\((--tile--[\w-]+)/g), ([ , token ]) => token));

	const assigned = stylesheets
		.flatMap(text => Array.from(text.matchAll(/:root\s*\{([^}]*)}/g), ([ , rule ]) => rule))
		.flatMap(rule => Array.from(rule.matchAll(/(--tile--[\w-]+)\s*:/g), ([ , token ]) => token));


	it("names every token the stylesheets read", () => {

		expect(referenced.filter(token => !declared.includes(token))).toEqual([]);

	});

	it("names every token the stylesheet defines", () => {

		expect(assigned.filter(token => !declared.includes(token))).toEqual([]);

	});

	it("names no token the stylesheet leaves undefined", () => {

		expect(declared.filter(token => !assigned.includes(token))).toEqual([]);

	});

});

describe("css", () => {

	it("assigns the custom property of each token the value given for it", () => {

		expect(css({

			colorAccentStrong: "#06C",
			fontFamily: "Inter, sans-serif"

		})).toEqual({

			"--tile--color-accent-strong": "#06C",
			"--tile--font-family": "Inter, sans-serif"

		});

	});

	it("converts a scalar value to its text form", () => {

		expect(css({

			lineHeight: 1.2,
			borderStyle: false

		})).toEqual({

			"--tile--line-height": "1.2",
			"--tile--border-style": "false"

		});

	});

	it("leaves out tokens with no value", () => {

		expect(css({

			colorAccentStrong: "#06C",
			colorAccentSubtle: undefined

		})).toStrictEqual({

			"--tile--color-accent-strong": "#06C"

		});

	});

	it("assigns every declared token", () => {

		expect(css(Object.fromEntries(Object.keys(tile).map(token => [ token, "value" ]))))
			.toEqual(Object.fromEntries(Object.values(tile).map(property => [ property, "value" ])));

	});

	it("assigns nothing when given no tokens", () => {

		expect(css({})).toEqual({});

	});

});
