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
 * Fault queue.
 *
 * Collects the issues an interface runs into and provides them as faults, each stated as problem details. Any
 * number of readers may show the same fault, as a note in the page, a transient toast or a diagnostic panel.
 *
 * Faults stand until they are cleared rather than replacing one another, and each keeps an identity of its own, so a
 * reader tells a new fault from one it has already shown. Clearing the faults a reader has shown leaves the rest
 * standing.
 *
 * @module
 */

import { assert } from "@metreeca/core";
import { some, type Some } from "@metreeca/core/arrays";
import type { IRI } from "@metreeca/core/resource";
import { createState } from "@metreeca/core/state";
import { toProblem, type Problem } from "@metreeca/http/success";


/**
 * Fault queue.
 *
 * Holds the faults raised against an interface, oldest first: any component raises one, a reader clears it once shown.
 *
 * Raising and clearing leave this queue untouched and return a new one, so faults read earlier stay as they were. A
 * call that changes nothing returns this same queue, which a rendering layer takes as nothing to redraw.
 */
export interface Faults {

	/**
	 * The {@link Fault | faults} raised against the interface, oldest first; empty if there are none.
	 */
	readonly faults: readonly Fault[];


	/**
	 * Raises an issue.
	 *
	 * Takes the issue as caught, from a rejected exchange, a broken script or an unhandled rejection alike:
	 *
	 * - problem details, that is an object carrying at least one of `type`, `title`, `status`, `detail`, `instance`
	 *   or `report`, are kept as they are, so a fault reported by {@link @metreeca/http!success success} keeps the
	 *   status and the explanation its source gave it
	 * - an {@link !Error Error} becomes `status` 0, with its name as `title` and its message as `detail`, the stack
	 *   left out as a fault is expected to travel beyond the page that raised it
	 * - anything else becomes `status` 0, carried as `report` if it is JSON data and as `detail` otherwise
	 *
	 * Every issue counts as a new one: raising the same issue twice leaves two faults in the queue, each with an
	 * `instance` of its own, whatever the source supplied, because two failed attempts are not one.
	 *
	 * @param issue The issue as it was caught
	 *
	 * @returns A queue holding these faults and the one raised from `issue` last, less the oldest beyond the limit
	 */
	raise(issue: unknown): this;

	/**
	 * Clears faults.
	 *
	 * Clears the given faults alone, leaving those another reader has yet to show, and ignores any already cleared.
	 *
	 * @param faults The faults to clear; every fault in the queue if omitted
	 *
	 * @returns A queue without `faults`, or empty if `faults` is omitted; this same queue if nothing is cleared
	 */
	clear(faults?: Some<Fault>): this;

}

/**
 * A fault raised against an interface.
 *
 * Problem details, as any consumer of {@link @metreeca/http!Problem Problem} reads them, plus an identity for the
 * occurrence they describe. The same issue raised twice gives two faults, told apart by {@link instance}, so a
 * reader may clear either one on its own.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc9457 RFC 9457 - Problem Details for HTTP APIs}
 */
export interface Fault extends Problem {

	/**
	 * The identity of this fault.
	 *
	 * A `urn:uuid:` URI unique across sessions and interfaces, so a reader keyed by it never passes over a new fault.
	 */
	readonly instance: IRI;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a fault queue.
 *
 * @param options The queue configuration
 *
 * @returns An immutable empty {@link Faults} queue holding at most `limit` faults, or all if `limit` is not positive
 *
 * @throws {@link !TypeError TypeError} If `limit` is not an integer
 */
export function createFaults({

	limit = 0

}: {

	/**
	 * The cap on faults held at a time, so a failing component cannot flood the queue; unlimited if not positive.
	 *
	 * @defaultValue 0
	 */
	limit?: number

} = {}): Faults {

	const $limit = assert(limit, limit => Number.isInteger(limit), `illegal limit <${limit}>`);

	return createState<Faults>({

		faults: [],


		raise(issue: unknown) {

			const faults = [...this.faults, asFault(issue)];

			return { faults: $limit > 0 ? faults.slice(-$limit) : faults };

		},


		clear(faults?: Some<Fault>) {

			const cleared = new Set(some(faults).map(({ instance }) => instance));

			const kept = faults === undefined ? [] : this.faults.filter(({ instance }) => !cleared.has(instance));

			return kept.length === this.faults.length ? {} : { faults: kept };

		}

	});



	function asFault(issue: unknown): Fault {
		return {

			...toProblem(issue),

			instance: `urn:uuid:${crypto.randomUUID()}`

		};
	}

}
