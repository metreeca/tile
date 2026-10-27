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

import type { Optional } from "@metreeca/core";
import type { Option } from "@metreeca/core/relay";
import { NotFound } from "@metreeca/http";
import { type Problem, toProblem } from "@metreeca/http/success";
import type { Store } from "@metreeca/keep";
import type { Reference } from "@metreeca/qest/state";
import { useEffect, useState } from "preact/hooks";


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
