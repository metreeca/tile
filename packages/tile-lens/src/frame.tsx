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
 * Resource frame.
 *
 * Offers the frame a screen shows a single resource in, the companion to the {@link "sheet"!Sheet Sheet} listing the
 * members of a collection, so that a resource is read in place while it is retrieved, kept in step or found missing.
 *
 * @module
 */

import type { ResourceShape } from "@metreeca/blue/resource";
import type { Match, Model } from "@metreeca/blue/value";
import type { Lazy } from "@metreeca/core";
import type { Relay } from "@metreeca/core/relay";
import { Hint } from "@metreeca/tile-cell/hint";
import { Note } from "@metreeca/tile-cell/note";
import type { ResourceCases } from "@metreeca/tile-data/store/resource";
import { type ComponentChildren, createElement } from "preact";
import "./frame.css";


/**
 * Creates a resource frame.
 *
 * Shows a resource, rendering it through `children`, and keeps in step with it: the resource on show stays where it
 * stands while a change the store signals is retrieved again, so the frame never blanks out in between.
 *
 * ```tsx
 * const resource = useResource({ entry, shape: Item, model: { id: {}, label: {} } });
 *
 * <Frame resource={resource}>{item => <h1>{item.label}</h1>}</Frame>
 * ```
 *
 * Where a `placeholder` is supplied, it fills the area, worded as still loading, until the resource is retrieved. A
 * missing resource or a failed exchange is shown as a critical {@link @metreeca/tile-cell!note.Note note} instead.
 *
 * @typeParam S The shape describing the resource
 * @typeParam T The template stating the values wanted from the resource
 *
 * @param options The widget configuration
 *
 * @returns The frame
 */
export function Frame<S extends Lazy<ResourceShape>, T extends Model<S, T>>({

	resource,

	placeholder,
	children

}: {

	/**
	 * The resource shown, as handed by {@link @metreeca/tile-data!store/resource.useResource useResource}.
	 */
	resource: Relay<ResourceCases<S, T>>


	/**
	 * The glyph marking the area while the resource is retrieved; nothing is rendered in its place if omitted.
	 */
	placeholder?: ComponentChildren

	/**
	 * Renders the resource.
	 */
	children: (resource: Match<S, T>) => ComponentChildren

}) {

	return resource({

		blank: () => placeholder && <Hint>{placeholder}<span>Loading…</span></Hint>,

		ready: ({ state }) => createElement("tile-frame", {}, children(state)),

		error: () => <Note level="critical"><div>Not Available</div></Note>

	});

}
