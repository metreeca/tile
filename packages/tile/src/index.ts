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
 * An app that includes the stylesheet gets the default look; one that redefines the tokens in a later rule gets its
 * own, with no component change. Components name tokens through this contract rather than through literal strings, so
 * a renamed token breaks the build instead of silently losing its styling.
 *
 * @example
 *
 * Include the stylesheet once, at the entry point of the app:
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
	lineHeight: "--tile--line-height",

	color: "--tile--color",

	colorAccentLite: "--tile--color-accent-lite",
	colorAccentDark: "--tile--color-accent-dark",

	colorLight: "--tile--color-light",
	colorLabel: "--tile--color-label",
	colorPlaceholder: "--tile--color-placeholder",
	colorEnabled: "--tile--color-enabled",
	colorDisabled: "--tile--color-disabled",
	colorInvalid: "--tile--color-invalid",

	colorHover: "--tile--color-hover",
	colorFocus: "--tile--color-focus",

	backgroundColor: "--tile--background-color",
	backgroundColorEdit: "--tile--background-color-edit",
	backgroundColorStripe: "--tile--background-color-stripe",

	borderStyle: "--tile--border-style",
	borderColor: "--tile--border-color",
	borderWidth: "--tile--border-width",

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
