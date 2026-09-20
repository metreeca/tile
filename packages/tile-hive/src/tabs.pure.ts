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
 * Headless tabs.
 *
 * Offers what a tab strip does without drawing one: a fixed set of labelled panels, the one on show, and the
 * activation a reader performs on it. A rendering layer adopts them and supplies the markup, the styling and the
 * gestures, so the same behaviour serves any layer.
 *
 * @module
 */

import { assert, opt, type Optional } from "@metreeca/core";
import { some, type Some, unique } from "@metreeca/core/arrays";
import { createState } from "@metreeca/core/state";


/**
 * Headless tabs.
 *
 * Holds a fixed set of labelled panels and the one on show, offering the activation a tab strip performs: a direct
 * choice and the step to either neighbour, wrapping at both ends as keyboard navigation expects.
 *
 * An activation yields new tabs and leaves these as they stand, so tabs read earlier keep their panels and their
 * choice. One that changes nothing yields these tabs themselves, which a rendering layer takes as nothing to redraw.
 */
export interface Tabs {

	/**
	 * The labels identifying the panels, in display order, as given, without duplicates and none of them blank.
	 */
	readonly labels: readonly string[];

	/**
	 * The label of the panel on show, or `undefined` if there are no panels.
	 */
	readonly active: Optional<string>;


	/**
	 * Activates a panel.
	 *
	 * @param label The label of the panel to show
	 *
	 * @returns Tabs showing `label`, or these tabs if `label` is unknown or already on show
	 */
	select(label: string): this;


	/**
	 * Activates the following panel, wrapping from the last to the first.
	 *
	 * @returns Tabs showing the following panel, or these tabs if they hold fewer than two panels
	 */
	next(): this;

	/**
	 * Activates the preceding panel, wrapping from the first to the last.
	 *
	 * @returns Tabs showing the preceding panel, or these tabs if they hold fewer than two panels
	 */
	back(): this;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates headless tabs.
 *
 * @param options The tabs configuration
 *
 * @returns Immutable {@link Tabs} holding the panels `labels` identifies and showing `active`
 *
 * @throws {@link !TypeError TypeError} If `labels` includes a blank label, or if `active` doesn't identify one of them
 */
export function createTabs({

	labels,
	active

}: {

	/**
	 * The labels identifying the panels, in display order, taken as given, duplicates removed, keeping the first
	 * occurrence; empty if omitted.
	 */
	labels?: Some<string>

	/**
	 * The label of the panel to show; the first panel if omitted.
	 */
	active?: string

} = {}): Tabs {

	const panels = assert(unique(some(labels)),
		labels => labels.every(label => label.trim().length > 0),
		"unexpected blank panel labels"
	);

	const panel = opt(active,
		label => assert(label, label => panels.includes(label), `unknown panel label <${label}>`),
		panels[0]
	);

	return createState<Tabs>({

		labels: panels,
		active: panel,


		select(label: string) {

			return this.labels.includes(label) ? { active: label } : {};

		},


		next() {

			return { active: shift(this.labels, this.active, +1) };

		},

		back() {

			return { active: shift(this.labels, this.active, -1) };

		}

	});


	function shift(labels: readonly string[], active: Optional<string>, offset: number): Optional<string> {

		return opt(active, label => labels[(labels.indexOf(label)+offset+labels.length)%labels.length]);

	}

}
