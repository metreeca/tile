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
 * Incremental loading trigger.
 *
 * Offers the trigger a growing list closes with, asking for the next batch as soon as the reader scrolls it into view,
 * so a long collection is fetched as it is read rather than all at once.
 *
 * @module
 */

import { opt } from "@metreeca/core";
import { type ComponentChildren, createElement } from "preact";
import { useEffect, useId } from "preact/hooks";
import { Icon } from "./icon.js";
import "./more.css";


/**
 * Creates an incremental loading trigger.
 *
 * Placed after the last item a list shows, it asks for more as soon as it comes into view, and stands in the list
 * meanwhile as a turning mark saying that more is on its way. A list with nothing left to fetch stops rendering it.
 *
 * A trigger still in view once the batch it asked for has landed asks again as soon as it is handed a new `onLoad`,
 * so a batch too short to push it out of view is followed by the next one without the reader having to scroll.
 *
 * The mark is decorative: waiting is for the list the trigger closes to state, for instance through `aria-busy`.
 *
 * @param options The widget configuration
 *
 * @returns The trigger
 */
export function More({

	onLoad,

	children

}: {

	/**
	 * What the request for the next batch is handed to, each time the trigger comes into view.
	 */
	onLoad: () => void


	/**
	 * The content standing in the list while the trigger waits; a turning mark if omitted.
	 */
	children?: ComponentChildren

}) {

	const id = useId();

	/*
	 * Whether the trigger is in view is known to the browser alone, so an observer is held for as long as the trigger
	 * is rendered. It is handed over again with each new handler, which is what lets a trigger left in view by a short
	 * batch ask again: a fresh observer tells of the trigger's state as soon as it starts watching.
	 */

	useEffect(() => opt(document.getElementById(id) ?? undefined, element => {

		const observer = new IntersectionObserver(entries => entries
			.filter(entry => entry.isIntersecting)
			.forEach(() => onLoad())
		);

		observer.observe(element);

		return () => observer.disconnect();

	}), [id, onLoad]);

	return createElement("tile-more", { id }, children ?? <Icon.RefreshCw/>);

}
