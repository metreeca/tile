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
 * Tabbed panel.
 *
 * Presents a fixed set of labelled sections one at a time, under a strip of tabs the reader chooses from with the
 * pointer or with the keyboard.
 *
 * @module
 */

import { keys } from "@metreeca/tile";
import { useModel } from "@metreeca/tile-data/model";
import { type ComponentChildren, createElement } from "preact";
import { useId } from "preact/hooks";
import { createModel, type Model } from "./tabs.core.js";
import "./tabs.css";


/**
 * Creates a tabbed layout panel.
 *
 * Presents the labels of the sections given, in order, and the content of the one currently chosen, starting from the
 * first. A section is chosen with the pointer or with the keyboard, the arrow keys stepping to either neighbour and
 * wrapping at both ends, `Home` and `End` jumping to the first and to the last.
 *
 * Every section stays in the document while another is on show, so what it holds keeps its state throughout, at the
 * cost of being rendered whether or not it is visible. The sections are taken as they stand when the panel first
 * renders: a label added or removed later leaves the strip unchanged.
 *
 * @param options The panel configuration
 * @param options.name The accessible name of the tab strip, telling apart the strips a screen carries more than one
 * of; unnamed if omitted
 * @param options.sections The content of each section, keyed by the label activating it and presented in key order
 *
 * @returns The tabbed panel
 */
export function Tabs({

	name,
	sections

}: {

	name?: string
	sections: { [label: string]: ComponentChildren }

}) {

	const id = useId();

	const {

		labels,
		active,

		select,
		next,
		back

	} = useModel(() => createModel({

		labels: Object.keys(sections)

	}));

	return createElement("tile-tabs", {},

		<nav

			aria-label={name}

			role="tablist"

			onKeyDown={keys({

				ArrowRight: moving(next),
				ArrowLeft: moving(back),

				Home: moving(() => select(labels[0])),
				End: moving(() => select(labels[labels.length-1]))

			})}

		>{labels.map((label, index) =>

			<label

				aria-controls={panel(index)}
				aria-selected={label === active}

				id={tab(index)}
				key={label}
				role="tab"
				tabIndex={label === active ? 0 : -1}

				onClick={() => select(label)}

			>{label}</label>
		)}</nav>,

		// every section is rendered, so the tab controlling it always has something to point at

		labels.map((label, index) =>

			<div

				hidden={label !== active}

				aria-labelledby={tab(index)}

				id={panel(index)}
				key={label}
				role="tabpanel"
				tabIndex={0} /* a stop of its own, so a section carrying no control is still reached by key */

			>{sections[label]}</div>
		)
	);


	/* every tab is rendered, so the one a key moves to is already in the document and takes the focus at once */

	function moving(transition: () => Model) {
		return () => {

			const moved = transition().active;

			document.getElementById(tab(moved === undefined ? -1 : labels.indexOf(moved)))?.focus();

		};
	}


	/* ids are built on the position of a section, a label being free to carry the spaces an id reference cannot */

	function tab(index: number) {
		return `${id}-tab-${index}`;
	}

	function panel(index: number) {
		return `${id}-panel-${index}`;
	}

}
