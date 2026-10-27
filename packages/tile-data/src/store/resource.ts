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
 * Shared resource bindings.
 *
 * Binds a component to a resource held by the {@link "store"!Store shared store}, so that a view renders what the
 * store holds and writes changes back to it without driving exchanges of its own.
 *
 * @module
 */

import type { ResourceShape } from "@metreeca/blue/resource";
import type { Draft, Match, Model } from "@metreeca/blue/value";
import type { Lazy } from "@metreeca/core";
import { createRelay, type Relay } from "@metreeca/core/relay";
import { getIRIParent, type IRI, resolve } from "@metreeca/core/resource";
import type { Problem } from "@metreeca/http/success";
import type { Reference } from "@metreeca/qest/state";
import { useEntry } from "./index.core.js";
import { useStore } from "./index.js";


/**
 * Shared resource binding cases.
 *
 * @typeParam S The shape describing the resource
 * @typeParam T The template stating which values of the resource are wanted
 */
export type ResourceCases<S extends Lazy<ResourceShape>, T extends Model<S, T>> = {

	/**
	 * The resource is being retrieved for the first time, with neither a value nor an error to show.
	 */
	readonly blank: void

	/**
	 * The resource is retrieved, and stays on show while a change the store signals is retrieved again.
	 */
	readonly ready: {

		/**
		 * The resource as the store currently holds it, narrowed to the values the template asks for.
		 */
		state: Match<S, T>

		/**
		 * Replaces the resource in the store.
		 *
		 * @param state The complete replacement state of the resource
		 *
		 * @returns A promise resolving to the absolute identifier of the updated resource once the store has handled
		 *     the write, the binding following the change as the store signals it; rejects with the {@link Problem}
		 *     the binding moves to `error` with, if the resource is missing or the write fails
		 */
		update(state: Draft<S>): Promise<Reference>

		/**
		 * Removes the resource from the store.
		 *
		 * @returns A promise resolving to the absolute identifier of the collection the removed resource belonged to
		 *     (`https://example.com/c/` for `https://example.com/c/r`), so that a view can move there; rejects with
		 *     the {@link Problem} the binding moves to `error` with, if the resource is missing or the removal fails
		 */
		delete(): Promise<Reference>

	}

	/**
	 * The last exchange with the store failed, whether retrieving the resource or writing it back.
	 */
	readonly error: {

		/**
		 * The problem describing the failure.
		 */
		readonly state: Problem

		/**
		 * Retrieves the resource again, the binding staying in `error` until the store answers.
		 *
		 * @returns A promise resolving once the resource is retrieved and the binding is `ready`; rejects with the
		 *     {@link Problem} the binding moves back to `error` with, if the resource is missing or the retrieval
		 *     fails
		 */
		reload(): Promise<void>

	}

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Binds a component to a resource held by the shared store.
 *
 * Retrieves the resource from the store offered by the innermost enclosing {@link "store"!Store Store} context and
 * keeps the component in step with it, so that a view renders what the store holds and writes changes back without
 * driving exchanges of its own: the resource is retrieved again whenever the store signals a change to it, whoever
 * made it.
 *
 * A missing resource, a rejected write and a failed exchange alike move the binding to its `error` state, so that a
 * view shows them where it shows the resource and offers to retry from there; an operation the view called also
 * rejects with the same {@link Problem}, so that the view waiting on it can tell success from failure. A failed
 * exchange no view called for, retrieving the resource as the component renders or after the store signals a change,
 * is reported through the binding alone and never reaches the page: only a missing {@link "store"!Store Store} context
 * or an unforeseen failure does, for an enclosing {@link "board"!Board Board} context to take up.
 *
 * The template may be fixed or replaced at runtime, and one stating something different has the resource retrieved
 * again, while a copy stating the same, as a template written inline at the call site is on every render, retrieves
 * nothing:
 *
 * - a **fixed** template, declared in code, types the resource exactly with the values it asks for
 * - a **runtime** template, built as the interface runs, for instance as a user picks the values to show, types the
 *   resource only as loosely as the template itself is typed, so a view reads the values it holds by inspecting it
 *
 * @typeParam S The shape describing the resource
 * @typeParam T The template stating which values of the resource are wanted
 *
 * @param options The resource to be bound, the shape describing it and the values wanted; read as the component
 *     first renders and whenever the store, the resource identifier or the template change, so a view is expected
 *     to keep the shape stable for the lifetime of the component
 *
 * @returns A {@link Relay} over the {@link ResourceCases} of the binding, to be matched by a view with a handler for
 *     each: `blank` until the resource is first retrieved, `ready` with the resource and the operations writing it back
 *     to the store, or `error` with the {@link Problem} that prevented either; a state is kept until the next one
 *     supersedes it, including while the resource is retrieved again after a change, under a new identifier or on
 *     reload, so that a view never blanks out between retrievals
 *
 * @throws {@link !Error Error} If called outside any {@link "store"!Store Store} context
 * @throws {@link !RangeError RangeError} If `entry` is invalid, or relative while the location is not hierarchical
 */
export function useResource<S extends Lazy<ResourceShape>, T extends Model<S, T>>({

	entry: relative,
	shape,
	model

}: {

	/**
	 * The identifier of the resource, either absolute or relative to the current location.
	 */
	readonly entry: IRI

	/**
	 * The shape the retrieved resource is validated against, possibly deferred to break definition cycles.
	 */
	readonly shape: S

	/**
	 * The template stating which values of the resource are retrieved, and nothing wider; compared by content, so that
	 * it may be written inline at the call site, and a copy stating the same retrieves nothing.
	 */
	readonly model: T

}): Relay<ResourceCases<S, T>> {

	const store = useStore();
	const entry = resolve(location.href, relative);

	return createRelay(useEntry({

		store,
		entry,
		model,

		lookup: () => store.lookup({ entry, shape, model }),

		modify: settle => ({

			update: (state: Draft<S>) => settle(store.update({ entry, shape, state })),

			delete: () => settle(store.delete({ entry, shape })).then(() =>
				getIRIParent(entry) ?? entry // the root is its own collection
			)

		})

	}));

}
