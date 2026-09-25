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
 * Presents a fixed set of labelled panels one at a time, under a strip of tabs the reader chooses from with the
 * pointer or with the keyboard, or under a menu standing in for the strip where the labels would not fit.
 *
 * @module
 */

import { opt, type Optional } from "@metreeca/core";
import { keys } from "@metreeca/tile-cell";
import { useModel } from "@metreeca/tile-data/model";
import { type ComponentChildren, createElement } from "preact";
import { useEffect, useId, useState } from "preact/hooks";
import { createTabs, type Tabs } from "./tabs.core.js";
import "./tabs.css";


/**
 * Creates a tabbed layout panel.
 *
 * Presents the labels of the panels given, in order, and the content of the one currently chosen, starting from the
 * first one on offer. A panel is chosen with the pointer or with the keyboard, the arrow keys stepping to either
 * neighbour and wrapping at both ends, `Home` and `End` jumping to either end of the strip.
 *
 * A panel given no content is disabled: its label keeps its place, marked as such, but no gesture ever brings it on
 * show, a pointer choice being refused and keyboard steps and jumps passing it by.
 *
 * Where the labels would not fit on one line, the strip gives way to a menu offering the same choice under the same
 * rules, worked with the keys the platform gives a menu of its own: the labels keep their order, a disabled one stays
 * out of reach, and the panel on show carries on unchanged, named as before but presented as a plain region rather
 * than as a tab panel. The strip comes back as soon as the labels fit again, so which of the two a reader meets
 * follows the room the widget is given rather than anything the caller states.
 *
 * Every panel on offer stays in the document while another is on show, so what it holds keeps its state throughout,
 * at the cost of being rendered whether or not it is visible. The panels are taken as they stand when the widget first
 * renders: a label added or removed later leaves the strip unchanged.
 *
 * @param options The widget configuration
 *
 * @returns The tabbed panel
 *
 * @throws {@link !TypeError TypeError} If `panels` includes a blank label
 *
 * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/tabs/ ARIA Authoring Practices: Tabs Pattern}
 */
export function Tabs({

	name,

	look,

	panels

}: {

	/**
	 * The accessible name of the tabs, telling them apart where a screen carries more than one, whether they are
	 * offered as a strip or as a menu; unnamed if omitted.
	 */
	name?: string

	/**
	 * How loud the tabs appear, told in the rule closing them off rather than in colour, so the step still reads
	 * where colour does not: `normal` carries the rule, setting the panel on show apart from the strip or from the
	 * menu standing in for it, and `subtle` keeps none, the labels then reading as part of what surrounds them. The
	 * mark the chosen tab wears stays either way, so the choice is as plain under one step as under the other. No
	 * loud step is offered, a rule being as far as a strip goes.
	 *
	 * Tabs stating nothing take the look the area around them is written in, from the `--tile--look` token the design
	 * system carries, which is `normal` where nothing assigns it; an area written loud lands on `normal` as well,
	 * there being no step above it here. A look stated here answers to that alone, so a strip asking for the rule
	 * keeps it inside a quietened panel.
	 */
	look?: "subtle" | "normal"

	/**
	 * The content of each panel, keyed by the label activating it and presented in key order; a label given no content
	 * stands for a disabled panel.
	 */
	panels: Readonly<Record<string, Optional<ComponentChildren>>>

}) {

	const id = useId();
	const strip = `${id}-strip`;

	const [collapsed, setCollapsed] = useState(false);

	const {

		labels,
		active,

		select,
		next,
		back

	} = useModel(() => createTabs({

		labels: Object.fromEntries(Object.entries(panels)
			.map(([label, content]): [string, boolean] => [label, content !== undefined])
		)

	}));

	const order = Object.keys(labels);
	const enabled = order.filter(label => labels[label]);

	/*
	 * Whether the labels fit is settled by layout rather than by a measure of the window, so the strip is measured as
	 * it stands and watched for as long as the widget lives. It keeps its place in the document while the menu stands
	 * in for it, laid out at the width it would have had but taken off show, so the same measurement says when the
	 * labels fit again.
	 */

	useEffect(() => opt(document.getElementById(strip) ?? undefined, element => {

		const observer = new ResizeObserver(() => setCollapsed(element.scrollWidth > element.clientWidth));

		observer.observe(element);

		return () => observer.disconnect();

	}), [strip]);

	/*
	 * A look the consumer leaves out leaves the attribute off the element, which is what lets the stylesheet tell
	 * tabs asking for the ordinary step from ones taking whatever the area around them is written in.
	 */

	return createElement("tile-tabs", { collapsed, look },

		<nav

			aria-label={name}

			id={strip}
			role="tablist"

			onKeyDown={keys({

				ArrowRight: moving(next),
				ArrowLeft: moving(back),

				Home: moving(() => select(enabled[0])),
				End: moving(() => select(enabled[enabled.length-1]))

			})}

		>{order.map((label, index) =>

			<label

				aria-controls={labels[label] ? panel(index) : undefined}
				aria-disabled={!labels[label]}
				aria-selected={label === active}

				id={tab(index)}
				key={label}
				role="tab"
				tabIndex={label === active ? 0 : -1}

				onClick={() => select(label)} // a disabled label is refused by the model, leaving the strip as it was

			>{label}</label>
		)}</nav>,

		/*
		 * The menu offers the choice the strip did, the platform supplying the keys and the focus a strip owes by
		 * hand. It stands as wide as its labels rather than as wide as the bar, so the ring a platform leaves on it
		 * after a choice wraps the control alone; the bar it stands in carries the rule closing it off, which the
		 * strip carried while the strip stood there.
		 *
		 * The ring the menu keeps after a pointer choice is the platform's own verdict, which a menu earns by taking
		 * the arrow keys next: a tab, which takes none of its own, is left unmarked by the same gesture. The widget
		 * states neither, both being settled by `:focus-visible`.
		 */

		collapsed && <span><select

			aria-label={name}

			value={active}

			onChange={event => select(event.currentTarget.value)}

		>{order.map(label =>

			<option

				disabled={!labels[label]}

				key={label}
				value={label}

			>{label}</option>
		)}</select></span>,

		// every enabled panel is rendered, so the tab controlling it always has something to point at

		order.map((label, index) => !labels[label] ? null :

			<div

				hidden={label !== active}

				aria-labelledby={tab(index)}

				id={panel(index)}
				key={label}

				/*
				 * A tab panel promises the strip that chose it, which the menu leaves off show, so what the reader
				 * meets then is a named area of the screen instead. The name stands either way: a tab taken off show
				 * still names what it points at.
				 *
				 * The panel takes no stop of its own: a stop is owed only by a panel holding nothing focusable, which
				 * a widget handed arbitrary content cannot tell without walking the DOM, and one taken where the
				 * content is reachable already lands the reader on the whole area on the way past. What a stop would
				 * have been good for, scrolling a panel by key, is handed by the browser to whichever box actually
				 * scrolls and holds nothing focusable, which inside a shell is the body of the content column
				 * rather than the panel within it.
				 */

				role={collapsed ? "region" : "tabpanel"}

			>{panels[label]}</div>
		)
	);


	// every tab is rendered, so the one a key moves to is already in the document and takes the focus at once

	function moving(transition: () => Tabs) {
		return () => {

			const moved = transition().active;

			document.getElementById(tab(opt(moved, label => order.indexOf(label), -1)))?.focus();

		};
	}


	// ids are built on the position of a panel, a label being free to carry the spaces an id reference cannot

	function tab(index: number) {
		return `${id}-tab-${index}`;
	}

	function panel(index: number) {
		return `${id}-panel-${index}`;
	}

}
