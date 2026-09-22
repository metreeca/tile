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
 * Design system internals.
 *
 * Settles what each token may be assigned: the tokens it may be named from, and the CSS values it takes written out.
 * A consumer meets both through the published value type and addresses neither on its own.
 *
 * @module index.core
 */

import type { Token } from "./index.js";


/**
 * The tokens a token may be named from, each standing for the value it carries.
 *
 * Resolves a token to the ladder it belongs to, so an editor offers the handful of names that would make sense where
 * it is assigned rather than every name the design system carries, or every name of the same broad sort: a text size
 * offers the type and scaling ladders, both of which are measured against the text, and not the spacing one, though
 * all three are lengths, because a size set from a gap is not a thing anyone means. A token belonging to no ladder, a
 * flag or a keyword, resolves to nothing and is left to the literal alone.
 *
 * @typeParam K The token being assigned
 */
export type Alias<K extends Token> =
	K extends Palette ? Palette :
		K extends Ink ? Ink :
			K extends Fill ? Fill :
				K extends Type ? Type | Scaling :
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
 * The CSS values a token takes written out, beside the tokens it may be named from.
 *
 * Resolves a token to the shape of the value it carries, so a colour is offered where a colour goes and a keyword
 * token is held to the words it is defined over. A value of another shape is rejected at the call site rather than
 * assigned and left to resolve to nothing.
 *
 * A function counts as written out, whatever it computes: `var()`, `calc()` and `color-mix()` alike stand wherever
 * their shape admits a value at all, since what one resolves to is beyond the reach of a type. Openness beyond that
 * is granted shape by shape rather than wholesale, an arbitrary string being taken only where CSS itself states no
 * shape: a font stack, and the shorthands a shadow and an outline are written as.
 *
 * @typeParam K The token being assigned
 */
export type Literal<K extends Token> =
	K extends Palette | Ink | Fill ? Paint :
		K extends Type | Scaling | Spacing | Radius | Stroke | Tracking ? Size :
			K extends "lineHeight" ? Leading :
				K extends Weight ? Heft :
					K extends Opacity ? Fade :
						K extends Layer ? Order :
							K extends Timing ? Time :
								K extends Easing ? Curve :
									K extends "borderStyle" ? Line :
										K extends "look" ? Look :
											K extends Flag ? Switch :
												K extends Family | Shadow ? Open :
													never


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
 * The tokens telling which breakpoints the viewport has passed.
 */
type Flag = Extract<Token, `viewport${string}`>


/**
 * A step of a ten-step scale, and a slot of a series or a class of an area.
 */
type Step = "010" | "020" | "030" | "040" | "050" | "060" | "070" | "080" | "090" | "100"
type Slot = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * A colour, written as a hex literal or as one of the two colours CSS names against the context.
 */
type Paint = `#${string}` | "currentColor" | "transparent" | Call

/**
 * A length, carrying a unit unless it is zero.
 */
type Size = 0 | `${number}${Unit}` | Call

/**
 * A line height, as a multiple of the font size, a length, or whatever the face itself calls for.
 */
type Leading = number | Size | "normal"

/**
 * A font weight, on the numeric ladder or as a keyword standing on it.
 */
type Heft = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | "normal" | "bold" | "lighter" | "bolder"

/**
 * A degree of opacity, as a fraction of one or as a percentage.
 */
type Fade = number | `${number}%` | Call

/**
 * A stacking position.
 */
type Order = number | "auto"

/**
 * A duration, in seconds or milliseconds.
 */
type Time = `${number}s` | `${number}ms` | Call

/**
 * An acceleration curve, as a keyword or as a curve function.
 */
type Curve = "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out" | "step-start" | "step-end" | Call

/**
 * A line style.
 */
type Line = "none" | "hidden" | "solid" | "dashed" | "dotted" | "double" | "groove" | "ridge" | "inset" | "outset"

/**
 * A visual register, saying how loud the widgets of an area appear.
 */
type Look = "subtle" | "normal" | "strong"

/**
 * The answer a breakpoint flag carries.
 */
type Switch = "on" | "off"

/**
 * A value CSS states no shape for, as a font stack or a shorthand.
 *
 * The bare `string` is intersected with an empty type, which keeps the token names as suggestions of their own rather
 * than letting them dissolve into the wider type; it accepts exactly what `string` accepts.
 */
type Open = string & {}


/**
 * A CSS function call.
 *
 * Stands wherever a value is computed rather than written out, `var()`, `calc()` and `color-mix()` alike. What a
 * function resolves to is beyond the reach of a type, so one is taken wherever a shape admits a value of its own.
 */
type Call = `${string}(${string})`

/**
 * The unit a length is measured in.
 */
type Unit = "px" | "rem" | "em" | "ch" | "ex" | "vw" | "vh" | "vmin" | "vmax" | "pt" | "mm" | "cm" | "in" | "%"
