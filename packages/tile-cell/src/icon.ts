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
 * Icons.
 *
 * Provides the glyph a control is marked with under the name of the role it stands for: a screen asks for
 * `Icon.Create` rather than for a plus sign, so retuning what a role looks like across an interface is a change to
 * this module alone. The whole Lucide catalogue hangs off the same namespace, for a glyph no role covers:
 * `<Icon.Rocket/>` costs a bundle no more than a direct import does, while a member picked at run time, `Icon[name]`,
 * takes every glyph Lucide draws along with it.
 *
 * > [!NOTE]
 * >
 * > Glyphs are provided by Lucide under the ISC and MIT licences. Redistribution, including within a bundled
 * > application, must preserve the copyright and permission notices reproduced in [Notices](./icon.md).
 *
 * An icon is hidden from assistive technology unless given a `role`, a `title` or an `aria-*` attribute: the control
 * it marks carries the accessible name, and a glyph read out beside it would only name the control a second time.
 *
 * > [!IMPORTANT]
 * >
 * > An icon standing on its own, with no label beside it, states the accessible name itself, which is also what
 * > brings it into the accessibility tree:
 * >
 * > ```tsx
 * > <button onClick={close}><Icon.Close aria-label="Close"/></button>
 * > ```
 *
 * **Standard Glyphs**
 *
 * Import the namespace once, then mark a control with any glyph Lucide draws, under the name Lucide gives it.
 *
 * ```tsx
 * import { Icon } from "@metreeca/tile-cell/icon";
 *
 * <button onClick={launch}><Icon.Rocket/> Deploy</button>
 * ```
 *
 * **Role Glyphs**
 *
 * Alongside them, the namespace carries role names, standing for what a control does rather than for what it draws.
 * A control takes the role that matches its action, not the glyph that looks right: every control creating a
 * resource takes `Create`, wherever it appears, so one screen never says with a plus what another says with a
 * pencil, and repointing a role at a different glyph restyles all of them at once. An action no role covers takes a
 * standard glyph until a role is added for it.
 *
 * ```tsx
 * <button onClick={create}><Icon.Create/> New Item</button>    // creating, wherever it appears
 * <button onClick={insert}><Icon.Insert/> Add Member</button>  // adding to a set, a role of its own
 * <button onClick={launch}><Icon.Rocket/> Deploy</button>      // no role covers deploying, yet
 * ```
 *
 * The roles on offer, under the area each one belongs to:
 *
 * | Role             | Meaning                                                      |
 * |------------------|--------------------------------------------------------------|
 * | **Session**      | who the reader is to the app                                 |
 * | `LogIn`          | opens a session                                              |
 * | `LogOut`         | ends the current one                                         |
 * | **Navigation**   | where a control leads                                        |
 * | `Link`           | marks an address, whether it leads inside the app or out     |
 * | `Open`           | steps into a resource                                        |
 * | `Back`           | returns to the step before                                   |
 * | **Disclosure**   | how much of a section is on show                             |
 * | `Expand`         | reveals a section folded away                                |
 * | `Collapse`       | folds it back                                                |
 * | **Search**       | narrowing what is on show                                    |
 * | `Search`         | submits a query, or opens the field it is typed in           |
 * | `Clear`          | empties that field                                           |
 * | **Ordering**     | the sequence entries are shown in                            |
 * | `Sort`           | offers an order the reader has yet to choose                 |
 * | `Increasing`     | states the order in force, smallest first                    |
 * | `Decreasing`     | states it the other way about                                |
 * | **Collections**  | what a set holds                                             |
 * | `Insert`         | adds an entry to a collection                                |
 * | `Remove`         | takes one out again                                          |
 * | **Records**      | the life of a single resource                                |
 * | `Create`         | brings a new resource into being                             |
 * | `Update`         | edits the resource on show                                   |
 * | `Save`           | writes the edits back                                        |
 * | `Delete`         | destroys it                                                  |
 * | **Confirmation** | what becomes of what was entered                             |
 * | `Accept`         | commits it                                                   |
 * | `Cancel`         | abandons it, leaving things as they stood                    |
 * | `Close`          | dismisses what is on show, deciding nothing                  |
 * | **Modes**        | entering and leaving a way of working                        |
 * | `Menu`           | opens what a screen keeps out of the way until asked         |
 * | `Done`           | leaves a mode, whatever it was entered for                   |
 * | **Notices**      | what the app has to say unprompted                           |
 * | `About`          | tells the reader about the app itself                        |
 * | `Info`           | carries an aside the reader may skip                         |
 * | `Alert`          | warns of a consequence worth weighing first                  |
 * | `Help`           | offers guidance on the task at hand                          |
 * | **Failures**     | why a resource did not come back                             |
 * | `Unauthorized`   | stands where the reader has yet to identify themselves       |
 * | `Forbidden`      | stands where they have, and are still not allowed in         |
 * | `NotFound`       | stands where the resource asked for does not exist           |
 * | `Gone`           | stands where it existed and has since been withdrawn         |
 * | `Error`          | stands where the server failed to answer at all              |
 *
 * **Styling**
 *
 * A glyph is drawn at `--tile--scaling-100`, in the colour of the text around it and at `--tile--stroke-width`, so a
 * control restyles its icon by restyling itself and a theme carries every icon along; the `size` prop plays no part,
 * the stylesheet overriding it. A one-off takes a `class`, which Lucide merges into the `lucide lucide-<name>` list
 * it already carries, or a `style`, which lands on the element and outranks both the stylesheet and the attributes
 * Lucide sets:
 *
 * ```tsx
 * <button style={{ fontSize: "1.5em" }}><Icon.Rocket/> Deploy</button>  // the glyph follows the label
 * <Icon.Alert class="urgent"/>                                          // joins `lucide lucide-triangle-alert`
 * <Icon.Sort style={{ strokeWidth: 1.5 }}/>                             // overrides the stroke-width attribute
 * ```
 *
 * From a stylesheet, a glyph is reached either through a class of its own or through the ones Lucide writes, `lucide`
 * on every glyph and `lucide-<name>` on each, and takes its measures from the design system rather than from
 * literals. The rule sizing an icon is unlayered at a single class of specificity, so a consumer rule wins by naming
 * an ancestor, whatever order the two sheets are emitted in:
 *
 * ```css
 * .urgent {
 *     color: var(--tile--color-fail);
 * }
 *
 * tile-toolbar .lucide {
 *     width: var(--tile--scaling-150);
 *     height: var(--tile--scaling-150);
 *     stroke-width: var(--tile--stroke-width);
 * }
 * ```
 *
 * @document ./icon.md
 *
 * @see {@link https://lucide.dev/icons/ Lucide: icon catalogue}
 * @see {@link https://lucide.dev/license Lucide: licence}
 *
 * @module
 */

import "./icon.css";


export * as Icon from "./icon.core.js";
