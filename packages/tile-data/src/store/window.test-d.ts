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

import { reference } from "@metreeca/blue/reference";
import { id, multiple, optional, required, resource } from "@metreeca/blue/resource";
import { string } from "@metreeca/blue/string";
import { describe, expectTypeOf, it } from "vitest";
import { useCollection } from "./collection.js";
import { useWindow } from "./window.js";


const Item = resource({ id: id(), label: required(string()), notes: optional(string()) });
const Catalogue = resource({ id: id(), members: multiple(reference(Item)) });


describe("useWindow()", () => {

	const collection = useCollection({ entry: "/", shape: Catalogue });

	it("should accept models naming the item members", async () => {
		useWindow(collection, { model: { id: {}, label: {} } });
	});

	it("should reject models naming members the item doesn't hold", async () => {

		// @ts-expect-error unknown item member
		useWindow(collection, { model: { title: {} } });

	});

	it("should type the items with the values the model asks for", async () => {

		useWindow(collection, { model: { label: {} } })({
			ready: ({ state }) => expectTypeOf(state).toEqualTypeOf<readonly { readonly label: string }[]>()
		});

	});

});
