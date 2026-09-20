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

	const registrations: ReadonlyArray<readonly [string, string]> = stylesheets
		.flatMap(text => Array.from(text.matchAll(/@property\s+(--tile--[\w-]+)\s*\{([^}]*)}/g),
			([ , token, body ]) => [ token, body ] as const
		));

	const registered = registrations.map(([ token ]) => token);

	const derived = stylesheets
		.flatMap(text => Array.from(text.matchAll(/:root\s*\{([^}]*)}/g), ([ , rule ]) => rule))
		.flatMap(rule => Array.from(rule.matchAll(/(--tile--[\w-]+)\s*:([^;]*);/g), ([ , token, value ]) => [ token, value ] as const))
		.filter(([ , value ]) => /var\(|color-mix\(|oklch\(/.test(value))
		.map(([ token ]) => token);


	it("names every token the stylesheets read", () => {

		expect(referenced.filter(token => !declared.includes(token))).toEqual([]);

	});

	it("names every token the stylesheet defines", () => {

		expect(assigned.filter(token => !declared.includes(token))).toEqual([]);

	});

	it("names no token the stylesheet leaves undefined", () => {

		expect(declared.filter(token => !assigned.includes(token))).toEqual([]);

	});

	it("names every token the stylesheet registers", () => {

		expect(registered.filter(token => !declared.includes(token))).toEqual([]);

	});

	it("names no token the stylesheet leaves unregistered", () => {

		expect(declared.filter(token => !registered.includes(token))).toEqual([]);

	});

	it("registers every token once", () => {

		expect(registered.filter((token, index) => registered.indexOf(token) !== index)).toEqual([]);

	});

	it("registers every token as inherited", () => {

		expect(registrations.filter(([ , body ]) => !/inherits:\s*true/.test(body)).map(([ token ]) => token)).toEqual([]);

	});

	it("registers a derived token without a default it cannot resolve", () => {

		expect(registrations
			.filter(([ token, body ]) => derived.includes(token) && /initial-value/.test(body))
			.map(([ token ]) => token)
		).toEqual([]);

	});

});

describe("css", () => {

	it("assigns the custom property of each token the value given for it", () => {

		expect(css({

			colorStrong: "#06C",
			fontFamily: "Inter, sans-serif"

		})).toEqual({

			"--tile--color-strong": "#06C",
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

			colorStrong: "#06C",
			colorSubtle: undefined

		})).toStrictEqual({

			"--tile--color-strong": "#06C"

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
