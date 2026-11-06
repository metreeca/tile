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
 * @module store/index.core
 */

import type { ResourceShape } from "@metreeca/blue/resource";
import { getShapeBranches } from "@metreeca/blue/union";
import { effective, type Range } from "@metreeca/blue/value";
import { isArray, isIdentifier, isObject, isString, type Lazy, type Optional } from "@metreeca/core";
import type { Option } from "@metreeca/core/relay";
import { type IRI, isIRI, resolve } from "@metreeca/core/resource";
import { equals, immutable } from "@metreeca/core/values";
import { NotFound } from "@metreeca/http";
import { type Problem, toProblem } from "@metreeca/http/success";
import type { Store } from "@metreeca/keep";
import { decodeProbe, isBinding, isSelector, type Probe } from "@metreeca/qest/model";
import type { Reference } from "@metreeca/qest/state";
import { useEffect, useState } from "preact/hooks";


/**
 * The operators of criteria testing values against option sets: matching, containment and sort focus.
 */
const Options: ReadonlySet<string> = new Set(["?", "!", "+"]);


/**
 * Resolves the references a binding is stated with against the current location.
 *
 * Settles in one place what resource and collection bindings accept in relative form, so that the store is only ever
 * handed absolute references, as it requires:
 *
 * - the identifier of the bound resource, absolute or relative to the current location
 * - the options of the matching, containment and focus criteria (`?`, `!` and `+`) in `query`, at any depth of a
 *   template, where the shape states that the expression they test reaches references alone
 *
 * Anything else is kept as it stands: options of expressions reaching literals or nothing at all, which are left for
 * the store to validate, and the values of criteria other than option sets, such as keywords and bounds.
 *
 * @param options The bound resource and the query it is retrieved with: a template over the resource, or the criteria
 *     narrowing the items of `field` where the collecting property is given
 *
 * @returns The absolute identifier of the bound resource, and `query` with its option references made absolute
 *
 * @throws {@link !RangeError RangeError} If `entry` is invalid, or relative while the location is not hierarchical
 */
export function resolveTarget<Q extends object>({

	entry,
	shape,
	field,
	query

}: {

	/**
	 * The identifier of the bound resource, either absolute or relative to the current location.
	 */
	readonly entry: IRI

	/**
	 * The shape describing the bound resource, possibly deferred to break definition cycles.
	 */
	readonly shape: Lazy<ResourceShape>

	/**
	 * The property collecting the items `query` narrows, where it states criteria rather than a template.
	 */
	readonly field?: string

	/**
	 * The template or the criteria the binding retrieves the resource with.
	 */
	readonly query: Q

}): { readonly entry: Reference, readonly query: Q } {

	const current = location.href;
	const scope = field === undefined ? shape : effective(shape, { target: field, pipe: [], path: [field] });

	return {
		entry: resolve(current, entry),
		query: isString(scope) ? query : walk(scope, query) as Q // ;(cast) only options are replaced, keeping Q's shape
	};


	/**
	 * Resolves the options a template or criteria state over the values of a scope.
	 */
	function walk(scope: Lazy<ResourceShape> | Range, value: object): object {
		return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, member(scope, key, nested)]));
	}

	/**
	 * Resolves the options a single template or criteria entry states.
	 */
	function member(scope: Lazy<ResourceShape> | Range, key: string, value: unknown): unknown {

		// a plain key names a property, retrieved as a binding to itself would be; anything else is left to the store

		const probe: Optional<Probe> = isIdentifier(key) ? { target: key, pipe: [], path: [key] }
			: isBinding(key) || isSelector(key) ? decodeProbe(key)
				: undefined;

		// keywords, bounds, ordering and pagination test no references, and atomic entries hold no criteria

		return probe === undefined ? value
			: Options.has(probe.target) ? matched(scope, probe, value)
				: isIdentifier(probe.target) && isObject(value) ? nested(scope, probe, value)
					: value;

	}

	function matched(scope: Lazy<ResourceShape> | Range, probe: Probe, value: unknown): unknown {

		const range = effective(scope, probe);

		return !isString(range) && references(range) ? options(value) : value;

	}

	function nested(scope: Lazy<ResourceShape> | Range, probe: Probe, value: object): object {

		const range = effective(scope, probe);

		return isString(range) ? value : walk(range, value);

	}

	function references(range: Range): boolean {

		const kinds = getShapeBranches(range.shape).map(({ kind }) => kind);

		return kinds.length > 0 && kinds.every(kind => kind === "reference");

	}

	function options(value: unknown): unknown {
		return isArray(value) ? value.map(option) : option(value);
	}

	function option(value: unknown): unknown {
		return isString(value) && isIRI(value, "relative") ? resolve(current, value) : value;
	}

}


/**
 * Binds a component to a value retrieved from a store.
 *
 * Tracks the changes the store signals to a resource, so that resource and collection bindings move through the same
 * states, from the first retrieval through the value on show to the failure of an exchange.
 *
 * @param options The store and the resource whose changes are tracked, the model narrowing the value, how the value
 *     is retrieved, and the modifications offered while it is `ready`. A modification settles its exchange through the
 *     function it is handed, so that a failure moves the binding to `error`. The value is retrieved again whenever the
 *     store, the resource or the model change, and the retrieval is then handed the `ready` state on show, so that it
 *     may extend that state rather than retrieve it all again. The whole value is retrieved instead as the store
 *     signals a change or the binding is reloaded, so that no part of the value on show is left out of date
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

	lookup(shown?: { readonly state: V } & W): Promise<Optional<V>>

	modify(settle: <R>(outcome: Promise<Optional<R>>, status?: number) => Promise<R>): W

}): Option<{

	readonly blank: void
	readonly ready: { readonly state: V } & W
	readonly error: { readonly state: Problem, reload(): Promise<void> }

}> {

	const [option, setOption] = useState<ReturnType<typeof useEntry<V, W>>>({ blank: undefined });

	// the model is compared by content: a copy stating the same keeps the model held, and retrieves nothing

	const [held, setHeld] = useState(model);
	const current = equals(held, model) ? held : model;

	if ( current !== held ) {
		setHeld(current);
	}


	useEffect(() => {

		void track(option.ready);

		return store.observe(() => void track(), entry);

	}, [store, entry, current]);


	return option;


	function reload(): Promise<void> {
		return settle(lookup()).then(ready);
	}

	/**
	 * Retrieves the value for no caller, leaving failures to `error` and only unforeseen ones to the page.
	 *
	 * @param shown The `ready` state the retrieval may extend
	 */
	function track(shown?: { readonly state: V } & W): Promise<void> {
		return settle(lookup(shown)).then(ready, () => {});
	}

	function ready(state: V): void {
		setOption(immutable({ ready: { state, ...modify(settle) } }));
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

				setOption(immutable({ error: { state: error, reload } }));

				return Promise.reject(error);

			});
	}

}
