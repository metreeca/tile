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
import { css, type Property, type Style, tile, type Token } from "./index.js";


describe("tile", () => {

	it("maps every token name to a custom property", () => {

		expectTypeOf<keyof typeof tile>().toEqualTypeOf<Token>();
		expectTypeOf(tile.colorStrong).toExtend<Property>();

	});

	it("rejects a custom property no token resolves to", () => {

		expectTypeOf<"--tile--nope">().not.toExtend<Property>();

	});

});

describe("css", () => {

	it("produces a style declaration", () => {

		expectTypeOf(css({ color: "#000" })).toEqualTypeOf<Style>();

	});

	it("accepts a numeric or boolean value", () => {

		expectTypeOf(css({ lineHeight: 1.2 })).toEqualTypeOf<Style>();
		expectTypeOf(css({ borderStyle: false })).toEqualTypeOf<Style>();

	});

	it("rejects a name that is not a token", () => {

		// @ts-expect-error unknown token name
		css({ colorUnknown: "#000" });

	});

	it("rejects a custom property in place of a token name", () => {

		// @ts-expect-error custom property rather than token name
		css({ [tile.colorStrong]: "#000" });

	});

	it("takes a token off the same ladder as a value", () => {

		expectTypeOf(css({ colorStrong: "colorSubtle" })).toEqualTypeOf<Style>();
		expectTypeOf(css({ backgroundColor: "backgroundColorEdit" })).toEqualTypeOf<Style>();
		expectTypeOf(css({ colorGray050: "colorHeat050" })).toEqualTypeOf<Style>();
		expectTypeOf(css({ fontSize: "fontSizeLarge" })).toEqualTypeOf<Style>();
		expectTypeOf(css({ scaling100: "scaling200" })).toEqualTypeOf<Style>();
		expectTypeOf(css({ spacing100: "spacing250" })).toEqualTypeOf<Style>();
		expectTypeOf(css({ borderRadius: "borderRadius050" })).toEqualTypeOf<Style>();
		expectTypeOf(css({ fontWeight: "fontWeightHeavy" })).toEqualTypeOf<Style>();
		expectTypeOf(css({ opacityLoading: "opacityDisabled" })).toEqualTypeOf<Style>();
		expectTypeOf(css({ zIndexModal: "zIndexToast" })).toEqualTypeOf<Style>();
		expectTypeOf(css({ durationFast: "durationSlow" })).toEqualTypeOf<Style>();
		expectTypeOf(css({ easingEnter: "easingExit" })).toEqualTypeOf<Style>();
		expectTypeOf(css({ boxShadowRaised: "boxShadowOverlay" })).toEqualTypeOf<Style>();
		expectTypeOf(css({ fontFamily: "fontFamilyMono" })).toEqualTypeOf<Style>();

	});

	it("takes a CSS value wherever a token name would go", () => {

		expectTypeOf(css({ colorStrong: "#D60" })).toEqualTypeOf<Style>();
		expectTypeOf(css({ fontSize: "1.5rem" })).toEqualTypeOf<Style>();
		expectTypeOf(css({ borderStyle: "solid" })).toEqualTypeOf<Style>();

	});

	/*
	 * Naming the kinds steers what an editor offers, and cannot do more than that: the value type admits any string,
	 * since a CSS value is any string, so a token of the wrong kind is still taken — as the CSS value it spells,
	 * which resolves to nothing. Suggesting the right names is the whole of what the kinds buy.
	 */

	it("takes a token off another ladder, as the CSS value it spells", () => {

		expectTypeOf(css({ fontSize: "colorStrong" })).toEqualTypeOf<Style>();
		expectTypeOf(css({ fontSize: "spacing100" })).toEqualTypeOf<Style>();
		expectTypeOf(css({ colorStrong: "colorGray050" })).toEqualTypeOf<Style>();

	});

});
