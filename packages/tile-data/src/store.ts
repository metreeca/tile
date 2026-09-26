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
 * write them back to, configured once where the interface is assembled rather than at every call site.
 *
 * @module
 */

import type { ResourceShape } from "@metreeca/blue/resource";
import type { Lazy, Optional } from "@metreeca/core";
import { createRelay, type Relay } from "@metreeca/core/relay";
import { resolve } from "@metreeca/core/resource";
import { type Fetch, NotFound } from "@metreeca/http";
import { type Problem, toProblem } from "@metreeca/http/success";
import type { Store } from "@metreeca/keep";
import { createRESTStore } from "@metreeca/keep-rest";
import type { Instance, LookedUp } from "@metreeca/keep/_blue/value";
import type { Template } from "@metreeca/qest/model";
import type { Reference } from "@metreeca/qest/state";
import { type ComponentChildren, createContext, createElement } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import { useFetch } from "./fetch.js";


const Context = createContext<Store>(createRESTStore(globalThis.fetch));


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

	factory = createRESTStore,

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
 * @returns The store offered by the innermost enclosing {@link Store} context; outside any such context, a REST proxy
 *     store performing its exchanges through the global fetch function
 */
export function useStore(): Store {
	return useContext(Context);
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
 * rejects with the same {@link Problem}, so that the view waiting on it can tell success from failure.
 *
 * @typeParam S The shape describing the resource
 * @typeParam T The template stating which values of the resource are wanted
 *
 * @param options The resource to be bound, the shape describing it and the values wanted; read as the component
 *     first renders and whenever the store or the resource identifier change, so a view is expected to keep the
 *     shape and the template stable for the lifetime of the component
 *
 * @returns A {@link Relay} over the state of the binding, to be matched by a view with a handler for each: `blank`
 *     while the resource is being retrieved, `ready` with the resource and the operations writing it back to the
 *     store, `stale` with the resource last retrieved while it is being refreshed, or `error` with the
 *     {@link Problem} that prevented any of them
 */
export function useResource<S extends Lazy<ResourceShape>, T extends Template>({ // !!! enforce S/T consistency

	entry,
	shape,
	model

}: {

	/**
	 * The absolute identifier of the resource.
	 */
	readonly entry: Reference;

	/**
	 * The shape the retrieved resource is validated against, possibly deferred to break definition cycles.
	 */
	readonly shape: S;

	/**
	 * The template stating which values of the resource are retrieved; the value handed back holds these and nothing
	 * wider.
	 */
	readonly model: T;


}): Relay<{

	/**
	 * The resource is being retrieved, with neither a value nor an error to show yet.
	 */
	readonly blank: void

	/**
	 * The resource is retrieved and in step with the store.
	 */
	readonly ready: {

		/**
		 * The resource as the store currently holds it, narrowed to the values the template asks for.
		 */
		state: LookedUp<S, T>

		/**
		 * Replaces the resource in the store.
		 *
		 * @param state The complete replacement state of the resource
		 *
		 * @returns A promise resolving once the store has handled the write, the binding following the change as the
		 *     store signals it; rejects with the {@link Problem} the binding moves to `error` with, if the resource
		 *     is missing or the write fails
		 */
		update(state: Instance<S>): Promise<void>

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
	 * The last known state of the resource, superseded by a change the store signalled and not yet retrieved.
	 *
	 * The binding moves back to `ready` once the change is retrieved, or to `error` if the retrieval fails; no write
	 * is offered meanwhile, as it would be based on values the store no longer holds.
	 */
	readonly stale: {

		/**
		 * The resource as it was last retrieved, narrowed to the values the template asks for.
		 */
		state: LookedUp<S, T>

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
		 * Retrieves the resource again, moving the binding back to `blank` until the store answers.
		 *
		 * @returns A promise resolving once the resource is retrieved and the binding is `ready`; rejects with the
		 *     {@link Problem} the binding moves back to `error` with, if the resource is missing or the retrieval
		 *     fails
		 */
		reload(): Promise<void>

	}


}> {

	type Options = ReturnType<typeof useResource<S, T>> extends Relay<infer O> ? O : never;


	const store = useStore();

	const [status, setStatus] = useState<Optional<
		| { readonly state: LookedUp<S, T>, readonly stale: boolean }
		| { readonly error: Problem }
	>>(undefined);


	// the store signals changes for as long as the component observes it, outliving any single render

	useEffect(() => {

		reload().catch(stated);

		return store.observe(refresh, entry);

	}, [store, entry]);


	return createRelay<Options>(status === undefined ? { blank: undefined }
		: "error" in status ? { error: { state: status.error, reload } }
			: status.stale ? { stale: { state: status.state } }
				: { ready: { state: status.state, update, delete: remove } }
	);


	function reload(): Promise<void> {

		setStatus(undefined);

		return retrieve();

	}

	function refresh(): Promise<void> {

		// the latest status, as the observer outlives the render that registered it

		setStatus(current => current !== undefined && "state" in current ? { ...current, stale: true } : current);

		return retrieve().catch(stated);

	}

	function retrieve(): Promise<void> {
		return store.lookup({ entry, shape, model })
			.then(state => state === undefined ? Promise.reject(missing()) : setStatus({ state, stale: false }))
			.catch(reject);
	}

	function update(state: Instance<S>): Promise<void> {
		return store.update({ entry, shape, state })
			.then(reference => reference === undefined ? Promise.reject(missing()) : undefined)
			.catch(reject);
	}

	function remove(): Promise<Reference> {
		return store.delete({ entry, shape })
			.then(reference => reference === undefined ? Promise.reject(missing()) : parent())
			.catch(reject);
	}


	function parent(): Reference {
		return resolve(entry, entry.endsWith("/") ? ".." : ".");
	}


	function missing(): Problem {
		return toProblem({

			status: NotFound

		});
	}

	/**
	 * Absorbs a failure no caller waits on, the binding already stating it as its `error` state.
	 */
	function stated(): void {}

	function reject(issue: unknown): Promise<never> {

		const error = toProblem(issue);

		setStatus({ error });

		return Promise.reject(error);

	}

}
