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
 * Offers what a tab strip does without drawing one: a fixed set of labelled panels, which of them are open to a
 * reader, the one on show, and the activation a reader performs on it. A rendering layer adopts them and supplies
 * the markup, the styling and the gestures, so the same behaviour serves any layer.
 *
 * @module
 */

import { assert, isArray, isString, opt, type Optional } from "@metreeca/core";
import { type Some, unique } from "@metreeca/core/arrays";
import { createState } from "@metreeca/core/state";


/**
 * Headless tabs.
 *
 * Holds a fixed set of labelled panels and the one on show, offering the activation a tab strip performs: a direct
 * choice and the step to either neighbour, wrapping at both ends as keyboard navigation expects. A panel may be
 * disabled: its label keeps its place, but no activation brings it on show and stepping passes it over.
 *
 * An activation yields new tabs and leaves these as they stand, so tabs read earlier keep their panels and their
 * choice. One that changes nothing yields these tabs themselves, which a rendering layer takes as nothing to redraw.
 */
export interface Tabs {

	/**
	 * Whether each panel can be shown, keyed by the label identifying it: the labels in display order, as given,
	 * without duplicates and none of them blank.
	 */
	readonly labels: Readonly<Record<string, boolean>>;

	/**
	 * The label of the panel on show, or `undefined` if no panel is enabled.
	 */
	readonly active: Optional<string>;


	/**
	 * Activates a panel.
	 *
	 * @param label The label of the panel to show
	 *
	 * @returns Tabs showing `label`, or these tabs if `label` is unknown, disabled or already on show
	 */
	select(label: string): this;


	/**
	 * Activates the following enabled panel, stepping over disabled ones and wrapping from the last to the first.
	 *
	 * @returns Tabs showing the following enabled panel, or these tabs if they hold no other enabled panel
	 */
	next(): this;

	/**
	 * Activates the preceding enabled panel, stepping over disabled ones and wrapping from the first to the last.
	 *
	 * @returns Tabs showing the preceding enabled panel, or these tabs if they hold no other enabled panel
	 */
	back(): this;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates headless tabs.
 *
 * @param options The tabs configuration
 *
 * @returns Immutable {@link Tabs} holding the panels `labels` identifies, showing `active` if its panel is enabled
 * and the first enabled panel otherwise
 *
 * @throws {@link !TypeError TypeError} If `labels` includes a blank label, or if `active` isn't one of them
 */
export function createTabs({

	labels,
	active

}: {

	/**
	 * The labels identifying the panels, in display order: a record stating for each label whether its panel can be
	 * shown, or a list of labels whose panels can all be shown, taken as given with duplicates removed, keeping the
	 * first occurrence; empty if omitted.
	 */
	labels?: Some<string> | Readonly<Record<string, boolean>>

	/**
	 * The label of the panel to show; the first enabled panel if omitted or if it identifies a disabled panel.
	 */
	active?: string

} = {}): Tabs {

	const entries: readonly (readonly [string, boolean])[] = labels === undefined ? []
		: isString(labels) ? [[labels, true]]
			: isArray<string>(labels) ? unique(labels).map((label): [string, boolean] => [label, true])
				: Object.entries(labels).map(([label, shown]): [string, boolean] => [label, shown === true]);

	const panels = assert(Object.fromEntries(entries),
		panels => Object.keys(panels).every(label => label.trim().length > 0),
		"unexpected blank panel labels"
	);

	const enabled = Object.keys(panels).filter(label => panels[label]);

	const chosen = opt(active,
		label => assert(label, label => label in panels, `unknown panel label <${label}>`),
		enabled[0]
	);

	const panel = enabled.includes(chosen) ? chosen : enabled[0];

	return createState<Tabs>({

		labels: panels,
		active: panel,


		select(label: string) {

			return enabled.includes(label) ? { active: label } : {};

		},


		next() {

			return { active: shift(this.active, +1) };

		},

		back() {

			return { active: shift(this.active, -1) };

		}

	});


	// stepping runs on the enabled panels alone, so a disabled one is passed over rather than landed on and left

	function shift(active: Optional<string>, offset: number): Optional<string> {

		return opt(active, label => enabled[(enabled.indexOf(label)+offset+enabled.length)%enabled.length]);

	}

}
