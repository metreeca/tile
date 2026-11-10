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
 * Collection search.
 *
 * Offers a search box narrowing a collection by the text the reader types. Every lens over the same collection
 * follows the search, so lists, facets and counters alike show only the items matching it.
 *
 * @module
 */

import type { Optional } from "@metreeca/core";
import type { Search as Model } from "@metreeca/tile/search";
import { SearchIcon, XCircleIcon } from "lucide-preact";
import { createElement } from "preact";
import { useEffect, useState } from "preact/hooks";
import { AutoDelay, cancel, keys } from "../index.js";
import "./search.css";


/**
 * Creates a collection search box.
 *
 * The box narrows the collection once the reader pauses typing, or at once on `Enter`, rather than at every keystroke.
 *
 * Focusing the field selects its text, so the reader can type a new search without clearing the current one first.
 *
 * `Escape` empties the field and stops narrowing the collection, as does the reset button shown on a non-empty field.
 *
 * The field always shows the text narrowing the collection. If another lens changes or clears that text, as
 * {@link "filters/clear"!Clear Clear} does, the new text replaces what the reader typed, even before a pause.
 *
 * ```tsx
 * const collection = useCollection({ entry: "/events/", shape: Events });
 *
 * <Search name="Name" search={useSearch(collection, "label")}/>
 * ```
 *
 * @param options The widget configuration
 *
 * @returns The search box
 */
export function Search({

	name,

	search

}: {

	/**
	 * The name of the search box, stating what the text is matched against: `Name`.
	 *
	 * The name labels the field for assistive technology, and the empty field shows it as a hint.
	 */
	name: string

	/**
	 * The search narrowing the collection, as handed by {@link @metreeca/tile!search.useSearch useSearch}.
	 */
	search: Model

}) {

	/*
	 * The text the reader typed is held apart from the text narrowing the collection until the reader pauses, and is
	 * tagged with the text it was typed over, so that text changed elsewhere, as by a reset, takes its place.
	 */

	const [typed, setTyped] = useState<Optional<{ readonly text: string, readonly from: string }>>(undefined);

	const text = typed !== undefined && typed.from === search.text ? typed.text : search.text;

	// the pause is timed by the browser alone, so a timer is held for as long as the typed text is not applied

	useEffect(() => text.trim() === search.text ? undefined : cancel(setTimeout(apply, AutoDelay)), [text, search.text]);

	return createElement("tile-search", {}, <>

		<SearchIcon/>

		<input type="search" value={text} placeholder={name} aria-label={name}

			onFocus={event => event.currentTarget.select()}
			onInput={event => setTyped({ text: event.currentTarget.value, from: search.text })}
			onKeyDown={keys({ Enter: apply, ...(text === "" ? {} : { Escape: () => submit("") }) })}

		/>

		{/* Safari leaves buttons off the keyboard path unless the reader opts in, so the button states its place on it */}

		{text !== "" && <button type="button" tabIndex={0}

			title={"Reset"}

			onClick={() => submit("")}

		><XCircleIcon/></button>}

	</>);


	/**
	 * Narrows the collection by the text typed, at once.
	 */
	function apply(): void {
		submit(text.trim(), text);
	}

	/**
	 * Narrows the collection by new text.
	 *
	 * @param value The text narrowing the collection
	 * @param shown The text the field shows for `value`
	 */
	function submit(value: string, shown: string = value): void {
		setTyped({ text: shown, from: value });
		search.submit(value);
	}

}
