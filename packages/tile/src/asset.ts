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
 * Static assets.
 *
 * Retrieves the documents a site serves beside its routes, such as Markdown guides and reference pages, so that a
 * view renders a document from its path alone. Each document is asked for in the media type its extension names.
 *
 * @module
 */

import { getMedia, NetworkError } from "@metreeca/http";
import { useEffect, useState } from "preact/hooks";
import { useFetch } from "./fetch.js";


/**
 * Retrieves a static asset.
 *
 * Renders the component again once the asset is retrieved, and whenever its path changes. The previous text is dropped
 * at once, so a view never shows a document under a path it does not belong to, even while the new one loads.
 *
 * The asset is retrieved at its exact path, without the query or the hash, so a change of query alone retrieves
 * nothing. The call site settles which file documents a folder or a route naming no file, such as `/guide/index.md`
 * for `/guide/` or `/guide/intro.md` for `/guide/intro`, since the site layout decides it rather than the asset.
 *
 * The asset is asked for in the media type its extension names, such as `text/markdown` for `.md` or
 * `application/json` for `.json`. Any media type is accepted if the extension is missing or unknown.
 *
 * The asset is retrieved through the client of the innermost enclosing {@link fetch!Fetch Fetch} context, so the
 * exchange counts towards its busy status like any other exchange the interface makes through that client.
 *
 * @param path The path of the asset, resolved against the current location
 *
 * @returns The text of the asset, or `undefined` while it is being retrieved; if the asset cannot be retrieved, the
 *     status code of the response, such as {@link @metreeca/http!NotFound NotFound} for a missing asset, or
 *     {@link @metreeca/http!NetworkError NetworkError} if no server answered at all
 */
export function useAsset(path: string): undefined | number | string {

	const fetch = useFetch();

	const { origin, pathname } = new URL(path, location.href);

	const asset = `${origin}${pathname}`; // the query and the hash left out
	const type = getMedia(asset);

	const [state, setState] = useState<{ asset: string, text: number | string }>();


	useEffect(() => {

		const controller = new AbortController();

		fetch(asset, { signal: controller.signal, headers: { "Accept": type } })
			.then<number | string>(response => response.ok ? response.text() : response.status)
			.catch(() => NetworkError)
			.then(text => {

				if ( !controller.signal.aborted ) { // a retrieval cancelled by a later one or by unmount is stale
					setState({ asset, text });
				}

			});

		return () => controller.abort();

	}, [asset, type, fetch]);


	return state?.asset === asset ? state.text : undefined; // the text of a previous asset is never stated

}
