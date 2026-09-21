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
 * Visual tokens.
 *
 * Says how the widgets in an area are to appear, so the area settles them in one place instead of every widget in it
 * repeating the same value, and a widget asking for something of its own still gets it.
 *
 * @remarks
 *
 * **What they settle** — the visual register a widget is written in, which is a property of the area rather than of
 * any one widget: {@link visuals `look`} today, how loud a widget appears, told in weight, rule and room and never
 * in colour. A register another attribute names is added here as the attribute earns one.
 *
 * **What they never settle** — what a widget *means*. A meaning belongs to the one widget that carries it, a control
 * saying what activating it will do and a notice what the system found, so it is stated at the widget and inherited
 * by nothing. An area that quietens its controls therefore leaves each of them saying what it says.
 *
 * **Who wins** — a widget stating an attribute of its own answers to that and reads none of this, so a token settles
 * only the widgets that state nothing. A toolbar assigning `subtle` quietens the controls it holds without touching
 * the one control in it that asked to be loud.
 *
 * **How a widget reads one** — through a style query, which matches on the value a custom property holds on an
 * enclosing element, there being no other way for a rule to branch on a value. These inherit, so every element is
 * inside a matching container and no rule declares a container of its own:
 *
 * ```css
 * @container style(--tile--look: subtle) {
 *     tile-button:not([look]) > button {
 *         border-style: none;
 *     }
 * }
 * ```
 *
 * A style query matches one value at a time, so a widget carries a branch per value, and the attribute has to be
 * absent for the token to have a say, which is what a widget rendering it only where it was asked for leaves open.
 *
 * **Where one is assigned** — anywhere: on the root element, to set the register a whole interface is written in, or
 * on a toolbar, a panel or a table cell, to settle one area of it. An app assigns it through the published contract
 * rather than as a literal string, as it assigns any other token.
 *
 * @module visuals
 */


/**
 * The custom property behind every visual token.
 *
 * Narrowed to literals, so the design system contract can name the tokens and the custom properties they resolve to.
 */
export const visuals = {

	look: "--tile--look"

} as const;
