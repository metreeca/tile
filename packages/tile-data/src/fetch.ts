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
 * Shared fetch client.
 *
 * Offers the components of an interface one client to read resources through and write them back with, configured
 * once where the interface is assembled rather than at every call site, and states whether that client is busy, so
 * that waiting is shown wherever the interface sees fit.
 *
 * The client and its status are offered apart: a component performing exchanges renders no more often than its own
 * state requires, however busy the client is.
 *
 * > [!NOTE]
 * >
 * > The client is a plain [`fetch`](https://developer.mozilla.org/docs/Web/API/Window/fetch) function, so anything
 * > expecting one accepts it and anything producing one may replace it:
 * > [@metreeca/http](https://metreeca.github.io/http/) provides composable fetch middlewares covering recurring HTTP
 * > concerns, such as authentication, caching or uniform failure reporting.
 *
 * @module
 */

import { createFetch, type Fetch } from "@metreeca/http";
import { headers } from "@metreeca/http/headers";
import { monitor } from "@metreeca/http/monitor";
import { transport } from "@metreeca/http/transport";
import { type ComponentChildren, createContext, createElement } from "preact";
import { useContext, useState } from "preact/hooks";


const Client = createContext<Fetch>(globalThis.fetch);
const Status = createContext<boolean>(false);


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Offers a shared fetch client to nested components.
 *
 * Extends the client with the services every interface relies on: JSON is asked for unless an exchange states the
 * content it expects on its own terms, and every exchange in flight counts towards the busy status, so that waiting is
 * stated without any call site taking part.
 *
 * Whatever a deployment settles for itself stays with the consumer: a client assembled with
 * {@link @metreeca/http!createFetch createFetch} and handed over keeps the services above, with its own middlewares
 * running closer to the network.
 *
 * The client is assembled as the context first renders and kept for as long as it lives, so that exchanges are not
 * disturbed by the interface around them: a client handed over later never replaces the one in use.
 *
 * @param options The client the context is to offer, and the components it is offered to
 *
 * @returns The nested components, with the extended client and its status offered to them
 */
export function Fetch({

	fetch = globalThis.fetch,

	children

}: {

	/**
	 * The fetch function every exchange is ultimately performed by; defaults to the global one.
	 */
	fetch?: Fetch

	/**
	 * The components the client and its status are offered to.
	 */
	children: ComponentChildren

}) {

	const [status, setStatus] = useState(false);

	const [client] = useState(() => createFetch(
		monitor({ busy: setStatus }),
		headers({ "Accept": "application/json" }),
		transport(fetch)
	));

	return createElement(Client.Provider, { value: client },
		createElement(Status.Provider, { value: status, children })
	);

}


/**
 * Retrieves the shared fetch client.
 *
 * The client stands for as long as the {@link Fetch} context offering it lives, so a component reading it renders
 * again only as its own state requires, and a handler may keep it across exchanges.
 *
 * @returns The client offered by the innermost enclosing {@link Fetch} context; the global fetch function outside any
 *     such context
 */
export function useFetch(): Fetch {
	return useContext(Client);
}

/**
 * States whether the shared fetch client is busy.
 *
 * Renders the component again whenever the client takes up work or falls idle, so that a progress indicator states
 * what the interface is waiting for without following exchanges of its own. Concurrent exchanges stand as a single
 * stretch of waiting, rather than as one stretch each.
 *
 * @returns true if the client offered by the innermost enclosing {@link Fetch} context has exchanges in flight; false
 *     otherwise, and outside any such context
 */
export function useFetching(): boolean {
	return useContext(Status);
}
