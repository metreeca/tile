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
 * Table of contents.
 *
 * Offers the outline of a document as links into its sections, so a reader sees how the document is organised at a
 * glance and reaches any section of it in one step, wherever on the page the outline is shown.
 *
 * @module
 */

import { type ComponentChildren, createElement } from "preact";
import "./toc.css";


/**
 * Table of contents entry.
 *
 * Describes a document section by the label it is listed under, the location it is reached at, and the sections it
 * holds in turn, each described by an entry of its own down to the deepest level the outline lists.
 */
export interface Entry {

	/**
	 * The label the section is listed under, typically the text of its heading.
	 */
	readonly label: ComponentChildren

	/**
	 * The location of the section, typically a fragment such as `#usage` naming the id of its heading.
	 */
	readonly href: string

	/**
	 * The sections the section holds, in document order; none if omitted.
	 */
	readonly entries?: readonly Entry[]

}


/**
 * Creates a table of contents.
 *
 * Lists the sections of a document in document order, each a link to the section, holding the list of the sections
 * it introduces. Top-level sections are set strong, their subsections smaller and indented beneath them, and deeper
 * levels are left out, so the outline reads as quiet navigation beside the document rather than as a second document.
 *
 * The outline is a navigation landmark holding nested lists, so a reader learns how many sections the document holds
 * and how deep each one runs whether or not they see it. An outline with no entries renders nothing.
 *
 * @param options The widget configuration
 *
 * @returns The table of contents
 */
export function Toc({

	name,

	entries

}: {

	/**
	 * The accessible name of the outline, such as `Contents`, setting it apart from other navigation landmarks on the
	 * page; unnamed if omitted, as befits a page holding no other navigation landmark.
	 */
	name?: string


	/**
	 * The top-level sections of the document, in document order.
	 */
	entries: readonly Entry[]

}): ComponentChildren {

	return entries.length > 0 ? createElement("tile-toc", {}, <nav aria-label={name}>{list(entries)}</nav>) : null;

}


function list(entries: readonly Entry[]) {
	return <ul>{entries.map(({ label, href, entries: nested = [] }, index) => <li key={index}>
		<a href={href}>{label}</a>
		{nested.length > 0 && list(nested)}
	</li>)}</ul>;
}
