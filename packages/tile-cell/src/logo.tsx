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
 * Offers the mark an app is recognised by, taken from what its own document states, and the row it stands in with
 * whatever names the app beside it, so a screen carries the app identity without being handed it.
 *
 * @module
 */

import { isString } from "@metreeca/core";
import { app } from "@metreeca/tile-data";
import { type ComponentChildren, createElement, type TargetedMouseEvent } from "preact";
import "./logo.css";


/**
 * Creates a logo.
 *
 * Shows the app icon as a square measured against the capitals beside it and sitting on their baseline, so a heading,
 * a toolbar or a footer carries the mark without a measure of its own and the mark reads as part of the line rather
 * than as something dropped into it. The mark is fitted to that square whatever its proportions, so a wide or a tall
 * one is shown whole rather than cropped.
 *
 * Whatever stands for the app beside the mark, its name above all, is handed over as the children and set in a row
 * with it, so the two travel as one thing: a screen places the lockup rather than placing a mark and a name and
 * keeping them together itself. The wording is set in the heading face whatever the line around it is written in, so
 * the lockup reads as a mark rather than as running text, and an app changing that face carries it along. A document
 * stating no icon leaves the row holding only what it was given, so a screen assembled around the mark closes up
 * rather than holding a gap for it, and a logo with neither mark nor anything beside it leaves nothing behind at all.
 *
 * Given an `onClick` route, the lockup becomes a native link followed in place by the enclosing
 * {@link @metreeca/tile-data!router.Router Router}; given a handler, a native button. Either way it takes the tab stop,
 * the activation keys, the pointer cursor, the hover colour and the focus ring every control carries, while keeping
 * the ink and the setting it has at rest.
 *
 * The mark is left out of the accessibility tree unless `name` states what it stands for, so a logo standing beside
 * the app name is read once. It survives a forced colour scheme and a printed page, where a background image would be
 * dropped.
 *
 * @param options The widget configuration
 *
 * @returns The logo, or nothing where the document states no icon and nothing was given to stand beside it
 */
export function Logo({

	name,

	onClick,

	children

}: {

	/**
	 * The accessible name of the mark, required where the logo stands alone and nothing beside it names the app;
	 * decorative if omitted or empty, as it is wherever the app name is already on show beside it.
	 */
	name?: string

	/**
	 * What activating the logo does: the route it leads to, as the home page a click on the lockup returns to, or the
	 * handler the activation is handed to, whether it comes from a pointer, from `Enter` or from `Space`; a logo that
	 * does nothing if omitted.
	 *
	 * The lockup is then shown as a link or a button named by the mark and the wording together, so `name` or the
	 * children have to say what the app is, as they already have to wherever the logo stands alone.
	 */
	onClick?: string | ((event: TargetedMouseEvent<HTMLButtonElement>) => void)

	/**
	 * What stands beside the mark in the row, such as the app name and the release on show; the mark alone if
	 * omitted.
	 */
	children?: ComponentChildren

}) {

	const mark = app.icon === undefined ? undefined : <img alt={name ?? ""} src={app.icon}/>;

	return mark === undefined && !children ? undefined : createElement("tile-logo", {}, onClick === undefined
		? <>{mark}{children}</>
		: isString(onClick)
			? <a href={onClick}>{mark}{children}</a>
			: <button type="button" onClick={onClick}>{mark}{children}</button>
	);

}
