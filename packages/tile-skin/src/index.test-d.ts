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

import { describe, expectTypeOf, it } from "vitest";
import { css, type Style, tile } from "./index.js";


describe("css", () => {

	it("produces a style declaration", () => {

		expectTypeOf(css({ [tile.color]: "#000" })).toEqualTypeOf<Style>();

	});

	it("accepts a numeric or boolean value", () => {

		expectTypeOf(css({ [tile.lineHeight]: 1.2 })).toEqualTypeOf<Style>();
		expectTypeOf(css({ [tile.borderStyle]: false })).toEqualTypeOf<Style>();

	});

	it("rejects a name that is not a token", () => {

		// @ts-expect-error unknown custom property
		css({ "--tile--unknown": "#000" });

	});

});
