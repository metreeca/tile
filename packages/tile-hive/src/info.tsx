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
 * Property panel.
 *
 * Lists the properties of a resource, each value beside the label naming it. A sidebar or the body of a page then
 * shows what is known about a resource without a table laid out for the purpose.
 *
 * @module
 */

import { isBoolean } from "@metreeca/core";
import { type ComponentChildren, createElement, Fragment } from "preact";
import "./info.css";


/**
 * Creates a property panel.
 *
 * Lists properties as label and value pairs, read by assistive technology as the terms and definitions of a single
 * list. Properties with an empty value are left out, and a panel left with none renders nothing, so a screen hands
 * over whatever it knows about a resource without first checking what is missing. A value is empty when it is
 * `undefined`, `null` or an empty string; any other value is shown, `0` included, and a boolean reads as its name.
 *
 * Consecutive panels are set apart by a rule, so a screen groups related properties by giving each group a panel.
 *
 * @param options The widget configuration
 *
 * @returns The panel, or `null` if no property carries a value
 */
export function Info({

	place = "center",

	children

}: {

	/**
	 * Where labels and values sit across the panel. In the `center`, the default, they meet in the middle, as fits the
	 * body of a page; with `spread`, labels keep to the left edge and values to the right one, as fits a sidebar.
	 */
	place?: "center" | "spread"


	/**
	 * The properties to show, either as values keyed by their labels, or as an array of entries where labels are not
	 * plain strings or have to be shown in a given order; nothing is rendered if omitted.
	 */
	children?:
		| { readonly [label: string]: ComponentChildren }
		| readonly { readonly label: ComponentChildren, readonly value: ComponentChildren }[]

}) {

	const pairs = Array.isArray(children)
		? children
		: Object.entries(children ?? {}).map(([label, value]) => ({ label, value }));

	const entries = pairs.filter(({ value }) =>
		value !== undefined && value !== null && value !== ""
	);

	return entries.length > 0 ? createElement("tile-info", {

		place

	}, <dl>{entries.map(({ label, value }, index) =>
		<Fragment key={index}>

			<dt>{label}</dt>
			<dd>{isBoolean(value) ? String(value) : value}</dd>

		</Fragment>
	)}</dl>) : null;

}
