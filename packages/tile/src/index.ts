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
 * Preact linked data store.
 *
 * Offers the components of an interface one shared [store](https://metreeca.github.io/keep/) to read linked data
 * resources from and write them back to. The store is configured once, where the interface is assembled, rather than
 * at every call site. Components bind to the resources and collections it holds, so that every view stays in step
 * with the store and none has to drive exchanges of its own, or track the changes made by others.
 *
 * @module index
 */

import { useFetch } from "@metreeca/clay/fetch";
import { error, type Optional } from "@metreeca/core";
import type { Fetch } from "@metreeca/http";
import type { Store } from "@metreeca/keep";
import { createRESTStore } from "@metreeca/keep-rest";
import { type ComponentChildren, createContext, createElement } from "preact";
import { useContext, useState } from "preact/hooks";

export * from "./actions.js";
export * from "./collection.js";
export * from "./count.js";
export * from "./keywords.js";
export * from "./members.js";
export * from "./query.js";
export * from "./range.js";
export * from "./resource.js";
export * from "./tally.js";


const Context = createContext<Optional<Store>>(undefined);


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Offers a shared resource store to nested components.
 *
 * The store performs its exchanges through the fetch client the interface shares, so that they go through the same
 * services, such as authentication and progress tracking, as every other exchange the app performs.
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
