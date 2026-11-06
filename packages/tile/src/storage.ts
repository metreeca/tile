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
 * Web Storage state.
 *
 * Keeps component values in Web Storage rather than in the page, so they survive reloads. Values kept in
 * `localStorage` are also shared by every page of the site open in the browser, and stay in step whichever page
 * writes them.
 *
 * Values are stored as JSON: only values surviving a JSON round trip read back as they were set.
 *
 * @see [Web Storage API](https://developer.mozilla.org/docs/Web/API/Web_Storage_API)
 *
 * @module
 */

import { eager, type Lazy } from "@metreeca/core";
import { useEffect, useState } from "preact/hooks";


/**
 * Binds a component to a value kept in Web Storage.
 *
 * The component renders the value the entry holds, or `initial` while the entry is empty. It stays in step with the
 * entry whoever changes it: the returned setter, or another page writing the entry, removing it or clearing the
 * storage area. Changes made by other pages arrive only for storage areas the browser shares across pages, in
 * practice `localStorage`.
 *
 * The storage area and the key may change between renders. The component then renders and follows the new entry,
 * and the previous entry is left untouched.
 *
 * @typeParam T The type of the stored value
 *
 * @param storage The storage area holding the entry, usually `localStorage` or `sessionStorage`
 * @param key The name of the entry in `storage`
 * @param initial The value shown while the entry holds none, or a factory creating it
 *
 * @returns The value as it stands for this render, and a setter storing a new one; setting `undefined` removes the
 *     entry, so that the view shows `initial` again
 *
 * @throws {@link !SyntaxError SyntaxError} If the entry holds a value that is not well-formed JSON
 */
export function useStorage<T>(storage: Storage, key: string, initial: Lazy<T>): [T, (value: T | undefined) => void] {

	const [entry, setEntry] = useState(read);

	const current = entry.storage === storage && entry.key === key ? entry : read();

	if ( current !== entry ) {
		setEntry(current);
	}

	useEffect(() => { // other pages are a foreign lifetime, notified only through window events

		const sync = ({ storageArea, key: changed }: StorageEvent) => {
			if ( storageArea === storage && (changed === null || changed === key) ) {
				setEntry(read());
			}
		};

		window.addEventListener("storage", sync);

		return () => window.removeEventListener("storage", sync);

	}, [storage, key]);

	return [current.value, value => {

		if ( value === undefined ) {
			storage.removeItem(key);
		} else {
			storage.setItem(key, JSON.stringify(value));
		}

		setEntry(read());

	}];


	function read(): { storage: Storage, key: string, value: T } {

		const item = storage.getItem(key);

		return { storage, key, value: item === null ? eager(initial) : JSON.parse(item) };

	}

}
