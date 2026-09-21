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

/**
 * Design system.
 *
 * Names the tokens an app may override to restyle an interface, and a component reads to inherit that styling, and
 * gives the custom property each one resolves to, for a `var()` reference or a value taken outside the cascade.
 * Assigning tokens by name restyles a single subtree instead, through a style declaration any rendering layer accepts.
 * The values behind them are provided by the companion stylesheet.
 *
 * An app that includes the stylesheet gets a brand-agnostic default look, light or dark according to the platform
 * colour scheme; one that redefines the tokens gets its own, with no component change. Components name tokens through
 * this contract rather than through literal strings, so a renamed token breaks the build instead of silently losing
 * its styling.
 *
 * The tokens are grouped by what they decide, each group standing on its own alongside the stylesheet module stating
 * its values: {@link typography}, {@link spacings}, {@link scalings}, {@link borders}, {@link colors},
 * {@link elevations}, {@link palettes}, {@link layers}, {@link motions}, {@link opacities}, {@link viewports} and
 * {@link visuals}. {@link tile} gathers them, so a consumer names a token without knowing which group it belongs to.
 *
 * @example
 *
 * Include the stylesheet once, at the entry point of the app:
 *
 * ```typescript
 * import "@metreeca/tile-skin/index.css";
 * ```
 *
 * Override any token to restyle the whole interface:
 *
 * ```css
 * :root {
 *     --tile--color-strong: #D60;
 *     --tile--font-family: Inter, sans-serif;
 * }
 * ```
 *
 * Pin a colour scheme, on the root element or on any subtree that has to differ from the page:
 *
 * ```tsx
 * <aside data-theme="dark">
 * ```
 *
 * Assign the tokens inline to restyle a single subtree instead:
 *
 * ```tsx
 * <section style={css({ colorStrong: "#D60" })}>
 * ```
 *
 * @remarks
 *
 * **Override order** — the stylesheet declares its rules in a `tile` cascade layer, so a rule an app or a component
 * writes outside a layer wins whatever order the two stylesheets reach the document in, and whichever selector is the
 * more specific. An app whose own rules are layered orders its layer after `tile`.
 *
 * **Missing and malformed values** — a token carrying a literal states it as the registered default of its custom
 * property, so the value lives in one place and an override the browser cannot parse leaves the interface on the
 * default rather than unstyled. A component styled against a token it cannot count on, because the stylesheet may not
 * be loaded at all, names its own fallback in the reference: `var(--tile--color-strong, #06C)`.
 *
 * **First paint** — the stylesheet has to reach the document before it is painted, or the first frame shows the
 * unstyled markup: an app bundling it from the entry point is served by the bundler, while one assembling its own HTML
 * links it in the document head.
 *
 * **Values outside the cascade** — a consumer painting where CSS doesn't reach, on a canvas, in an SVG attribute or on
 * a print target, takes the value a token resolves to for the element it applies to, rather than a copy of the
 * default, and so keeps whatever the app overrode and whichever colour scheme is in force:
 *
 * ```typescript
 * getComputedStyle(element).getPropertyValue(tile.colorStrong)
 * ```
 *
 * @module index
 */

import { borders } from "./tokens/borders.js";
import { colors } from "./tokens/colors.js";
import { elevations } from "./tokens/elevations.js";
import { layers } from "./tokens/layers.js";
import { motions } from "./tokens/motions.js";
import { opacities } from "./tokens/opacities.js";
import { palettes } from "./tokens/palettes.js";
import { scalings } from "./tokens/scalings.js";
import { spacings } from "./tokens/spacings.js";
import { typography } from "./tokens/typography.js";
import { viewports } from "./tokens/viewports.js";
import { visuals } from "./tokens/visuals.js";


/**
 * The CSS property a token is applied through as well as assigned, for the four the page states once and nothing
 * reads again.
 *
 * Every other token is read by a rule on the elements that take it, so assigning it anywhere is enough to restyle
 * what stands below. These four are read a single time, where the page sets its own typography, and an element
 * further down takes the size, the face and the leading it inherits rather than looking them up again. Assigning one
 * of them to an area would therefore do nothing at all, which is the one outcome a consumer cannot be expected to
 * predict from the name. Applying the property alongside the assignment makes the area behave as every other token
 * already leads them to expect.
 */
const inherited: Readonly<Record<string, string>> = { // keyed by string, matching the entries css() walks

	fontFamily: "font-family",
	fontSize: "font-size",
	fontWeight: "font-weight",
	lineHeight: "line-height"

};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * The custom property behind every design system token.
 *
 * Resolves each {@link Token token name} to the {@link Property custom property} carrying its value, for a `var()`
 * reference or a value taken outside the cascade; overriding a token for a subtree goes through {@link css} instead.
 * Gathers every token group, so a consumer names a token without knowing which one it belongs to.
 */
export const tile = {

	...typography,
	...spacings,
	...scalings,
	...borders,
	...colors,
	...elevations,
	...palettes,
	...layers,
	...motions,
	...opacities,
	...viewports,
	...visuals

};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * An inline style declaration.
 *
 * Assignable as-is to the `style` prop of a rendering layer that accepts one, with no cast: overriding a token for a
 * subtree is a style declaration like any other.
 */
export type Style = Readonly<Record<string, string>>

/**
 * The custom property carrying the value of a design system token.
 *
 * Addresses a token wherever CSS reads one, in a `var()` reference or a computed-style read, as given by {@link tile}.
 */
export type Property = typeof tile[Token]


/**
 * The name of a design system token.
 *
 * Addresses a token in a {@link css} call, where a {@link Property custom property} is rejected.
 */
export type Token = keyof typeof tile

/**
 * The value a design system token is assigned.
 *
 * A {@link Token token name} stands for the value that token carries, so one token is set from another by naming it
 * and an editor offers the names as it would any other suggestion; anything else is a CSS value, written as it would
 * be in a stylesheet. A number or a boolean is written as its text form, sparing the caller a conversion where a
 * token takes a scalar; `undefined` assigns nothing, so a token is left at whatever the cascade already gives it.
 *
 * The bare `string` is intersected with an empty type, which keeps the token names as suggestions of their own rather
 * than letting them dissolve into the wider type; it accepts exactly what `string` accepts.
 */
export type Value = undefined | boolean | number | Token | (string & {})


/**
 * A step of a ten-step scale, and a slot of a series or a class of an area.
 */
type Step = "010" | "020" | "030" | "040" | "050" | "060" | "070" | "080" | "090" | "100"
type Slot = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"


/**
 * The scale steps, series slots and area classes, which address a colour by position rather than by role.
 */
type Palette = Extract<Token,
	| `colorGray${Step}`
	| `colorSubtle${Step}`
	| `colorStrong${Step}`
	| `colorHeat${Step}`
	| `colorSeries${Slot}`
	| `colorArea${Slot}`
>

/**
 * The tokens painting a mark or a passage of text, and the rule between two of them.
 */
type Ink = Exclude<Extract<Token, `color${string}` | "borderColor">, Palette>

/**
 * The tokens painting a surface.
 */
type Fill = Extract<Token, `backgroundColor${string}`>

/**
 * The tokens sizing text.
 */
type Type = Extract<Token, `fontSize${string}`>

/**
 * The tokens sizing a thing against the text around it.
 */
type Scaling = Extract<Token, `scaling${string}`>

/**
 * The tokens setting a thing apart from its neighbour.
 */
type Spacing = Extract<Token, `spacing${string}`>

/**
 * The tokens rounding a corner.
 */
type Radius = Extract<Token, `borderRadius${string}`>

/**
 * The tokens sizing a line.
 */
type Stroke = Extract<Token, "borderWidth" | "strokeWidth">

/**
 * The tokens tracking a run of text.
 */
type Tracking = Extract<Token, `letterSpacing${string}`>

/**
 * The tokens weighting text.
 */
type Weight = Extract<Token, `fontWeight${string}`>

/**
 * The tokens fading a thing present but not available.
 */
type Opacity = Extract<Token, `opacity${string}`>

/**
 * The tokens ordering two things that overlap.
 */
type Layer = Extract<Token, `zIndex${string}`>

/**
 * The tokens timing a change.
 */
type Timing = Extract<Token, `duration${string}`>

/**
 * The tokens curving a change.
 */
type Easing = Extract<Token, `easing${string}`>

/**
 * The tokens carrying a shadow or an outline, stated as a whole shorthand.
 */
type Shadow = Extract<Token, `boxShadow${string}` | "outlineInvalid">

/**
 * The tokens carrying a font stack.
 */
type Family = Extract<Token, `fontFamily${string}`>


/**
 * The tokens a token may be set from, being those carrying the same kind of value.
 *
 * Resolves a token to the ladder it belongs to, so an editor offers the handful of names that would make sense where
 * it is assigned rather than every name the design system carries, or every name of the same broad sort: a text size
 * offers the type ladder and not the spacing one, though both are lengths, because a size set from a gap is not a
 * thing anyone means. A token belonging to no ladder, a flag or a keyword, resolves to nothing and is left to the CSS
 * value alone.
 *
 * @typeParam K The token being assigned
 */
type Kind<K extends Token> =
	K extends Palette ? Palette :
		K extends Ink ? Ink :
			K extends Fill ? Fill :
				K extends Type ? Type :
					K extends Scaling ? Scaling :
						K extends Spacing ? Spacing :
							K extends Radius ? Radius :
								K extends Stroke ? Stroke :
									K extends Tracking ? Tracking :
										K extends Weight ? Weight :
											K extends Opacity ? Opacity :
												K extends Layer ? Layer :
													K extends Timing ? Timing :
														K extends Easing ? Easing :
															K extends Shadow ? Shadow :
																K extends Family ? Family :
																	never


/**
 * The tokens assigned to an area, and what each is assigned.
 *
 * Each token takes either a token of its own kind, which stands for the value that one carries, or a CSS value
 * written as it would be in a stylesheet. Naming the kinds is what lets an editor suggest the handful of tokens that
 * belong where one is assigned: a colour offers colours, a length offers the spacing and scaling ladders, and neither
 * offers the other.
 *
 * Steering what is offered is the whole of what the kinds do. A CSS value is any string, so any string is taken, and
 * a token of the wrong kind is accepted as the CSS value it spells — which resolves to nothing, as a misspelt value
 * would. The kinds spare a consumer the search, not the mistake.
 */
export type Tokens = {

	readonly [K in Token]?: Kind<K> | undefined | boolean | number | (string & {})

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Overrides design system tokens for a subtree.
 *
 * Assigns each named token the value given for it, restyling the elements that read it without touching the ones that
 * don't:
 *
 * ```tsx
 * <section style={css({ colorStrong: "#D60" })}>
 * ```
 *
 * A value naming a token stands for whatever that token carries, so one token is set from another without spelling
 * out the reference, and an editor offers the names that belong where it is assigned — a colour offers colours, a
 * length the spacing and scaling ladders:
 *
 * ```tsx
 * <section style={css({ fontSize: "fontSizeLarge" })}>
 * ```
 *
 * Numbers and booleans are converted to their CSS text form, so a scalar token is assigned without restating it as a
 * string; a token mapped to `undefined` is left out, so a conditional override is expressed inline.
 *
 * The face, the size, the weight and the leading a page is written in are applied to the area as well as assigned to
 * it, since the page states each of them once and nothing below reads them again; an area given one of the four is
 * therefore written in it, rather than assigning a value nothing would consult. What an area holds inherits them as
 * it inherits any other, so a size stated on an area compounds with a size stated on an area inside it, exactly as
 * CSS has it.
 *
 * @param tokens The value each token takes, keyed by {@link Token token name}
 *
 * @returns An immutable {@link Style style declaration} assigning the {@link Property custom property} of each token
 * given a defined value in `tokens` its text form, or a reference to the token it names, and applying the CSS
 * property as well for the four the page carries its own typography in
 */
export function css(tokens: Tokens): Style {

	const properties: Readonly<Record<string, Property>> = tile; // keyed by string, matching the entries below

	return Object.fromEntries(Object.entries(tokens)
		.filter(([ , value ]) => value !== undefined)
		.flatMap(([ token, value ]) => {

			const property = inherited[token];

			// a value naming a token stands for what that token carries; no CSS value is spelt as a token name, the
			// names being camel-cased identifiers and CSS values keywords, numbers, colours and functions

			const text = typeof value === "string" && value in properties
				? `var(${properties[value]})`
				: String(value);

			return property === undefined
				? [ [ properties[token], text ] ]
				: [ [ properties[token], text ], [ property, text ] ];

		})
	);

}
