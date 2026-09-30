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
 * Shared resource store.
 *
 * Offers the components of an interface one [store](https://metreeca.github.io/keep/) to read resources from and
 * write them back to, configured once where the interface is assembled rather than at every call site, and binds
 * them to the resources and collections it holds, so that a view stays in step with the store without driving
 * exchanges of its own.
 *
 * @module
 */

import type { ResourceShape } from "@metreeca/blue/resource";
import { error, type Lazy, type Optional } from "@metreeca/core";
import { createRelay, type Option, type Relay } from "@metreeca/core/relay";
import { getIRIParent, type IRI, resolve } from "@metreeca/core/resource";
import { Conflict, type Fetch, NotFound } from "@metreeca/http";
import { type Problem, toProblem } from "@metreeca/http/success";
import type { Store } from "@metreeca/keep";
import { createRESTStore } from "@metreeca/keep-rest";
import { type Batch, type Draft, type Frame, type Match, type Slice } from "@metreeca/keep/_blue/value";
import type { Reference } from "@metreeca/qest/state";
import { type ComponentChildren, createContext, createElement } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import { useFetch } from "./fetch.js";


const Context = createContext<Optional<Store>>(undefined);


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Offers a shared resource store to nested components.
 *
 * The store performs its exchanges through the shared fetch client of the innermost enclosing
 * {@link "fetch"!Fetch Fetch} context, so it shares the services and the busy status configured there.
 *
 * The store is assembled as the context first renders and kept for as long as it lives, so that pending operations
 * are not disturbed by the interface around them: a factory handed over later never replaces the store in use.
 *
 * @param options The factory the store is assembled by, and the components it is offered to
 *
 * @returns The nested components, with the store offered to them
 */
export function Store({

	factory = fetch => createRESTStore({ fetch }),

	children

}: {

	/**
	 * The factory assembling the store from the shared fetch client; defaults to a REST proxy store.
	 */
	factory?: (fetch: Fetch) => Store

	/**
	 * The components the store is offered to.
	 */
	children: ComponentChildren

}) {

	const fetch = useFetch();

	const [store] = useState(() => factory(fetch));

	return createElement(Context.Provider, { value: store, children });

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Retrieves the shared resource store.
 *
 * @returns The store offered by the innermost enclosing {@link Store} context
 *
 * @throws {@link !Error Error} If called outside any {@link Store} context
 */
export function useStore(): Store {
	return useContext(Context) ?? error(new Error("missing <Store> context"));
}

/**
 * Binds a component to a resource held by the shared store.
 *
 * Retrieves the resource from the store offered by the innermost enclosing {@link Store} context and keeps the
 * component in step with it, so that a view renders what the store holds and writes changes back without driving
 * exchanges of its own: the resource is retrieved again whenever the store signals a change to it, whoever made it.
 *
 * A missing resource, a rejected write and a failed exchange alike move the binding to its `error` state, so that a
 * view shows them where it shows the resource and offers to retry from there; an operation the view called also
 * rejects with the same {@link Problem}, so that the view waiting on it can tell success from failure. A failed
 * exchange no view called for, retrieving the resource as the component renders or after the store signals a change,
 * is reported through the binding alone and never reaches the page: only a missing {@link Store} context or an
 * unforeseen failure does, for an enclosing {@link "faults"!Faults Faults} context to take up.
 *
 * The template may be fixed or replaced at runtime, and a different one has the resource retrieved again:
 *
 * - a **fixed** template, declared in code, types the resource exactly with the values it asks for
 * - a **runtime** template, built as the interface runs, for instance as a user picks the values to show, types the
 *   resource only as loosely as the template itself is typed, so a view reads the values it holds by inspecting it
 *
 * > [!CAUTION]
 * > A template is told apart by identity, not content: declare a fixed template once, outside the component, and
 * > hold a runtime one in state of the component's own. A template written inline at the call site is a new object
 * > on every render, and has the resource retrieved again, and the component rendered again, on every render.
 *
 * @typeParam S The shape describing the resource
 * @typeParam T The template stating which values of the resource are wanted
 *
 * @param options The resource to be bound, the shape describing it and the values wanted; read as the component
 *     first renders and whenever the store, the resource identifier or the template change, so a view is expected
 *     to keep the shape stable for the lifetime of the component
 *
 * @returns A {@link Relay} over the state of the binding, to be matched by a view with a handler for each: `blank`
 *     until the resource is first retrieved, `ready` with the resource and the operations writing it back to the
 *     store, or `error` with the {@link Problem} that prevented either; a state is kept until the next one supersedes
 *     it, including while the resource is retrieved again after a change, under a new identifier or on reload
 *
 * @throws {@link !Error Error} If called outside any {@link Store} context
 * @throws {@link !RangeError RangeError} If `entry` is invalid, or relative while the location is not hierarchical
 */
export function useResource<S extends Lazy<ResourceShape>, T extends Frame<S, T>>({

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
	 * The template stating which values of the resource are retrieved, and nothing wider.
	 *
	 * > [!WARNING]
	 * > Templates are compared by reference: any new object, even with the same content, retrieves the resource
	 * > again. A template written inline, as in `useResource({ …, model: { name: {} } })`, is a new object on every
	 * > render, and retrieves the resource on every render: declare it as a constant instead, or keep it in state
	 * > if it changes at runtime.
	 */
	readonly model: T

}): Relay<{

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


}> {

	const store = useStore();
	const entry = resolve(location.href, relative);

	return createRelay(useEntry({

		store,
		entry,
		model,

		lookup: () => store.detail({ entry, shape, model }),

		writes: settle => ({

			update: (state: Draft<S>) => settle(store.update({ entry, shape, state })),

			delete: () => settle(store.delete({ entry, shape })).then(() =>
				getIRIParent(entry) ?? entry // the root is its own collection
			)

		})

	}));

}


/**
 * Binds a component to a collection held by the shared store.
 *
 * Retrieves the items a multi-valued property of a resource collects from the store offered by the innermost
 * enclosing {@link Store} context and keeps the component in step with them, so that a view lists what the store
 * holds and adds items without driving exchanges of its own: the collection is retrieved again whenever the store
 * signals a change to the resource holding it, whoever made it.
 *
 * A missing resource, a rejected creation and a failed exchange alike move the binding to its `error` state, as for
 * {@link useResource}; an operation the view called also rejects with the same {@link Problem}, while a failed
 * exchange no view called for is reported through the binding alone.
 *
 * The model is typed and held stable as for {@link useResource}, and may likewise be fixed or replaced at runtime.
 *
 * @typeParam S The shape describing the resource holding the collection
 * @typeParam T The model naming the property collecting the items and stating which values of each item are wanted
 *
 * @param options The resource holding the collection, the shape describing it and the model addressing the
 *     collection; read as the component first renders and whenever the store, the resource identifier or the model
 *     change
 *
 * @returns A {@link Relay} over the state of the binding, to be matched by a view with a handler for each: `blank`
 *     until the collection is first retrieved, `ready` with the items and the operation adding one, or `error` with
 *     the {@link Problem} that prevented either; a state is kept until the next one supersedes it, including while
 *     the collection is retrieved again after a change or on reload
 *
 * @throws {@link !Error Error} If called outside any {@link Store} context
 * @throws {@link !RangeError RangeError} If `entry` is invalid, or relative while the location is not hierarchical
 */
export function useCollection<S extends Lazy<ResourceShape>, T extends Slice<S, T>>({

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
	 * projection narrowing each item to the values retrieved, and nothing wider: `{ members: { name: {} } }` lists
	 * the names of the items the `members` property collects.
	 *
	 * > [!WARNING]
	 * > Models are compared by reference: any new object, even with the same content, retrieves the collection
	 * > again. A model written inline, as in `useCollection({ …, model: { members: { name: {} } } })`, is a new
	 * > object on every render, and retrieves the collection on every render: declare it as a constant instead, or
	 * > keep it in state if it changes at runtime.
	 */
	readonly model: T


}): Relay<{

	/**
	 * The collection is being retrieved for the first time, with neither items nor an error to show.
	 */
	readonly blank: void

	/**
	 * The collection is retrieved, and stays on show while a change the store signals is retrieved again.
	 */
	readonly ready: {

		/**
		 * The items as the store currently holds them, narrowed to the values the model asks for.
		 */
		state: Batch<S, T>

		/**
		 * Adds an item to the collection.
		 *
		 * @param state The new item, checked against the item shape; its identifier may be left for the store to assign
		 *
		 * @returns A promise resolving to the absolute identifier the store assigned to the new item, so that a view
		 *     can move there, the binding following the change as the store signals it; rejects with the
		 *     {@link Problem} the binding moves to `error` with, if the item already exists or the creation fails
		 */
		create(state: Draft<S, T>): Promise<Reference>

	}

	/**
	 * The last exchange with the store failed, whether retrieving the collection or adding an item to it.
	 */
	readonly error: {

		/**
		 * The problem describing the failure.
		 */
		readonly state: Problem

		/**
		 * Retrieves the collection again, the binding staying in `error` until the store answers.
		 *
		 * @returns A promise resolving once the collection is retrieved and the binding is `ready`; rejects with the
		 *     {@link Problem} the binding moves back to `error` with, if the resource is missing or the retrieval
		 *     fails
		 */
		reload(): Promise<void>

	}


}> {

	const store = useStore();
	const entry = resolve(location.href, relative);

	return createRelay(useEntry({

		store,
		entry,
		model,

		lookup: () => store.select({ entry, shape, model }),

		writes: settle => ({

			create: (state: Draft<S, T>) => settle(store.create({ entry, shape, model, state }), Conflict)

		})

	}));

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Binds a component to a value retrieved from a store.
 *
 * Tracks the changes the store signals to a resource, so resource and collection bindings move through the same states.
 *
 * @param options The store and the resource whose changes are tracked, the model narrowing the value, how the value
 *     is retrieved, and the writes offered while it is `ready`; a write settles its exchange through the function it
 *     is handed, so that a failure moves the binding to `error`; the value is retrieved again whenever the store, the
 *     resource or the model change
 *
 * @returns The current state of the binding
 */
function useEntry<V, W extends object>({

	store,
	entry,
	model,

	lookup,
	writes

}: {

	readonly store: Store
	readonly entry: Reference
	readonly model: object

	lookup(): Promise<Optional<V>>

	writes(settle: <R>(outcome: Promise<Optional<R>>, status?: number) => Promise<R>): W

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
		setOption({ ready: { state, ...writes(settle) } });
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
