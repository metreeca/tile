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
 * Shared faults.
 *
 * Offers the components of an interface one place to raise issues at and read the faults they stand for, wherever
 * they sit in the page: a component that catches an issue states it without knowing who shows it, and a component
 * that shows faults renders them without knowing who caught them.
 *
 * Issues nothing in the interface caught are taken up as well: a broken script and an unhandled rejection are raised
 * as they reach the page, so an exchange whose rejection went unattended is shown rather than logged.
 *
 * Raising and reading are offered apart: a component that only raises issues renders no more often than its own
 * state requires, however many faults stand.
 *
 * @module
 */

import { manageState } from "@metreeca/core/state";
import { type ComponentChildren, createContext, createElement } from "preact";
import { useCallback, useContext, useEffect, useState } from "preact/hooks";
import { createFaults, type Faults } from "./faults.core.js";

export type { Fault } from "./faults.core.js";


const Queue = createContext<Faults>(createFaults());

const Raise = createContext<(issue: unknown) => void>(issue => {
	console.error("unhandled issue outside Faults context", issue);
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Offers shared faults to nested components.
 *
 * Takes up the issues the page raises on its own account, that is broken scripts and unhandled rejections, and
 * states them among the others: a rejected exchange nobody attended reaches a reader with the status and the
 * explanation its source gave it, rather than as a console entry.
 *
 * Faults stand for as long as the context lives and are cleared by whoever shows them, so a fault the reader never
 * saw is never dropped by a later one; the oldest is dropped on its own where faults stand beyond `limit`.
 *
 * @param options The number of faults standing at a time, and the components they are offered to
 *
 * @returns The nested components, with the faults standing against the interface offered to them
 *
 * @throws {@link !TypeError TypeError} If `limit` is not an integer
 */
export function Faults({

	limit,

	children

}: {

	/**
	 * The number of faults held at a time: raising an issue beyond it drops the oldest; every fault is kept if not
	 * positive. Taken as the context first renders, so a value given later never reaches it.
	 *
	 * @defaultValue 0
	 */
	limit?: number

	/**
	 * The components faults are offered to.
	 */
	children: ComponentChildren

}) {

	const [faults, setFaults] = useState(() => manageState(createFaults({ limit })).attach(state => setFaults(state)));

	const raise = useCallback((issue: unknown) => { setFaults(faults => faults.raise(issue)); }, []);

	useEffect(() => { // window issues outlive the render, so they are taken up for as long as the context lives

		const failed = (event: ErrorEvent) => raise(event.error ?? event.message);
		const rejected = (event: PromiseRejectionEvent) => raise(event.reason);

		window.addEventListener("error", failed);
		window.addEventListener("unhandledrejection", rejected);

		return () => {

			window.removeEventListener("error", failed);
			window.removeEventListener("unhandledrejection", rejected);

		};

	}, [raise]);

	return createElement(Raise.Provider, { value: raise },
		createElement(Queue.Provider, { value: faults, children })
	);

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Retrieves the faults raised against the interface.
 *
 * Renders the component again whenever a fault is raised or cleared, so a reader shows what stands at any time.
 * Clearing through the retrieved faults reaches every other reader, while the faults this render was given stand as
 * they were until the next one.
 *
 * @returns The faults offered by the innermost enclosing {@link Faults} context, to be read and cleared; an empty
 *     queue nothing ever fills, outside any such context
 */
export function useFaults(): Faults {
	return useContext(Queue);
}

/**
 * Retrieves the raising of an issue.
 *
 * The raising stands for as long as the {@link Faults} context offering it lives, so a component raising issues
 * renders again only as its own state requires, and a handler may keep it across exchanges.
 *
 * @returns The raising offered by the innermost enclosing {@link Faults} context; a raising that logs the issue to
 *     the console, outside any such context
 */
export function useRaise(): (issue: unknown) => void {
	return useContext(Raise);
}
