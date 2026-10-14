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
 * Failure boundary.
 *
 * Confines a failure to the part of a screen it broke: what a guard holds gives way to a fallback once it fails, the
 * rest of the screen goes on working, and the failure is raised for a reader to see rather than lost to the console.
 *
 * @module
 */

import { useBoard } from "@metreeca/tile-data/board";
import { type ComponentChildren, createElement } from "preact";
import { useErrorBoundary } from "preact/hooks";
import "./guard.css";


/**
 * Creates a guarded area.
 *
 * Renders what it holds until a component inside it fails while rendering, updating or running an effect, then shows
 * the fallback in its place and raises the failure on the {@link @metreeca/tile-data!board.Board board} enclosing the
 * guard, so a reader learns what went wrong while the screen around the guard keeps working. Guards nest: the innermost
 * one around the failing component takes the failure up, and a guard further out keeps rendering what it holds, the
 * inner guard showing its fallback among the rest, so a failure is confined as narrowly as guards are placed.
 *
 * The failure is raised as a `defect` of the interface, or as a `failure` where the component threw problem details,
 * and logged to the console as caught, so whoever fixes the defect finds the stack the post leaves out.
 *
 * A failure in an event handler or in asynchronous work happens outside rendering and never reaches a guard: the board
 * takes it up among the issues the page raises on its own account. A fallback failing in turn is taken up by the guard
 * enclosing this one, or left to the board where no other guard encloses it, so no failure goes unseen.
 *
 * The guard keeps to its fallback for as long as it stays mounted. It takes no box of its own, so what it holds and
 * the fallback alike sit in the row, the grid or the flow around it as they would without the wrapper, and it carries
 * no semantics: a fallback telling assistive technology what went missing states it itself.
 *
 * @param options The widget configuration
 *
 * @returns The guarded area
 */
export function Guard({

	fallback,

	children

}: {

	/**
	 * What stands in place of what the guard holds once it failed; nothing if omitted, leaving the area empty.
	 */
	fallback?: ComponentChildren

	/**
	 * What the guard holds, rendered until it fails.
	 */
	children: ComponentChildren

}) {

	const { raise } = useBoard();

	const [error] = useErrorBoundary(error => {

		console.error(error); // the post leaves the stack out, so the console keeps it for whoever fixes the defect

		raise(error);

	});

	return createElement("tile-guard", {}, error === undefined ? children : fallback);

}
