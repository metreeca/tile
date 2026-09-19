/*
 * Copyright © 2020-2025 Metreeca srl
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

import type { Optional } from "@metreeca/core";
import { some, type Some, unique } from "@metreeca/core/arrays";
import { createState, type State } from "@metreeca/core/state";
import { useModel } from "@metreeca/tile-data/model";
import { type ComponentChildren, createElement } from "preact";
import "./tabs.css";


/**
 * Tabbed panel state.
 *
 * Tracks which of a fixed set of labelled sections is on show, exposing the activation a tab strip offers: a direct
 * choice and the step to either neighbour, wrapping at both ends as keyboard navigation expects.
 */
interface Model {

	/**
	 * The labels identifying the sections, in display order, without duplicates.
	 */
	readonly labels: readonly string[];

	/**
	 * The label of the section on show, or `undefined` if there are no sections.
	 */
	readonly active: Optional<string> ;


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
	previous(): this;

}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a tabbed layout panel.
 *
 * Presents the labels of the sections given, in order, and the content of the one currently chosen.
 */
export function Tabs({

	sections

}: {

	sections: { [label: string]: ComponentChildren }

}) {

	const {

		labels,
		active,

		select

	} = useModel(() => createModel({

		labels: Object.keys(sections)

	}));

	return createElement("tile-tabs", {}, labels.map(label =>
		<section key={label}>

			<button onClick={() => select(label)}>{label}</button>
			<div>{label === active ? sections[label] : undefined}</div>

		</section>
	));

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createModel({

	labels,
	active

}: {

	labels?: Some<string>
	active?: string

} = {}) : Model {

	const sections = unique(some(labels));

	return createState<Model>({

		labels: sections,

		active: active !== undefined && sections.includes(active) ? active : sections[0],

		select(label: string) {

			return this.labels.includes(label) ? { active: label } : {};

		},

		next() {

			return { active: shift(this.labels, this.active, +1) };

		},

		previous() {

			return { active: shift(this.labels, this.active, -1) };

		}

	});


	function shift(labels: readonly string[], active: Optional<string>, offset: number): string | undefined {

		return active === undefined ? undefined
			: labels[(labels.indexOf(active) + offset + labels.length) % labels.length];

	}

}
