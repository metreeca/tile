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
import { id, multiple, required, resource } from "@metreeca/blue/resource";
import { string } from "@metreeca/blue/string";
import { useCollection, useMembers } from "@metreeca/tile-data/store";
import { describe, expectTypeOf, it } from "vitest";
import { Sheet } from "./sheet.js";


const Item = resource({ id: id(), label: required(string()) });
const Catalogue = resource({ id: id(), members: multiple(reference(Item)) });


describe("Sheet", () => {

	const members = useMembers(useCollection({ entry: "/", shape: Catalogue }), { model: { label: {} } });

	it("should type the items with the values the members model asks for", async () => {
		Sheet({
			members,
			children: item => expectTypeOf(item).toEqualTypeOf<{ readonly label: string }>()
		});
	});

});
