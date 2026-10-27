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
import { id, multiple, optional, required, resource, type ResourceShape } from "@metreeca/blue/resource";
import { string } from "@metreeca/blue/string";
import { describe, expectTypeOf, it } from "vitest";
import { type Collections, createCollection, type Sole } from "./collection.core.js";
import { useCollection } from "./collection.js";
import { useMembers } from "./members.js";


const Item = resource({ id: id(), label: required(string()) });

const Catalogue = resource({

	id: id(),

	members: multiple(reference(Item)),
	featured: optional(reference(Item)),
	tags: multiple(string())

});

const Shelves = resource({

	id: id(),

	members: multiple(reference(Item)),
	archive: multiple(Item)

});

const Labels = resource({

	id: id(),

	tags: multiple(string())

});

const Archive = resource(Catalogue, { id: id() });


describe("Collections", () => {

	it("should name the multi-valued properties ranging over resources", async () => {
		expectTypeOf<Collections<typeof Catalogue>>().toEqualTypeOf<"members">();
		expectTypeOf<Collections<typeof Shelves>>().toEqualTypeOf<"members" | "archive">();
	});

	it("should name inherited collections", async () => {
		expectTypeOf<Collections<typeof Archive>>().toEqualTypeOf<"members">();
	});

	it("should name nothing for a resource holding no collection of resources", async () => {
		expectTypeOf<Collections<typeof Labels>>().toEqualTypeOf<never>();
	});

	it("should name any property for the bare resource shape", async () => {
		expectTypeOf<Collections<ResourceShape>>().toEqualTypeOf<string>();
	});

});

describe("Sole", () => {

	it("should resolve the only collection", async () => {
		expectTypeOf<Sole<typeof Catalogue>>().toEqualTypeOf<"members">();
	});

	it("should resolve nothing for several collections or none", async () => {
		expectTypeOf<Sole<typeof Shelves>>().toEqualTypeOf<never>();
		expectTypeOf<Sole<typeof Labels>>().toEqualTypeOf<never>();
	});

});

describe("createCollection()", () => {

	it("should infer the collecting property from the shape", async () => {
		expectTypeOf(createCollection({ entry: "/", shape: Catalogue }).target.field).toEqualTypeOf<"members">();
	});

	it("should reject properties other than collections of resources", async () => {

		// @ts-expect-error collection of literals
		createCollection({ entry: "/", shape: Catalogue, field: "tags" });

	});

});

describe("useCollection()", () => {

	it("should infer the collecting property from the shape", async () => {
		expectTypeOf(useCollection({ entry: "/", shape: Catalogue }).target.field).toEqualTypeOf<"members">();
	});

	it("should infer the collecting property from the argument", async () => {
		expectTypeOf(useCollection({ entry: "/", shape: Shelves, field: "archive" }).target.field)
			.toEqualTypeOf<"archive">();
	});

	it("should keep the shape it is handed", async () => {
		expectTypeOf(useCollection({ entry: "/", shape: Catalogue }).target.shape).toEqualTypeOf<typeof Catalogue>();
	});

	it("should require the collecting property where the shape doesn't settle it", async () => {

		// @ts-expect-error several collections
		useCollection({ entry: "/", shape: Shelves });

		// @ts-expect-error no collection
		useCollection({ entry: "/", shape: Labels });

	});

	it("should reject properties other than collections of resources", async () => {

		// @ts-expect-error single-valued
		useCollection({ entry: "/", shape: Catalogue, field: "featured" });

		// @ts-expect-error collection of literals
		useCollection({ entry: "/", shape: Catalogue, field: "tags" });

		// @ts-expect-error unknown
		useCollection({ entry: "/", shape: Catalogue, field: "unknown" });

	});

});

describe("useMembers()", () => {

	it("should type new items against the item shape", async () => {

		const { create } = useMembers(useCollection({ entry: "/", shape: Catalogue }));

		expectTypeOf(create).toBeCallableWith({ label: "item" });

		// @ts-expect-error missing required label
		create({});

	});

});
