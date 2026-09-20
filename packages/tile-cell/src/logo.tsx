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
 * Logo.
 *
 * Offers the mark an app is recognised by, taken from what its own document states, so a screen carries the app
 * identity without being handed it.
 *
 * @module
 */

import { app } from "@metreeca/tile";
import { createElement } from "preact";
import "./logo.css";


/**
 * Creates a logo.
 *
 * Shows the app icon at the size of the text it sits in, so a heading, a toolbar or a footer carries the mark without
 * a measure of its own. The mark is fitted to a square box whatever its proportions, so a wide or a tall one is shown
 * whole rather than cropped. A document stating no icon leaves nothing behind, so a screen assembled around the mark
 * closes up rather than holding a gap for it.
 *
 * The mark is left out of the accessibility tree unless `name` states what it stands for, so a logo standing beside
 * the app name is read once. It survives a forced colour scheme and a printed page, where a background image would be
 * dropped.
 *
 * @param options The widget configuration
 *
 * @returns The logo, or nothing where the document states no icon
 */
export function Logo({

	name

}: {

	/**
	 * The accessible name of the mark, required where the logo stands alone and nothing beside it names the app;
	 * decorative if omitted or empty, as it is wherever the app name is already on show beside it.
	 */
	name?: string

}) {

	return app.icon === undefined ? undefined : createElement("tile-logo", {}, <img

		alt={name ?? ""}
		src={app.icon}

	/>);

}
