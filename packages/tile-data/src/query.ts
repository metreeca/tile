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
 * Location query state.
 *
 * Keeps the criteria a page is narrowed by in the browser location, so that they survive reloads, travel with links
 * and come back as the reader returns to the page through the history or a plain link to it.
 *
 * A catalogue page keeps the criteria of its collection in the location by handing them over as the collection seed,
 * and writing them back as the reader changes them, with no wiring beyond the call site:
 *
 * ```tsx
 * const [query, setQuery] = useQuery();
 *
 * const courses = useCollection({ entry: "/courses/", shape: Course, sieve: query, onChange: setQuery });
 * ```
 *
 * @module
 */

import type { Optional } from "@metreeca/core";
import { type Criteria, decodeCriteria, encodeCriteria, isCriteria } from "@metreeca/qest/model";
import { useEffect, useState } from "preact/hooks";
import { useRoute } from "./router.js";


/**
 * Binds a component to the criteria kept in the browser location.
 *
 * The criteria are read as the component mounts, from the first place holding them:
 *
 * - the history entry the page stands at, as when the reader comes back to the page through the history
 * - the location query, as when the page is reloaded or reached through a link carrying the criteria
 * - the criteria last written for the route in the session, as when the page is reached through a plain link
 *
 * Writing the criteria replaces them in all three places without adding a history entry, so the history keeps one
 * entry per page however many times the reader narrows it. Criteria written by the component never mount it again:
 * a navigation to another query does, as described by {@link "router"!Routes Routes}.
 *
 * @returns The criteria as they stand for this render, and a setter replacing them; empty criteria leave the location
 *     with no query, the path and the hash staying in place whatever the criteria written
 */
export function useQuery(): [Criteria, (criteria: Criteria) => void] {

	const key = `${useRoute()}#query`;

	const [query, setQuery] = useState(read);

	useEffect(() => write(query), []); // the location records the criteria read as the component mounts

	return [query, update];


	function update(criteria: Criteria): void {
		write(criteria);
		setQuery(criteria);
	}

	function read(): Criteria {
		return isCriteria(history.state) ? history.state
			: decode(location.search.substring(1)) ?? decode(sessionStorage.getItem(key) ?? "") ?? {};
	}

	function write(criteria: Criteria): void {

		const encoded = encodeCriteria(criteria);

		history.replaceState(criteria, document.title,
			`${location.pathname}${encoded ? `?${encoded}` : ""}${location.hash}`
		);

		sessionStorage.setItem(key, encoded);

	}

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Decodes criteria, tolerating their absence and malformed ones.
 *
 * @param encoded The encoded criteria
 *
 * @returns The criteria `encoded` states, or nothing if it is empty or malformed
 */
function decode(encoded: string): Optional<Criteria> {
	try {
		return encoded ? decodeCriteria(encoded) : undefined;
	} catch {
		return undefined; // a malformed query, as one edited by hand, is left to the places read after it
	}
}
