/*
 * Copyright © 2026 Metreeca srl
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

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { css, tile } from "./index.js";


describe("tile", () => {

	const stylesheet = readFileSync(new URL("./tokens.css", import.meta.url), "utf-8");

	const declared = [ ...Object.values(tile) ].sort();

	const defined = Array.from(
		(stylesheet.match(/:root\s*\{([^}]*)}/)?.[1] ?? "").matchAll(/(--tile--[\w-]+)\s*:/g),
		([, name]) => name
	).sort();


	it("names exactly the custom properties the stylesheet defines", () => {

		expect(declared).toEqual(defined);

	});

});

describe("css", () => {

	it("assigns each token the value given for it", () => {

		expect(css({

			[tile.colorAccentLite]: "#06C",
			[tile.fontFamily]: "Inter, sans-serif"

		})).toEqual({

			"--tile--color-accent-lite": "#06C",
			"--tile--font-family": "Inter, sans-serif"

		});

	});

	it("converts a scalar value to its text form", () => {

		expect(css({

			[tile.lineHeight]: 1.2,
			[tile.borderStyle]: false

		})).toEqual({

			"--tile--line-height": "1.2",
			"--tile--border-style": "false"

		});

	});

	it("leaves out tokens with no value", () => {

		expect(css({

			[tile.colorAccentLite]: "#06C",
			[tile.colorAccentDark]: undefined

		})).toStrictEqual({

			"--tile--color-accent-lite": "#06C"

		});

	});

	it("assigns nothing when given no tokens", () => {

		expect(css({})).toEqual({});

	});

});
