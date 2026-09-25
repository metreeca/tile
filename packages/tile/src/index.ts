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
 * gives the custom property each one resolves to, for a value taken outside the cascade. A token is read wherever a
 * CSS value is written by hand, and assigned to a subtree through a style declaration any rendering layer accepts.
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
 * import "@metreeca/tile/index.css";
 * ```
 *
 * Override any token to restyle the whole interface, stating a colour for both schemes as a `light-dark()` pair:
 *
 * ```css
 * :root {
 *     --tile--color-strong: light-dark(#D60, #F80);
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
 * Read a token where a single CSS value is written by hand:
 *
 * ```tsx
 * <span style={{ backgroundColor: css.var(tile.colorStrong) }}/>
 * ```
 *
 * @remarks
 *
 * **Override order** — the stylesheet declares its rules in a `tile` cascade layer, so a rule an app or a component
 * writes outside a layer wins whatever order the two stylesheets reach the document in, and whichever selector is the
 * more specific. An app whose own rules are layered orders its layer after `tile`.
 *
 * **Missing and malformed values** — a token carrying a literal states it as the registered default of its custom
 * property, so the value lives in one place. A malformed override is caught only where the token has a fixed type: a
 * weight, a duration or an opacity the browser cannot parse stays on its default. Most tokens, the colour anchors and
 * the sizes among them, take an override as written, so a malformed value leaves whatever reads it unstyled rather
 * than on the default. A component styled against a token it cannot count on, because the stylesheet may not
 * be loaded at all, names its own fallback in the reference it writes by hand: `var(--tile--color-strong, #06C)`,
 * which is the one case {@link css css.var} does not cover.
 *
 * **First paint** — the stylesheet has to reach the document before it is painted, or the first frame shows the
 * unstyled markup: an app bundling it from the entry point is served by the bundler, while one assembling its own HTML
 * links it in the document head. An override stated in a `<style>` in the document head is in force from the first
 * frame, so a loader painted before the stylesheet arrives already reads the app's brand.
 *
 * **Values outside the cascade** — a consumer painting where a reference doesn't reach, on a canvas or against an API
 * taking a colour as text, takes the value a token resolves to for the element it applies to, rather than a copy of
 * the default, and so keeps whatever the app overrode and whichever colour scheme is in force. A colour token holds a
 * `light-dark()` pair or a mix until something paints with it, so it is resolved through a colour property of an
 * element in the subtree:
 *
 * ```typescript
 * probe.style.color = css.var(tile.colorStrong);
 * getComputedStyle(probe).color
 * ```
 *
 * @module index
 */

import type { Alias, Literal } from "./index.core.js";
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
 * The CSS property a token is applied through as well as assigned, for a token no rule below the page reads.
 *
 * Every other token is read by a rule on the elements that take it, so assigning it anywhere is enough to restyle
 * what stands below. A token listed here is read at most a single time, where the page sets its own defaults, and an
 * element further down takes the property it inherits rather than looking the token up again. Assigning one of them to
 * an area would therefore do nothing at all, which is the one outcome a consumer cannot be expected to predict from
 * the name. Applying the property alongside the assignment makes the area behave as every other token already leads
 * them to expect.
 *
 * A token joins the list on that condition alone, whatever it decides, and the entry names the property it is applied
 * through: an inherited one carries an override down the subtree, as the typography and the colours do, while the box
 * tokens name properties that do not inherit, so each shapes the element it is assigned to and nothing inside it.
 */
const applied: Readonly<Record<string, string>> = {

	fontFamily: "font-family",
	fontSize: "font-size",
	fontWeight: "font-weight",
	lineHeight: "line-height",

	color: "color",
	backgroundColor: "background-color",

	padding: "padding",
	borderRadius: "border-radius",
	boxShadow: "box-shadow"

};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * The custom property behind every design system token.
 *
 * Resolves each {@link Token token name} to the {@link Property custom property} carrying its value, which is what
 * {@link css css.var} reads a token through and what a value taken outside the cascade is looked up by; assigning a token
 * to a subtree goes through {@link css} instead. Gathers every token group, so a consumer names a token without
 * knowing which one it belongs to.
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
 * Addresses a token wherever CSS reads one, as given by {@link tile}: it is what {@link css css.var} takes and what a
 * computed-style read is keyed by.
 */
export type Property = typeof tile[Token]


/**
 * The tokens assigned to an area, and what each is assigned.
 *
 * Every token is optional, so an override names the ones it restyles and leaves the rest at whatever the cascade
 * already gives them. Each takes the {@link Value value} that token admits, be that a name off the ladder it belongs
 * to or a CSS value of the shape it carries, so an editor offers the handful of names and keywords that belong where
 * one is assigned: a colour offers colours, a text size the type and scaling ladders, the visual register the three
 * words it is defined over.
 */
export type Tokens = {

	readonly [K in Token]?: Value<K>

}

/**
 * The name of a design system token.
 *
 * Addresses a token in a {@link css} call, where a {@link Property custom property} is rejected.
 */
export type Token = keyof typeof tile

/**
 * The value a design system token is assigned.
 *
 * Admits what the token in hand can carry and nothing else, as three alternatives, two of them named by types this
 * reference leaves out:
 *
 * - `Alias<K>` — the {@link Token token names} `K` may be set from, being the ladder it belongs to and no other: a
 *   colour offers colours, a text size the type and scaling ladders and not the spacing one, though all are lengths.
 *   An alias stands for whatever the token it names carries, so `colorStrong: "colorSubtle"` assigns a reference to
 *   that token rather than the text of its name. A token belonging to no ladder, a flag or a keyword, has no alias
 *   at all.
 * - `Literal<K>` — the CSS values `K` takes written out, of the shape it is defined over: a colour where a colour
 *   goes, a length carrying a unit unless it is zero, a keyword token held to the words it names. A number is taken
 *   where the value is a scalar, sparing the caller a conversion, and a function wherever a value is computed, since
 *   what one resolves to is beyond the reach of a type.
 * - `undefined` — assigns nothing, so a token is left at whatever the cascade already gives it, and a conditional
 *   override is expressed inline.
 *
 * An arbitrary string is taken only where CSS states no shape to hold a value to, as a font stack or a shorthand.
 * Everywhere else a value of the wrong shape is rejected at the call site rather than assigned and left to resolve to
 * nothing.
 *
 * @typeParam K The token being assigned; every token, and so every value any of them admits, where left out
 */
export type Value<K extends Token = Token> = undefined | Alias<K> | Literal<K>

export type {
	Palette,
	Ink,
	Fill,
	Type,
	Scaling,
	Spacing,
	Radius,
	Stroke,
	Tracking,
	Weight,
	Opacity,
	Layer,
	Timing,
	Easing,
	Shadow,
	Family,
	Flag,
	Padding,
	Rounding,
	Lifting
} from "./index.core.js";


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
 * out the reference, and an editor offers the names that belong where it is assigned, a colour offering colours and a
 * text size the type and scaling ladders:
 *
 * ```tsx
 * <section style={css({ fontSize: "fontSizeLarge" })}>
 * ```
 *
 * Anything else is a CSS value of the shape the token carries, so a colour where a length goes is rejected here rather
 * than assigned and left to resolve to nothing. A number is converted to its CSS text form, sparing a scalar token
 * the restatement as a string; a token mapped to `undefined` is left out, so a conditional override is expressed
 * inline.
 *
 * The face, the size, the weight and the leading a page is written in are applied to the area as well as assigned to
 * it, since the page states each of them once and nothing below reads them again; an area given one of the four is
 * therefore written in it, rather than assigning a value nothing would consult. What an area holds inherits them as
 * it inherits any other, so a size stated on an area compounds with a size stated on an area inside it, exactly as
 * CSS has it. The text and background colours are applied the same way, so an area given either is painted in it.
 *
 * The box tokens, `padding`, `borderRadius` and `boxShadow`, are read by no rule at all, and are applied to the
 * element they are assigned to alone, padding, rounding or lifting it without reaching what it holds:
 *
 * ```tsx
 * <section style={css({ padding: "spacing100", borderRadius: "borderRadius050" })}>
 * ```
 *
 * Reading a token where a single CSS value is written by hand, rather than assigning one, goes through
 * {@link css css.var} instead.
 *
 * @param tokens The value each token takes, keyed by {@link Token token name}
 *
 * @returns An immutable {@link Style style declaration} assigning the {@link Property custom property} of each token
 * given a defined value in `tokens` its text form, or a reference to the token it names, and applying the CSS
 * property as well for the typography and the colours the page carries its own defaults in, and for the box tokens
 */
export const css = Object.assign(

	function css(tokens: Tokens): Style {

		const properties: Readonly<Record<string, Property>> = tile; // keyed by string, matching the entries below

		return Object.fromEntries(Object.entries(tokens)
			.filter(([, value]) => value !== undefined)
			.flatMap(([token, value]) => {

				const property = applied[token];

				// a value naming a token stands for what that token carries; no CSS value is spelt as a token name,
				// the names being camel-cased identifiers and CSS values keywords, numbers, colours and functions

				const text = typeof value === "string" && value in properties
					? `var(${properties[value]})`
					: String(value);

				return property === undefined
					? [[properties[token], text]]
					: [[properties[token], text], [property, text]];

			})
		);

	}, {

		/**
		 * Reads a design system token.
		 *
		 * Gives the reference a CSS value takes a token through, so a consumer paints with the design system wherever
		 * a value is written by hand rather than by a rule: an inline style, an SVG presentation attribute, a length
		 * handed to a widget that takes one.
		 *
		 * ```tsx
		 * <span style={{ backgroundColor: css.var(tile.colorStrong) }}/>
		 * ```
		 *
		 * The reference resolves wherever it is read, so it carries whatever an app overrode and whichever colour
		 * scheme is in force, which a copy of the default value would not. Assigning a token for a subtree goes
		 * through {@link css} itself instead, and a consumer that cannot count on the stylesheet being loaded at all
		 * writes the reference by hand, naming in it the fallback it wants.
		 *
		 * @param property The {@link Property custom property} carrying the value of the token to be read, as given
		 * by {@link tile}
		 *
		 * @returns A `var()` reference resolving to the value `property` carries on the element reading it
		 */
		var(property: Property): string {

			return `var(${ property })`;

		}

	}

);
