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

/**
 * Design system.
 *
 * Names the custom properties an app may override to restyle an interface, and the ones a component reads to inherit
 * that styling; the same names assign a token inline, restyling a single subtree through a style declaration any
 * rendering layer accepts. The values behind them are supplied by the companion stylesheet.
 *
 * An app that includes the stylesheet gets the default look, light or dark according to the platform colour scheme;
 * one that redefines the tokens in a later rule gets its own, with no component change. Components name tokens through
 * this contract rather than through literal strings, so a renamed token breaks the build instead of silently losing
 * its styling.
 *
 * @example
 *
 * Include the stylesheet once, at the entry point of the app, ahead of the app styles overriding it:
 *
 * ```typescript
 * import "@metreeca/tile/index.css";
 * ```
 *
 * Override any token in a later rule to restyle the whole interface:
 *
 * ```css
 * :root {
 *     --tile--color-accent-lite: #06C;
 *     --tile--font-family: Inter, sans-serif;
 * }
 * ```
 *
 * Assign the tokens inline to restyle a single subtree instead:
 *
 * ```tsx
 * <section style={css({ [tile.colorAccentLite]: "#06C" })}>
 * ```
 *
 * @remarks
 *
 * **Colour schemes** — the stylesheet retunes itself for a dark platform colour scheme by adjusting four anchors,
 * `--tile--color`, `--tile--background-color`, `--tile--color-accent-lite` and `--tile--color-accent-dark`: every
 * other colour is derived from them, so an app retheming the anchors carries the rest of the palette with it, and one
 * pinning a scheme sets `color-scheme` on the root element as usual.
 *
 * **Missing and malformed values** — a token carrying a literal is registered with the type it takes and the value it
 * falls back to, so an override the browser cannot parse leaves the interface on the default rather than unstyled. A
 * component styled against a token it cannot count on, because the stylesheet may not be loaded at all, names its own
 * fallback in the reference: `var(--tile--color-accent-lite, #D60)`.
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
 * getComputedStyle(element).getPropertyValue(tile.colorAccentLite)
 * ```
 *
 * @module index
 */


/**
 * Token names.
 *
 * Maps each token to the custom property carrying its value, for use in a `var()` reference or a style declaration.
 */
export const tile = {

	fontFamily: "--tile--font-family",
	fontFamilyHeading: "--tile--font-family-heading",
	fontFamilyMono: "--tile--font-family-mono",

	fontSize: "--tile--font-size",
	fontSizeSmall: "--tile--font-size-small",
	fontSizeLarge: "--tile--font-size-large",

	lineHeight: "--tile--line-height",

	fontWeight: "--tile--font-weight",
	fontWeightStrong: "--tile--font-weight-strong",
	fontWeightHeavy: "--tile--font-weight-heavy",

	spacing025: "--tile--spacing-025",
	spacing050: "--tile--spacing-050",
	spacing075: "--tile--spacing-075",
	spacing100: "--tile--spacing-100",
	spacing150: "--tile--spacing-150",

	borderStyle: "--tile--border-style",
	borderColor: "--tile--border-color",
	borderWidth: "--tile--border-width",
	borderRadius: "--tile--border-radius",
	borderRadiusRound: "--tile--border-radius-round",

	color: "--tile--color",

	colorLight: "--tile--color-light",
	colorLabel: "--tile--color-label",
	colorPlaceholder: "--tile--color-placeholder",
	colorEnabled: "--tile--color-enabled",
	colorDisabled: "--tile--color-disabled",
	colorInvalid: "--tile--color-invalid",

	colorHover: "--tile--color-hover",
	colorFocus: "--tile--color-focus",

	colorAccentLite: "--tile--color-accent-lite",
	colorAccentDark: "--tile--color-accent-dark",

	backgroundColor: "--tile--background-color",
	backgroundColorEdit: "--tile--background-color-edit",
	backgroundColorStripe: "--tile--background-color-stripe",

	boxShadowFocus: "--tile--box-shadow-focus",
	outlineInvalid: "--tile--outline-invalid"

} as const;


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * An inline style declaration.
 *
 * Assignable as-is to the `style` prop of a rendering layer that accepts one, with no cast: overriding a token for a
 * subtree is a style declaration like any other.
 */
export type Style = Readonly<Record<string, string>>

/**
 * The custom property name of a design system token.
 */
export type Token = typeof tile[keyof typeof tile]

/**
 * The value a design system token is assigned.
 *
 * A number or a boolean is written as its text form, sparing the caller a conversion where a token takes a scalar;
 * `undefined` assigns nothing, so a token is left at whatever the cascade already gives it.
 */
export type Value = | undefined | boolean | number | string


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Overrides design system tokens for a subtree.
 *
 * Assigns each token the value given for it, restyling the elements that read it without touching the ones that don't:
 *
 * ```tsx
 * <section style={css({ [tile.colorAccentLite]: "#06C" })}>
 * ```
 *
 * Numbers and booleans are converted to their CSS text form, so a scalar token is assigned without restating it as a
 * string; a token mapped to `undefined` is left out, so a conditional override is expressed inline.
 *
 * @param tokens The value each token takes, keyed by {@link Token token name}
 *
 * @returns An immutable {@link Style style declaration} assigning each token given a defined value in `tokens` its
 * text form
 */
export function css(tokens: Readonly<Partial<Record<Token, Value>>>): Style {

	return Object.fromEntries(Object.entries(tokens)
		.filter(([, value]) => value !== undefined)
		.map(([token, value]) => [token, String(value)])
	);

}
