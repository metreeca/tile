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

	const stylesheets = readdirSync(new URL(".", import.meta.url), { recursive: true, encoding: "utf-8" })
		.filter(name => name.endsWith(".css"))
		.map(name => readFileSync(new URL(`./${ name }`, import.meta.url), "utf-8"));

	/*
	 * A media query and the rules nested in it, and a rule an app forces a scheme with, so a scheme variant is told
	 * apart from an unconditional definition however the scheme is settled.
	 */

	const query = /@media[^{]*\{(?:[^{}]*\{[^{}]*})*[^{}]*}/g;
	const forced = /\[data-theme[^{}]*\{[^{}]*}/g;

	const unconditional = stylesheets.map(text => text.replace(query, "").replace(forced, ""));
	const conditional = stylesheets.flatMap(text => [ ...text.match(query) ?? [], ...text.match(forced) ?? [] ]);

	/*
	 * A rule settled by the colour scheme, whether the platform or a pinned attribute decides it. A token stated there
	 * is one an app would have to restate per scheme, and again per pinning, to override.
	 */

	const schemed = conditional.filter(rule => /prefers-color-scheme|\[data-theme/.test(rule));

	const assignments = (texts: ReadonlyArray<string>): ReadonlyArray<readonly [string, string]> => texts
		.flatMap(text => Array.from(text.matchAll(/(?::root|\[data-theme)[^{}]*\{([^}]*)}/g), ([ , rule ]) => rule))
		.flatMap(rule => Array.from(rule.matchAll(/(--tile--[\w-]+)\s*:([^;]*);/g),
			([ , token, value ]) => [ token, value ] as const
		));

	const referenced = stylesheets
		.flatMap(text => Array.from(text.matchAll(/var\((--tile--[\w-]+)/g), ([ , token ]) => token));

	const registrations: ReadonlyArray<readonly [string, string]> = stylesheets
		.flatMap(text => Array.from(text.matchAll(/@property\s+(--tile--[\w-]+)\s*\{([^}]*)}/g),
			([ , token, body ]) => [ token, body ] as const
		));

	const registered = registrations.map(([ token ]) => token);

	const anchored = registrations.filter(([ , body ]) => /initial-value/.test(body)).map(([ token ]) => token);

	const defaults = assignments(unconditional).map(([ token ]) => token);
	const variants = assignments(conditional).map(([ token ]) => token);

	const assigned = [ ...defaults, ...variants ];

	const derived = assignments(stylesheets)
		.filter(([ , value ]) => /var\(|color-mix\(|oklch\(/.test(value))
		.map(([ token ]) => token);

	const defined = (token: string): number => (anchored.includes(token) ? 1 : 0)
		+ defaults.filter(assignment => assignment === token).length;


	it("names every token the stylesheets read", () => {

		expect(referenced.filter(token => !declared.includes(token))).toEqual([]);

	});

	it("names every token the stylesheet defines", () => {

		expect(assigned.filter(token => !declared.includes(token))).toEqual([]);

	});

	it("defines every token in exactly one place", () => {

		expect(declared.filter(token => defined(token) !== 1)).toEqual([]);

	});

	it("states no token per colour scheme, so a single override reaches every scheme", () => {

		expect(assignments(schemed).map(([ token ]) => token)).toEqual([]);

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

			"--tile--font-family": "Inter, sans-serif",
			"font-family": "Inter, sans-serif"

		});

	});

	it("writes an area in the typography it is given, the page reading it only for itself", () => {

		expect(css({

			fontFamily: "Inter, sans-serif",
			fontSize: "1.5rem",
			fontWeight: 500,
			lineHeight: 1.4

		})).toEqual({

			"--tile--font-family": "Inter, sans-serif", "font-family": "Inter, sans-serif",
			"--tile--font-size": "1.5rem", "font-size": "1.5rem",
			"--tile--font-weight": "500", "font-weight": "500",
			"--tile--line-height": "1.4", "line-height": "1.4"

		});

	});

	it("paints an area in the colours it is given, the page reading them only for itself", () => {

		expect(css({

			color: "colorStrong",
			backgroundColor: "backgroundColorRaised"

		})).toEqual({

			"--tile--color": "var(--tile--color-strong)", "color": "var(--tile--color-strong)",
			"--tile--background-color": "var(--tile--background-color-raised)",
			"background-color": "var(--tile--background-color-raised)"

		});

	});

	it("shapes the box of the element it is given, no rule reading the box tokens", () => {

		expect(css({

			padding: "spacing100",
			borderRadius: "borderRadius050",
			boxShadow: "boxShadowRaised"

		})).toEqual({

			"--tile--padding": "var(--tile--spacing-100)", "padding": "var(--tile--spacing-100)",
			"--tile--border-radius": "var(--tile--border-radius-050)",
			"border-radius": "var(--tile--border-radius-050)",
			"--tile--box-shadow": "var(--tile--box-shadow-raised)", "box-shadow": "var(--tile--box-shadow-raised)"

		});

	});

	it("sets a token from another named as the value", () => {

		expect(css({ fontSize: "fontSizeLarge" })).toEqual({

			"--tile--font-size": "var(--tile--font-size-large)",
			"font-size": "var(--tile--font-size-large)"

		});

	});

	it("writes a value naming no token as it stands", () => {

		expect(css({ colorStrong: "#D60", borderStyle: "solid" })).toStrictEqual({

			"--tile--color-strong": "#D60",
			"--tile--border-style": "solid"

		});

	});

	it("leaves a token nothing below the page reads again to the assignment alone", () => {

		expect(css({ colorStrong: "#06C" })).toStrictEqual({ "--tile--color-strong": "#06C" });

	});

	it("converts a numeric value to its text form", () => {

		expect(css({

			lineHeight: 1.2,
			zIndexModal: 400

		})).toEqual({

			"--tile--line-height": "1.2",
			"line-height": "1.2",

			"--tile--z-index-modal": "400"

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
			.toEqual(Object.fromEntries([

				...Object.values(tile).map(property => [ property, "value" ]),

				// the tokens the page alone reads, and the box tokens no rule reads, are applied as well as assigned

				[ "font-family", "value" ],
				[ "font-size", "value" ],
				[ "font-weight", "value" ],
				[ "line-height", "value" ],

				[ "color", "value" ],
				[ "background-color", "value" ],

				[ "padding", "value" ],
				[ "border-radius", "value" ],
				[ "box-shadow", "value" ]

			]));

	});

	it("assigns nothing when given no tokens", () => {

		expect(css({})).toEqual({});

	});

});

describe("css.var", () => {

	it("reads a token through the custom property carrying its value", () => {

		expect(css.var(tile.colorStrong)).toBe("var(--tile--color-strong)");

	});

	it("reads every declared token", () => {

		expect(Object.values(tile).filter(property => css.var(property) !== `var(${ property })`)).toEqual([]);

	});

	it("reads a token as css assigns one named as a value", () => {

		expect(css({ fontSize: "fontSizeLarge" })[tile.fontSize]).toBe(css.var(tile.fontSizeLarge));

	});

});
