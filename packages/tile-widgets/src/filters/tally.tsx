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
 * Collection tally facet.
 *
 * Offers a facet that narrows a collection to the items holding the values the reader picks. Each value is shown with
 * the number of items holding it, and every lens over the same collection follows the values picked.
 *
 * @module
 */

import { useModel } from "@metreeca/clay/model";
import type { Optional } from "@metreeca/core";
import type { Relay } from "@metreeca/core/relay";
import { isReference } from "@metreeca/qest/state";
import type { TallyBucket, TallyCases } from "@metreeca/tile/tally";
import { SquareCheckBigIcon, XCircleIcon, XIcon } from "lucide-preact";
import { type ComponentChildren, createElement } from "preact";
import { useEffect, useId, useState } from "preact/hooks";
import { createFold } from "../index.core.js";
import { AutoDelay, cancel, classes, Configure, Failure, keys, leave, More, Settings } from "../index.js";
import "./tally.css";


/**
 * Creates a collection tally facet.
 *
 * Lists the values the tally offers as checkboxes, each labelled by its name and by the number of items holding it,
 * grouping digits as the reader's locale does, so that ticking a value narrows the collection to the items holding
 * any of the values ticked. The name of a linked resource is a link to it, which takes the reader to the resource and
 * leaves its checkbox as it stands. The items holding none of the values are offered as `‹blank›`, a name the facet
 * supplies itself. A value no item lets through under the other criteria stays on offer with a count of `0`, so the
 * list holds still, every value in its place, as other facets narrow the collection; its checkbox is disabled unless
 * ticked, since ticking it would empty the collection, while a ticked one stays enabled to be unticked.
 *
 * A search field narrows the values on offer once the reader pauses typing, at once on `Enter`, and `Escape` empties
 * it, as does a button marked by the clear glyph, shown while text is typed. While the field is empty, a button marked
 * by the reset glyph takes its place as long as values are ticked and deselects them all, so the two never stand side
 * by side. A long list is closed by a trigger fetching the next batch as it scrolls into view.
 *
 * The facet folds down to the values ticked. Turning to the search field opens it while the reader works on it, and
 * focus leaving a collapsing facet closes it again, back to the values the reader ticked.
 *
 * A button marked by the facet glyph shows the settings of the facet in place of its values. A check mark takes its
 * place and ends the settings, as does focus leaving the facet. Meanwhile, the search field shows the facet name and
 * takes no input, and the reset is withheld. The `Collapse` setting, ticked from the start as `collapsed` states,
 * decides whether the facet closes as focus leaves it or stays open with every value on offer shown.
 *
 * The facet is a group named by `name`, marked busy while the values are retrieved for the first time; a failed
 * retrieval is shown as a critical note in place of the values, until a later retrieval brings them back.
 *
 * ```tsx
 * const collection = useCollection({ entry: "/courses/", shape: Course });
 *
 * <Tally name="University" tally={useTally(collection, "university", { label: "name", size: 10 })}/>
 * ```
 *
 * @param options The widget configuration
 *
 * @returns The facet
 *
 * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/ ARIA Authoring Practices: Checkbox Pattern}
 */
export function Tally({

	collapsed = false,

	name,

	tally,

	children

}: {

	/**
	 * Whether the facet starts closed and closes as focus leaves it, showing only the values ticked; open if omitted.
	 *
	 * Either way, the reader opens the facet by turning to its search field, and changes this from its settings.
	 */
	collapsed?: boolean

	/**
	 * The name of the facet, stating what its values describe, as in `University`.
	 *
	 * The name labels the group for assistive technology, and the empty search field shows it as a hint, which doubles
	 * as the visible title of the facet.
	 */
	name: string

	/**
	 * The tally offered, as handed by {@link @metreeca/tile!tally.useTally useTally}.
	 */
	tally: Relay<TallyCases>

	/**
	 * Renders the name of a value; the {@link @metreeca/tile!tally.TallyBucket.label label} of the value if omitted.
	 *
	 * The items holding none of the values are always named `‹blank›` by the facet, so the reader can tell that name
	 * from the values in the data. The name of a linked resource is set within a link to it, so the rendered name must
	 * hold no control of its own: a link or a button nested inside the link would be invalid markup.
	 *
	 * @param bucket The value to be named, never the `‹blank›` option the facet names itself
	 */
	children?: (bucket: TallyBucket & { readonly label: string }) => ComponentChildren

}) {

	const id = useId();

	const { open, collapsing, configuring, expand, collapse, configure, collapsible } = useModel(() => createFold({
		open: !collapsed, collapsing: collapsed
	}));

	const keywords = tally({ ready: ({ keywords }) => keywords }) ?? "";

	const failed = tally({ error: () => true }) ?? false;
	const filled = tally({ ready: ({ state }) => state.length > 0 }) ?? false;
	const ticked = tally({ ready: ({ state }) => state.some(({ selected }) => selected) }) ?? false;

	/*
	 * The text the reader typed is held apart from the keywords narrowing the options until the reader pauses, and is
	 * tagged with the keywords it was typed over, so that keywords changed elsewhere, as by a reset, take its place.
	 */

	const [typed, setTyped] = useState<Optional<{ readonly text: string, readonly from: string }>>(undefined);

	const text = typed !== undefined && typed.from === keywords ? typed.text : keywords;

	// the pause is timed by the browser alone, so a timer is held for as long as the typed text is not applied

	useEffect(() => text.trim() === keywords ? undefined : cancel(setTimeout(apply, AutoDelay)), [text, keywords]);

	return createElement("tile-tally", {

		"role": "group",
		"aria-label": name,
		"aria-busy": tally({ blank: () => true }),

		/*
		 * Safari leaves focus off the checkboxes and buttons a reader presses, so a press within the facet would read
		 * as focus leaving it and close the facet before the click lands; the facet takes the focus in their place.
		 */

		"tabIndex": -1,

		// the search field opens the facet as it takes focus, any other part leaves it as it stands

		"onFocusIn": (event: FocusEvent) => {
			if ( event.target instanceof HTMLInputElement && event.target.type === "search" ) {
				expand();
			}
		},

		"onFocusOut": (event: FocusEvent) => leave(event, collapse)

	}, <>

		<header>

			<Configure configuring={configuring} glyph={<SquareCheckBigIcon/>} onToggle={configure}/>

			{/* while configuring, the field holds the facet name, ignores keys and stays off the keyboard path */}

			<input id={`${id}-search`} type="search" value={configuring ? name : text} placeholder={name} aria-label={"Search"}

				readOnly={configuring}
				tabIndex={configuring ? -1 : undefined}

				onInput={event => setTyped({ text: event.currentTarget.value, from: keywords })}
				onKeyDown={configuring ? undefined : keys({ Enter: apply, ...(text === "" ? {} : { Escape: () => search("") }) })}

			/>

			<span>

				{/* Safari leaves buttons off the keyboard path unless the reader opts in, so each states its place on it */}

				{text !== "" ? <button type="button" tabIndex={0}

					title={"Clear"}

					onClick={() => search("")}

				><XIcon class={"clear"}/></button> : ticked && !configuring && <button type="button" tabIndex={0}

					title={"Reset"}

					// the reset goes away once pressed, so the search field takes focus in its place, keeping the facet open

					onClick={() => {
						document.getElementById(`${id}-search`)?.focus();
						setTyped(undefined);
						tally({ ready: ({ clear }) => clear() });
					}}

				><XCircleIcon/></button>}

			</span>

		</header>

		{/* the region is rendered from the first render, hidden until there is something to show in it */}

		<section id={id} hidden={!configuring && !failed && !(open ? filled : ticked)}>{configuring ? <Settings collapsing={collapsing} onCollapsing={collapsible}/> : tally({

			ready: ({ state, select, load }) => <>

				<ul>{state.filter(({ selected }) =>

					open || selected

				).map(bucket =>

					<li key={JSON.stringify(bucket.value)} class={classes({ unavailable: bucket.count === 0, blank: bucket.value === null })}>
						<label>

							<input type="checkbox" checked={bucket.selected}
								disabled={bucket.count === 0 && !bucket.selected}
								onChange={event => select(bucket.value, event.currentTarget.checked)}
							/>

							<span>{isReference(bucket.value)
								? <a href={bucket.value}>{Name(bucket)}</a>
								: Name(bucket)
							}</span>
							{" "}
							<small>{bucket.count.toLocaleString()}</small>

						</label>
					</li>
				)}</ul>

				{open && load && <More onLoad={load}/>}

			</>,

			error: () => <Failure/>

		})}</section>

	</>);


	/**
	 * Renders the name of an option.
	 *
	 * @param bucket The option to be named
	 */
	function Name({ label, ...bucket }: TallyBucket): ComponentChildren {
		return label === undefined ? "‹blank›"
			: children ? children({ ...bucket, label })
				: label;
	}

	/**
	 * Narrows the options by the text typed, at once.
	 */
	function apply(): void {
		search(text.trim(), text);
	}

	/**
	 * Narrows the options by keywords.
	 *
	 * @param keywords The keywords narrowing the options
	 * @param shown The text the field shows for `keywords`
	 */
	function search(keywords: string, shown: string = keywords): void {
		setTyped({ text: shown, from: keywords });
		tally({ ready: ({ search }) => search(keywords) });
	}

}
