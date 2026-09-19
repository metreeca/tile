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
 * Design system tokens.
 *
 * Names the custom properties an app may override to restyle an interface, and the ones a component reads to inherit
 * that styling. The values behind them are supplied by the companion stylesheet:
 *
 * ```typescript
 * import "@metreeca/tile/index.css";
 * ```
 *
 * An app that includes the stylesheet gets the default look; one that redefines the tokens in a later rule gets its
 * own, with no component change. Components reference tokens through this contract rather than through literal
 * strings, so a renamed token breaks the build instead of silently losing its styling.
 *
 * @module index
 */


/**
 * Token names.
 *
 * Maps each token to the custom property carrying its value, for use in a `var()` reference or a style declaration.
 */
export const Tokens = {

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

} as const; // literal names are the contract: consumed as the Token union


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * The custom property name of a design system token.
 */
export type Token = typeof Tokens[keyof typeof Tokens];
