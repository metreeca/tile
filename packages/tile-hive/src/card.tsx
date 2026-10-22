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
 * Resource summary card.
 *
 * Sums up a resource in a single block: its title and tags over a description, beside an image standing for it. A
 * list of search results or related resources then reads as a run of cards without a layout written for each entry.
 *
 * @module
 */

import { isBoolean, isString } from "@metreeca/core";
import { type ComponentChildren, createElement } from "preact";
import "./card.css";


/**
 * Creates a resource summary card.
 *
 * Sets the title over the description in a main column, and the tags over the image in a side column at the start or
 * at the end of the card, its width retuned through the `--tile-card-start-width` and `--tile-card-end-width` knobs.
 * At the end, a description with no image beneath the side column runs on under the tags. Consecutive cards are set a
 * spacing step apart, so a run of them reads as a list of entries rather than as one block of text.
 *
 * Empty parts are left out, and a card left with none renders nothing, so a screen hands over whatever it knows about
 * a resource without first checking what is missing. A part is empty when it is `undefined`, `null`, an empty string
 * or a boolean, as left by a conditional such as `label && <Link/>`; any other part is shown, `0` included.
 *
 * @param options The widget configuration
 *
 * @returns The card, or `null` if every part is empty
 */
export function Card({

	side = "start",

	title,
	tags,
	image,

	children

}: {

	/**
	 * The edge of the card the side column holding the tags and the image keeps to: the `start`, the default, as fits a
	 * narrow mark leading into the entry such as an acronym, or the `end`, as fits a picture trailing a search result.
	 */
	side?: "start" | "end"


	/**
	 * The title naming the resource, at the top of the main column.
	 */
	title?: ComponentChildren

	/**
	 * The tags classifying the resource, at the top of the side column across from the title.
	 */
	tags?: ComponentChildren

	/**
	 * The image standing for the resource, under the tags in the side column. A string is taken as the URL of a
	 * decorative picture, left out of the accessibility tree and of the layout if it fails to load; anything else, such
	 * as an icon or initials, is shown as given, in the label colour the card sets for the tags above it.
	 */
	image?: ComponentChildren


	/**
	 * The description of the resource, under the title in the main column.
	 */
	children?: ComponentChildren

}) {

	function shown(part: ComponentChildren): boolean {
		return part !== undefined && part !== null && part !== "" && !isBoolean(part);
	}

	return [title, tags, image, children].some(shown) ? createElement("tile-card", {

		side

	}, <>

		{shown(title) && <span>{title}</span>}
		{shown(tags) && <span class="tags">{tags}</span>}

		{shown(children) && <div>{children}</div>}

		{shown(image) && <i>{isString(image) ? <img alt="" src={image}/> : image}</i>}

	</>) : null;

}
