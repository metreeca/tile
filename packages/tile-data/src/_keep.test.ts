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
import { describe, expect, expectTypeOf, it } from "vitest";

import { type Collected, collected, type Draft } from "./_keep.js";


const Item = resource({ id: id(), label: required(string()) });
const Note = resource({ text: required(string()) });

const Catalogue = resource({

	id: id(),

	members: multiple(reference(Item)),
	notes: multiple(Note),
	tags: multiple(string())

});

const Special = resource(Catalogue, { extras: multiple(reference(() => Item)) });


describe("collected()", () => {

	it("should resolve the shape the references of a property point at", async () => {

		expect(collected(Catalogue, "members")).toBe(Item);

		expectTypeOf<Collected<typeof Catalogue, "members">>().toEqualTypeOf<typeof Item>();

	});

	it("should resolve the shape of the resources a property embeds", async () => {

		expect(collected(Catalogue, "notes")).toBe(Note);

		expectTypeOf<Collected<typeof Catalogue, "notes">>().toEqualTypeOf<typeof Note>();

	});

	it("should resolve inherited properties", async () => {

		expect(collected(Special, "members")).toBe(Item);

		expectTypeOf<Collected<typeof Special, "members">>().toEqualTypeOf<typeof Item>();

	});

	it("should resolve deferred shapes", async () => {

		expect(collected(() => Special, "extras")).toBeTypeOf("function");

		expectTypeOf<Collected<() => typeof Special, "extras">>().toEqualTypeOf<() => typeof Item>();

	});

	it("should reject properties collecting anything other than resources", async () => {

		expect(() => collected(Catalogue, "tags")).toThrow(TypeError);

		expectTypeOf<Collected<typeof Catalogue, "tags">>().toBeNever();

	});

});

describe("Draft", () => {

	it("should make the member naming the resource optional", async () => {

		expectTypeOf<Draft<typeof Item>>().toEqualTypeOf<{ readonly label: string, readonly id?: string }>();

	});

	it("should leave shapes without a naming member as they are", async () => {

		expectTypeOf<Draft<typeof Note>>().toEqualTypeOf<{ readonly text: string }>();

	});

});
