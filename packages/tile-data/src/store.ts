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

import type { Fetch } from "@metreeca/http";
import type { Store } from "@metreeca/keep";
import { createRESTStore } from "@metreeca/keep-rest";
import { type ComponentChildren, createContext, createElement } from "preact";
import { useContext, useState } from "preact/hooks";
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
