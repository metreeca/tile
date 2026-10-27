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
 * Store bindings.
 *
 * Lets the store hooks of this package move through the same states, whatever value they bind a component to. None of
 * it is offered to consumers, so the package can retune the bindings without a release note: the hooks built on them,
 * whether binding a resource or a collection, carry the behaviour documented for each of them.
 *
 * @module
 */

import type { ResourceShape } from "@metreeca/blue/resource";
import { type Draft, type Items, items, type Slice } from "@metreeca/blue/value";
import type { Lazy, Optional } from "@metreeca/core";
import { createRelay, type Option, type Relay } from "@metreeca/core/relay";
import { type IRI, resolve } from "@metreeca/core/resource";
import { Conflict, NotFound } from "@metreeca/http";
import { type Problem, toProblem } from "@metreeca/http/success";
import type { Store } from "@metreeca/keep";
import type { Reference } from "@metreeca/qest/state";
import { useEffect, useState } from "preact/hooks";
import { useStore } from "./index.js";


/**
 * Binds a component to the items of a collection held by the shared store.
 *
 * Retrieves the items a multi-valued property of a resource collects from the store offered by the innermost
 * enclosing {@link "store"!Store Store} context and keeps the component in step with them, so that a lens shows what
 * the store holds without driving exchanges of its own: the items are retrieved again whenever the store signals a
 * change to the resource holding them, whichever component or other client made the change.
 *
 * A missing resource, a rejected creation and a failed exchange alike move the binding to its `error` state, as for
 * {@link "store/resource"!useResource useResource}; an operation the view called also rejects with the same
 * {@link Problem}, while a failed exchange no view called for is reported through the binding alone.
 *
 * The model is typed and held stable as for {@link "store/resource"!useResource useResource}, and may likewise be
 * fixed or replaced at runtime, a different one having the items retrieved again.
 *
 * @typeParam S The shape describing the resource holding the collection
 * @typeParam T The model naming the property collecting the items and stating which values of each item are wanted
 *
 * @param options The resource holding the collection, the shape describing it and the model addressing the
 *     collection; read as the component first renders and again whenever the store, the resource or the model change
 *
 * @returns A {@link Relay} over the state of the binding, to be matched by a view with a handler for each: `blank`
 *     until the items are first retrieved, `ready` with the items and the operation adding one, or `error` with the
 *     {@link Problem} that prevented either; a state is kept until the next one supersedes it, including while the
 *     items are retrieved again after a change or on reload, so that a lens never blanks out between retrievals
 *
 * @throws {@link !Error Error} If called outside any {@link "store"!Store Store} context
 * @throws {@link !RangeError RangeError} If `entry` is invalid, or relative while the location is not hierarchical
 */
export function useItems<S extends Lazy<ResourceShape>, T extends Slice<S, T>>({

	entry: relative,
	shape,
	model

}: {

	/**
	 * The identifier of the resource holding the collection, either absolute or relative to the current location.
	 */
	readonly entry: IRI

	/**
	 * The shape describing the resource holding the collection, possibly deferred to break definition cycles.
	 */
	readonly shape: S

	/**
	 * The model naming the multi-valued property collecting the items and stating, under that name, the template or
	 * projection narrowing each item to the values retrieved; compared by reference, so that a model written inline
	 * at the call site retrieves the items again on every render: declare it as a constant, or keep it in state.
	 */
	readonly model: T

}): Relay<{

	readonly blank: void

	readonly ready: {
		state: Items<S, T>
		create(state: Draft<S, T>): Promise<Reference>
	}

	readonly error: {
		readonly state: Problem
		reload(): Promise<void>
	}

}> {

	const store = useStore();
	const entry = resolve(location.href, relative);

	return createRelay(useEntry({

		store,
		entry,
		model,

		lookup: () => store.lookup({ entry, shape, model }).then(holder => holder && items(holder, model)),

		modify: settle => ({

			create: (state: Draft<S, T>) => settle(store.create({ entry, shape, model, state }), Conflict)

		})

	}));

}


/**
 * Binds a component to a value retrieved from a store.
 *
 * Tracks the changes the store signals to a resource, so resource and collection bindings move through the same
 * states.
 *
 * @param options The store and the resource whose changes are tracked, the model narrowing the value, how the value
 *     is retrieved, and the modifications offered while it is `ready`; a modification settles its exchange through the
 *     function it is handed, so that a failure moves the binding to `error`; the value is retrieved again whenever the
 *     store, the resource or the model change
 *
 * @returns The current state of the binding
 */
export function useEntry<V, W extends object>({

	store,
	entry,
	model,

	lookup,
	modify

}: {

	readonly store: Store
	readonly entry: Reference
	readonly model: object

	lookup(): Promise<Optional<V>>

	modify(settle: <R>(outcome: Promise<Optional<R>>, status?: number) => Promise<R>): W

}): Option<{

	readonly blank: void
	readonly ready: { readonly state: V } & W
	readonly error: { readonly state: Problem, reload(): Promise<void> }

}> {

	const [option, setOption] = useState<ReturnType<typeof useEntry<V, W>>>({ blank: undefined });


	useEffect(() => {

		void track();

		return store.observe(track, entry);

	}, [store, entry, model]);


	return option;


	function reload(): Promise<void> {
		return settle(lookup()).then(ready);
	}

	/**
	 * Retrieves the value for no caller, leaving failures to `error` and only unforeseen ones to the page.
	 */
	function track(): Promise<void> {
		return settle(lookup()).then(ready, () => {});
	}

	function ready(state: V): void {
		setOption({ ready: { state, ...modify(settle) } });
	}


	/**
	 * Moves the binding to `error` if an exchange fails or yields nothing, rejecting with the same problem.
	 *
	 * @param outcome The pending exchange
	 * @param status The status of the problem an exchange yielding nothing is rejected with
	 */
	function settle<R>(outcome: Promise<Optional<R>>, status: number = NotFound): Promise<R> {
		return outcome
			.then(value => value ?? Promise.reject(toProblem({ status })))
			.catch(issue => {

				const error = toProblem(issue);

				setOption({ error: { state: error, reload } });

				return Promise.reject(error);

			});
	}

}
