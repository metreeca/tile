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
 * Hint.
 *
 * Offers the placeholder an area shows while it has no content of its own, whether still loading, left empty or
 * unable to fetch what it was to show, filling the space the content would take.
 *
 * @module
 */

import { type ComponentChildren, createElement } from "preact";
import "./hint.css";


/**
 * Creates a hint.
 *
 * Fills the space it is handed and centres what it carries there, so a table, a list or a media frame with nothing to
 * show holds its place instead of collapsing. A glyph leading the content is drawn large, as the mark of the whole
 * area, with the wording beneath it.
 *
 * @param options The widget configuration
 *
 * @returns The hint
 */
export function Hint({

	border,

	children

}: {

	/**
	 * Whether the area is outlined and recessed, so that it reads as room left open for the missing content; left
	 * flush with the page if omitted.
	 */
	border?: boolean


	/**
	 * The content centred in the area: a leading glyph, drawn as the mark of the area, and the wording saying why the
	 * content is missing.
	 */
	children?: ComponentChildren

}) {

	return createElement("tile-hint", { border }, children);

}
