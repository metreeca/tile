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
 * Collection items.
 *
 * Resolves the shape of the resources a multi-valued property collects, so that a collection binding validates and
 * types the items it creates against the shape they are held to.
 *
 * > [!NOTE]
 * > Prototype of a helper meant for `@metreeca/keep`, next to `Repeated`.
 *
 * @module
 */

import type { Member, ResourceShape } from "@metreeca/blue/resource";
import { eager, type Eager, error, type Lazy, type Optional } from "@metreeca/core";
import type { Carried, Instance, Repeated } from "@metreeca/keep/_blue/value";


/**
 * The shape of the resources a multi-valued property collects.
 *
 * Yields the resource shape the property ranges over, or the one its references point at, whether the property is
 * declared by the shape or inherited; `never` for a property collecting anything other than resources, such as
 * plain values or a union of shapes.
 *
 * @typeParam S The shape declaring or inheriting the property, possibly deferred to break definition cycles
 * @typeParam F The name of the property
 */
export type Collected<S extends Lazy<ResourceShape>, F extends Repeated<S>> =
	Carried<S>[F] extends { readonly range: { readonly shape: infer R } }
		? Eager<R> extends { readonly kind: "reference", readonly target: infer T extends Lazy<ResourceShape> } ? T
			: Eager<R> extends ResourceShape ? R
				: never
		: never;


/**
 * The initial state of a resource to be created.
 *
 * Yields the state of a resource the shape describes, with the member naming the resource made optional, so that the
 * store may assign the identifier on creation.
 *
 * @typeParam S The shape describing the resource, possibly deferred to break definition cycles
 */
export type Draft<S extends Lazy<ResourceShape>> = Instance<S> extends infer I ? ({
	readonly [K in keyof I as K extends Named<S> ? never : K]: I[K]
} & {
	readonly [K in keyof I as K extends Named<S> ? K : never]?: I[K]
}) extends infer D ? { [K in keyof D]: D[K] } : never : never;

/**
 * The name of the member naming the resources a shape describes.
 *
 * @typeParam S The shape describing the resources, possibly deferred to break definition cycles
 */
export type Named<S extends Lazy<ResourceShape>> = {
	[K in keyof Carried<S>]: Carried<S>[K] extends { readonly kind: "id" } ? K : never
}[keyof Carried<S>];


/**
 * Resolves the shape of the resources a multi-valued property collects.
 *
 * @param shape The shape declaring or inheriting the property, possibly deferred to break definition cycles
 * @param field The name of the property
 *
 * @returns The resource shape the property ranges over, or the one its references point at; the shape declaring the
 *     property takes precedence over the ones it extends, and among these the first one listed
 *
 * @throws {@link !TypeError TypeError} If the property collects anything other than resources
 */
export function collected<S extends Lazy<ResourceShape>, F extends Repeated<S>>(shape: S, field: F): Collected<S, F> {

	const member = carried(shape, field);
	const range = member?.kind === "property" ? member.range.shape : undefined;
	const resolved = range === undefined ? undefined : eager(range);

	return (resolved?.kind === "reference" ? resolved.target
			: resolved?.kind === "resource" ? range
				: error(new TypeError(`unexpected non-resource items for property <${field}>`))
	) as Collected<S, F>; // ;(cast) Collected<S, F> restates at the type level the resolution computed here


	/**
	 * Resolves a member a shape declares or inherits, the shape declaring it taking precedence over the ones it
	 * extends, and among these the first one listed.
	 */
	function carried(shape: Lazy<ResourceShape>, field: string): Optional<Member> {

		const { members, parents } = eager(shape);

		return members[field] ?? parents.reduce<Optional<Member>>(
			(found, parent) => found ?? carried(parent, field), undefined
		);

	}

}
