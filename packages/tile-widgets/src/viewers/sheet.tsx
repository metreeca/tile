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
 * Collection list.
 *
 * Offers a list for showing the members of a collection. A long collection is read batch by batch, as a trigger the
 * screen places after the list asks for the next one, so the reader never waits for the whole collection at once.
 *
 * @module sheet
 */

import type { ResourceShape } from "@metreeca/blue/resource";
import type { Frame } from "@metreeca/blue/value";
import { isObject, isString, type Lazy } from "@metreeca/core";
import type { Relay } from "@metreeca/core/relay";
import type { Collections } from "@metreeca/tile/collection";
import type { MembersCases } from "@metreeca/tile/members";
import { type ComponentChildren, createElement, Fragment } from "preact";
import { Failure, Hint } from "../index.js";
import "./sheet.css";


/**
 * Creates a collection list.
 *
 * Lists the members of a collection, rendering each through `children`, and keeps in step with them: the items on show
 * stay where they stand while the next batch, a new order or new criteria are on their way. Asking for more is left to
 * the screen, which closes the list with a trigger handed `load`, such as a button fetching the next batch:
 *
 * ```tsx
 * const members = useMembers(collection, { model: { id: {}, label: {} } });
 *
 * <Sheet members={members}>{item => <div>{item.label}</div>}</Sheet>
 *
 * {members({ ready: ({ load }) => load && <button onClick={() => load()}>More</button> })}
 * ```
 *
 * Where a `placeholder` is supplied, a list with nothing to show fills its area with it, worded as still loading or as
 * matching nothing. A failed exchange is shown as a critical note instead, telling the reader why no items are listed.
 *
 * @typeParam S The shape describing the resource holding the collection
 * @typeParam P The property of the resource collecting the items
 * @typeParam T The template or projection stating the values wanted from each item
 *
 * @param options The widget configuration
 *
 * @returns The list
 */
export function Sheet<S extends Lazy<ResourceShape>, P extends Collections<S>, T extends object>({

	members,

	placeholder,
	children

}: {

	/**
	 * The collection members listed, as handed by {@link @metreeca/tile!members.useMembers useMembers}.
	 */
	members: Relay<MembersCases<S, P, T>>


	/**
	 * The glyph marking the area while the list has nothing to show; nothing is rendered in its place if omitted.
	 */
	placeholder?: ComponentChildren

	/**
	 * Renders an item of the collection.
	 */
	children: (item: Frame<S, { readonly [K in P]: T }>) => ComponentChildren

}) {

	return members({

		blank: () => placeholder && <Hint placeholder={placeholder} text={"Loading…"}/>,

		ready: ({ state }) => state.length === 0

			? placeholder && <Hint placeholder={placeholder} text={"No Matches"}/>

			: createElement("tile-sheet", {}, state.map(item =>
				<Fragment key={key(item)}>{children(item)}</Fragment>
			)),

		error: () => <Failure/>

	});

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Identifies an item among its siblings.
 *
 * @param item The item to be identified
 *
 * @returns The identifier of `item`, if it carries one, or its serialisation otherwise, as for a projected row
 */
function key(item: unknown): string {
	return isObject(item) && isString(item.id) ? item.id : JSON.stringify(item);
}
