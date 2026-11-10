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
 * Holds whether a facet shows all it offers or only what the reader already picked, so a long column of facets stays
 * short until the reader turns to one of them, and whether it shows its settings instead. A rendering layer adopts it
 * and supplies the markup and the gestures opening, closing and configuring it, so any binding folds a facet alike.
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
	 * Whether the facet closes as focus leaves it, rather than staying open until the reader changes the setting.
	 */
	readonly collapsing: boolean;

	/**
	 * Whether the facet shows its settings in place of what it offers.
	 */
	readonly configuring: boolean;


	/**
	 * Opens the facet while the reader works on it, as focus enters the part opening it.
	 *
	 * @returns A fold showing all the facet offers, or this fold if already so
	 */
	expand(): this;

	/**
	 * Closes a collapsing facet as focus leaves it, and turns any facet back from its settings.
	 *
	 * @returns A fold off its settings and closed if collapsing, or this fold if already so
	 */
	collapse(): this;

	/**
	 * Turns the facet to its settings, or back to what it offers, leaving it open or closed as it stands.
	 *
	 * @returns A fold showing its settings unless this fold was
	 */
	configure(): this;

	/**
	 * Sets whether the facet closes as focus leaves it, opening a facet that will no longer close on its own.
	 *
	 * @param collapsing Whether the facet closes as focus leaves it
	 *
	 * @returns A fold collapsing as `collapsing` states, or this fold if already so
	 */
	collapsible(collapsing: boolean): this;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a headless facet fold.
 *
 * @param options The fold configuration
 *
 * @returns An immutable {@link Fold}, open and collapsing as the options state
 */
export function createFold({

	open = false,
	collapsing = true

}: {

	/**
	 * Whether the facet starts open; closed if omitted.
	 */
	open?: boolean

	/**
	 * Whether the facet closes as focus leaves it; collapsing if omitted.
	 */
	collapsing?: boolean

} = {}): Fold {

	return createState<Fold>({

		open,
		collapsing,
		configuring: false,

		expand() {
			return { open: true };
		},

		collapse() {
			return { open: this.open && !this.collapsing, configuring: false };
		},

		configure() {
			return { configuring: !this.configuring };
		},

		collapsible(collapsing: boolean) {
			return { collapsing, open: this.open || !collapsing };
		}

	});

}
