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
 * Names the custom properties an app may override to restyle an interface, and the ones a component reads to inherit
 * that styling; the same names assign a token inline, restyling a single subtree through a style declaration any
 * rendering layer accepts. The values behind them are supplied by the companion stylesheet.
 *
 * An app that includes the stylesheet gets a brand-agnostic default look, light or dark according to the platform
 * colour scheme; one that redefines the tokens gets its own, with no component change. Components name tokens through
 * this contract rather than through literal strings, so a renamed token breaks the build instead of silently losing
 * its styling.
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
 *     --tile--color-accent-strong: #D60;
 *     --tile--font-family: Inter, sans-serif;
 * }
 * ```
 *
 * Assign the tokens inline to restyle a single subtree instead:
 *
 * ```tsx
 * <section style={css({ [tile.colorAccentStrong]: "#D60" })}>
 * ```
 *
 * @remarks
 *
 * **Colour schemes** — the stylesheet retunes itself for a dark platform colour scheme by adjusting five anchors,
 * `--tile--color`, `--tile--background-color`, `--tile--color-accent-subtle`, `--tile--color-accent-strong` and
 * `--tile--color-invalid`: every other colour is derived from them, so an app retheming the anchors carries the rest
 * of the palette with it, and one pinning a scheme sets `color-scheme` on the root element as usual. An app supplying
 * its brand states a value per scheme too, and rechecks that the text roles still hold AA contrast against the page
 * and the striped row in both.
 *
 * **Accents and the error colour** — `--tile--color-accent-subtle` carries an interface at rest, on links, enabled
 * controls and focus rings, while `--tile--color-accent-strong` marks a thing out, on hover and on a selection. The
 * pair states an emphasis relative to each other rather than an appearance, so a brand of any hue or lightness fits
 * it by supplying a quieter value and a louder one; the quieter value is the less saturated of the two, which leaves
 * it free to hold the higher contrast, as it does by default. `--tile--color-invalid` stands apart as an anchor of
 * its own rather than a derivation of an accent, so a failure keeps reading as one whatever an app brands with.
 *
 * **Override order** — the stylesheet declares its rules in a `tile` cascade layer, so a rule an app or a component
 * writes outside a layer wins whatever order the two stylesheets reach the document in, and whichever selector is the
 * more specific. An app whose own rules are layered orders its layer after `tile`.
 *
 * **Missing and malformed values** — a token carrying a literal is registered with the type it takes and the value it
 * falls back to, so an override the browser cannot parse leaves the interface on the default rather than unstyled. A
 * component styled against a token it cannot count on, because the stylesheet may not be loaded at all, names its own
 * fallback in the reference: `var(--tile--color-accent-strong, #06C)`.
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
 * getComputedStyle(element).getPropertyValue(tile.colorAccentStrong)
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
	spacing200: "--tile--spacing-200",
	spacing250: "--tile--spacing-250",

	borderStyle: "--tile--border-style",
	borderColor: "--tile--border-color",
	borderWidth: "--tile--border-width",
	borderRadius: "--tile--border-radius",
	borderRadiusRound: "--tile--border-radius-round",

	color: "--tile--color",

	colorFaint: "--tile--color-faint",
	colorLabel: "--tile--color-label",
	colorPlaceholder: "--tile--color-placeholder",
	colorEnabled: "--tile--color-enabled",
	colorDisabled: "--tile--color-disabled",

	colorHover: "--tile--color-hover",
	colorFocus: "--tile--color-focus",

	colorAccentSubtle: "--tile--color-accent-subtle",
	colorAccentStrong: "--tile--color-accent-strong",
	colorInvalid: "--tile--color-invalid",

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
 * <section style={css({ [tile.colorAccentStrong]: "#D60" })}>
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
