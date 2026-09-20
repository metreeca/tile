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
 * Tabbed panel state.
 *
 * Tracks which of a fixed set of labelled sections is on show, independently of what renders it.
 *
 * @module
 */

import { assert, opt, type Optional } from "@metreeca/core";
import { some, type Some, unique } from "@metreeca/core/arrays";
import { createState } from "@metreeca/core/state";


/**
 * Tabbed panel state.
 *
 * Tracks which of a fixed set of labelled sections is on show, exposing the activation a tab strip offers: a direct
 * choice and the step to either neighbour, wrapping at both ends as keyboard navigation expects.
 */
export interface Model {

	/**
	 * The labels identifying the sections, in display order, trimmed, without duplicates and none of them blank.
	 */
	readonly labels: readonly string[];

	/**
	 * The label of the section on show, or `undefined` if there are no sections.
	 */
	readonly active: Optional<string>;


	/**
	 * Activates a section.
	 *
	 * @param label The label of the section to show
	 *
	 * @returns A state showing `label`, or this state if `label` is unknown or already active
	 */
	select(label: string): this;


	/**
	 * Activates the following section, wrapping from the last to the first.
	 *
	 * @returns A state showing the following section, or this state if there are fewer than two sections
	 */
	next(): this;

	/**
	 * Activates the preceding section, wrapping from the first to the last.
	 *
	 * @returns A state showing the preceding section, or this state if there are fewer than two sections
	 */
	back(): this;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a tabbed panel state.
 *
 * @param options The state configuration
 * @param options.labels The labels identifying the sections, in display order; surrounding whitespace is removed, as
 * are duplicates, keeping the first occurrence; empty if omitted
 * @param options.active The label of the section on show, likewise trimmed; the first section if omitted
 *
 * @returns The tabbed panel state
 *
 * @throws {@link !TypeError TypeError} If `labels` includes a blank label, or if `active` doesn't identify one of them
 */
export function createModel({

	labels,
	active

}: {

	labels?: Some<string>
	active?: string

} = {}): Model {

	const sections = assert(unique(some(labels).map(label => label.trim())),
		labels => labels.every(label => label.length > 0),
		"unexpected blank section labels"
	);

	const section = opt(active,
		label => assert(label.trim(), label => sections.includes(label), `unknown section label <${label}>`),
		sections[0]
	);

	return createState<Model>({

		labels: sections,
		active: section,


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
