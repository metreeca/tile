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

import { AutoDelay, classes, keys } from "@metreeca/clay-cell";
import { Button } from "@metreeca/clay-cell/button";
import { Icon } from "@metreeca/clay-cell/icon";
import { Link } from "@metreeca/clay-cell/link";
import { More } from "@metreeca/clay-cell/more";
import { Note } from "@metreeca/clay-cell/note";
import { useModel } from "@metreeca/clay/model";
import type { Optional } from "@metreeca/core";
import type { Relay } from "@metreeca/core/relay";
import { isReference } from "@metreeca/qest/state";
import type { TallyBucket, TallyCases } from "@metreeca/tile/tally";
import { type ComponentChildren, createElement } from "preact";
import { useEffect, useId, useState } from "preact/hooks";
import { createFold } from "./index.core.js";
import { cancel, Disclosure, leave } from "./index.js";
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
 * A collapsible facet, one stating whether it is `compact`, folds down to the values ticked. Turning to the search
 * field opens it while the reader works on it, and focus leaving the facet closes it again, back to the values the
 * reader ticked; a disclosure marked by the expand glyph opens it to stay open, until the reader closes it by the same
 * disclosure, whether the facet was opened by the disclosure itself or by the search field. A compact facet starts
 * closed, any other starts open, as if opened by its disclosure when first rendered.
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

	compact,

	name,

	tally,

	children

}: {

	/**
	 * Whether the facet starts closed, showing only the values ticked; open from the start if omitted.
	 *
	 * Either way, the reader opens and closes the facet by its disclosure or by turning to its search field.
	 */
	compact?: boolean

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

	const collapsible = compact !== undefined;

	// a facet starting open is opened as by its disclosure, so it stays open until the reader closes it

	const { open: unfolded, expand, collapse, toggle } = useModel(() => compact === false
		? createFold().toggle()
		: createFold()
	);

	const open = !collapsible || unfolded;

	const keywords = tally({ ready: ({ keywords }) => keywords }) ?? "";

	const ready = tally({ ready: () => true }) ?? false;
	const failed = tally({ error: () => true }) ?? false;
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

		"tabIndex": collapsible ? -1 : undefined,

		"onFocusOut": collapsible ? (event: FocusEvent) => leave(event, collapse) : undefined

	}, <>

		<header>

			<Icon.Options/>

			<input type="search" value={text} placeholder={name} aria-label={"Search"}

				onFocusIn={collapsible ? expand : undefined}
				onInput={event => setTyped({ text: event.currentTarget.value, from: keywords })}
				onKeyDown={keys({ Enter: apply, ...(text === "" ? {} : { Escape: () => search("") }) })}

			/>

			<span>

				{text !== "" ? <Button

					look={"subtle"}

					icon={<Icon.Clear class={"clear"}/>}
					title={"Clear"}

					onClick={() => search("")}

				/> : ticked && <Button

					look={"subtle"}

					icon={<Icon.Reset/>}
					title={"Reset"}

					onClick={() => {
						setTyped(undefined);
						tally({ ready: ({ clear }) => clear() });
					}}

				/>}

				{collapsible && <Disclosure open={open} controls={id} onToggle={toggle}/>}

			</span>

		</header>

		{/* the region is rendered from the first render, hidden until there is something to show in it */}

		<section id={id} hidden={!failed && !(ready && (open || ticked))}>{tally({

			ready: ({ state, select, load }) => <>

				{open && state.length === 0 ? <small>No Matches</small> : <ul>{state.filter(({ selected }) =>

					open || selected

				).map(bucket =>

					<li key={JSON.stringify(bucket.value)} class={classes({ unavailable: bucket.count === 0, blank: bucket.value === null })}>
						<label>

							<input type="checkbox" checked={bucket.selected}
								disabled={bucket.count === 0 && !bucket.selected}
								onChange={event => select(bucket.value, event.currentTarget.checked)}
							/>

							<span>{isReference(bucket.value)
								? <Link href={bucket.value}>{Name(bucket)}</Link>
								: Name(bucket)
							}</span>
							{" "}
							<small>{bucket.count.toLocaleString()}</small>

						</label>
					</li>
				)}</ul>}

				{open && load && <More onLoad={load}/>}

			</>,

			error: () => <Note level="critical" text={"Not Available"}/>

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
