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
 * Headless facet fold.
 *
 * Holds whether a compact facet shows all it offers or only what the reader already picked, so a long column of
 * facets stays short until the reader turns to one of them. A rendering layer adopts it and supplies the disclosure,
 * the markup and the gestures opening and closing it, so any binding folds a facet the same way.
 *
 * @module
 */

import { createState } from "@metreeca/core/state";


/**
 * Headless facet fold.
 *
 * A transition returns a new fold and leaves this one unchanged. A transition changing nothing returns this fold
 * itself, which a rendering layer takes as nothing to redraw, so a facet already open is never drawn again on opening.
 */
export interface Fold {

	/**
	 * Whether the facet shows all it offers.
	 */
	readonly open: boolean;

	/**
	 * Whether the reader opened the facet on purpose, so it stays open until the reader closes it again.
	 */
	readonly pinned: boolean;


	/**
	 * Opens the facet while the reader works on it, without pinning it.
	 *
	 * @returns A fold showing all the facet offers, or this fold if already open
	 */
	expand(): this;

	/**
	 * Closes the facet once the reader is done with it, unless the reader pinned it open.
	 *
	 * @returns A fold showing only what the reader picked, or this fold if already closed or pinned
	 */
	collapse(): this;

	/**
	 * Opens and pins a closed facet, and closes an open one, pinned or not.
	 *
	 * @returns A fold in the other position
	 */
	toggle(): this;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a headless facet fold.
 *
 * @param options The fold configuration
 *
 * @returns An immutable {@link Fold}, open as `open` states
 */
export function createFold({

	open = false

}: {

	/**
	 * Whether the facet starts open; closed if omitted.
	 */
	open?: boolean

} = {}): Fold {

	return createState<Fold>({

		open,
		pinned: false,

		expand() {
			return { open: true };
		},

		collapse() {
			return { open: this.pinned };
		},

		toggle() {
			return { open: !this.open, pinned: !this.open };
		}

	});

}
