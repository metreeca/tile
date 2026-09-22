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
import { css, type Property, type Style, tile, type Token, type Value } from "./index.js";


describe("tile", () => {

	it("maps every token name to a custom property", () => {

		expectTypeOf<keyof typeof tile>().toEqualTypeOf<Token>();
		expectTypeOf(tile.colorStrong).toExtend<Property>();

	});

	it("rejects a custom property no token resolves to", () => {

		expectTypeOf<"--tile--nope">().not.toExtend<Property>();

	});

});

describe("Value", () => {

	it("closes the value space of a keyword token", () => {

		expectTypeOf<Value<"look">>().toEqualTypeOf<"subtle" | "normal" | "strong" | undefined>();
		expectTypeOf<Value<"viewportMedium">>().toEqualTypeOf<"on" | "off" | undefined>();

	});

	it("leaves the value space open where CSS does", () => {

		expectTypeOf<string>().toExtend<Value<"fontFamily">>();
		expectTypeOf<string>().toExtend<Value<"boxShadowRaised">>();

	});

	it("admits no string of its own where the value space is settled", () => {

		expectTypeOf<string>().not.toExtend<Value<"colorStrong">>();
		expectTypeOf<string>().not.toExtend<Value<"spacing100">>();

	});

});

describe("css", () => {

	it("produces a style declaration", () => {

		expectTypeOf(css({ color: "#000" })).toEqualTypeOf<Style>();

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
		expectTypeOf(css({ fontSize: "scaling125" })).toEqualTypeOf<Style>();
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

	it("rejects a token off another ladder", () => {

		// @ts-expect-error a colour where a size goes
		css({ fontSize: "colorStrong" });

		// @ts-expect-error a spacing where a size goes
		css({ fontSize: "spacing100" });

		// @ts-expect-error a scale step where an ink goes
		css({ colorStrong: "colorGray050" });

	});

	it("takes a CSS value wherever a token name would go", () => {

		expectTypeOf(css({ colorStrong: "#D60" })).toEqualTypeOf<Style>();
		expectTypeOf(css({ color: "currentColor" })).toEqualTypeOf<Style>();
		expectTypeOf(css({ fontSize: "1.5rem" })).toEqualTypeOf<Style>();
		expectTypeOf(css({ spacing100: 0 })).toEqualTypeOf<Style>();
		expectTypeOf(css({ letterSpacingHeading: "-0.02em" })).toEqualTypeOf<Style>();
		expectTypeOf(css({ durationFast: "150ms" })).toEqualTypeOf<Style>();
		expectTypeOf(css({ easingEnter: "ease-out" })).toEqualTypeOf<Style>();
		expectTypeOf(css({ opacityLoading: "50%" })).toEqualTypeOf<Style>();

	});

	it("takes a number where the value is a scalar", () => {

		expectTypeOf(css({ lineHeight: 1.2 })).toEqualTypeOf<Style>();
		expectTypeOf(css({ fontWeight: 600 })).toEqualTypeOf<Style>();
		expectTypeOf(css({ opacityLoading: 0.5 })).toEqualTypeOf<Style>();
		expectTypeOf(css({ zIndexModal: 10 })).toEqualTypeOf<Style>();

	});

	it("takes a keyword off the closed set a token carries", () => {

		expectTypeOf(css({ look: "subtle" })).toEqualTypeOf<Style>();
		expectTypeOf(css({ viewportMedium: "on" })).toEqualTypeOf<Style>();
		expectTypeOf(css({ borderStyle: "dashed" })).toEqualTypeOf<Style>();

	});

	it("takes a CSS function wherever one resolves to the value", () => {

		expectTypeOf(css({ colorStrong: "color-mix(in oklab, #D60, white)" })).toEqualTypeOf<Style>();
		expectTypeOf(css({ spacing100: "calc(2 * 1rem)" })).toEqualTypeOf<Style>();
		expectTypeOf(css({ fontSize: "var(--app--size)" })).toEqualTypeOf<Style>();
		expectTypeOf(css({ easingEnter: "cubic-bezier(0.2, 0, 0, 1)" })).toEqualTypeOf<Style>();

	});

	it("takes any string where CSS leaves the value open", () => {

		expectTypeOf(css({ fontFamilyMono: "'Fira Code', monospace" })).toEqualTypeOf<Style>();
		expectTypeOf(css({ boxShadowRaised: "0 1px 2px #0003" })).toEqualTypeOf<Style>();
		expectTypeOf(css({ outlineInvalid: "2px solid #C00" })).toEqualTypeOf<Style>();

	});

	it("rejects a value off another shape", () => {

		// @ts-expect-error a length where a colour goes
		css({ colorStrong: "1rem" });

		// @ts-expect-error a colour where a length goes
		css({ fontSize: "#D60" });

		// @ts-expect-error a length where a scalar goes
		css({ zIndexModal: "10px" });

		// @ts-expect-error a duration carries a unit
		css({ durationFast: 150 });

		// @ts-expect-error a length other than zero carries a unit
		css({ spacing100: 4 });

	});

	it("rejects a keyword outside the closed set a token carries", () => {

		// @ts-expect-error no such visual register
		css({ look: "loud" });

		// @ts-expect-error a flag is on or off
		css({ viewportMedium: "yes" });

		// @ts-expect-error no such line style
		css({ borderStyle: "squiggly" });

	});

	it("rejects a boolean", () => {

		// @ts-expect-error no token takes a boolean
		css({ borderStyle: false });

	});

});

describe("css.var", () => {

	it("produces a CSS value", () => {

		expectTypeOf(css.var(tile.colorStrong)).toEqualTypeOf<string>();

	});

	it("rejects a token name in place of a custom property", () => {

		// @ts-expect-error token name rather than custom property
		css.var("colorStrong");

	});

	it("rejects a custom property no token resolves to", () => {

		// @ts-expect-error unknown custom property
		css.var("--tile--nope");

	});

});
