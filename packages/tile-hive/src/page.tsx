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
 * Page.
 *
 * Offers the frame a whole screen is laid out in: a tray of standing controls beside the content of the moment, each
 * with a header and a footer of its own, so an app states what goes in the slots rather than arranging them.
 *
 * @module
 */

import { Icon } from "@metreeca/tile-cell/icon";
import { useFetching } from "@metreeca/tile-data/fetch";
import { type ComponentChildren, createElement } from "preact";
import { useId } from "preact/hooks";
import "./page.css";

// !!! responsive layout

// !!! faults: the trace and the error boundary the legacy frame carried have no counterpart here yet, faults being
// !!! raised against the @metreeca/tile-data/faults context and shown by whoever the app puts in charge of showing them


/**
 * Creates a page.
 *
 * Lays a screen out as two scrolling columns, the tray and the content, each carrying a header that stays in view as
 * the column scrolls and a footer beneath what it holds. Every slot is optional and one left out takes no room, so a
 * screen with no tray footer closes up rather than holding a gap for it.
 *
 * Waiting is stated by the page itself: while the {@link @metreeca/tile-data/fetch!Fetch shared client} has exchanges
 * in flight, the frame fades, marks itself busy for assistive technology, and shows a turning mark in the content
 * header in place of whatever navigation sits there. No call site takes part, so a screen states waiting by
 * performing its exchanges through that client and nothing else. Nothing is taken out of reach meanwhile: the
 * content is on its way out rather than unavailable, and a gesture that must not be repeated while an exchange runs
 * is held back by the control offering it.
 *
 * The two columns are landmarks a reader moves between directly. The content is named by the heading it is already
 * showing, whether that is `name` or the `done` standing in for it, so a reader arriving at it hears which screen
 * they are on; the tray is named by `trayName`, which only the app can supply. `lock` takes the tray out of reach
 * for every gesture at once, pointer and keyboard alike, so a reader is never left tabbing into something the screen
 * is showing as unavailable; whoever sets it owes the reader somewhere to land if the focus was in the tray at the
 * time.
 *
 * The content is capped at a comfortable reading measure and centred in whatever room is left, so widening the
 * window leaves the lines as long as they were; `wide` lifts the cap for content a window never has too much room
 * for.
 *
 * @param options The widget configuration
 *
 * @returns The page
 */
export function Page({

	lock = false,
	wide = false,

	logo,
	meta,

	done,
	back,

	name,
	menu,

	tray,
	trayName,

	info,
	copy,

	children

}: {

	/**
	 * Whether the tray is out of reach, as it is while the content has the reader's full attention: it is blurred,
	 * drops out of the tab order and the accessibility tree, and answers no gesture until it is let back in;
	 * reachable if omitted.
	 */
	lock?: boolean

	/**
	 * Whether the content is given the whole width beside the tray, rather than the reading measure it is otherwise
	 * capped at: set it where the content is a table, a chart or a map, which a window has no more room for than it
	 * has, and leave it where the content is prose, which a long line only makes harder to follow. Capped if
	 * omitted.
	 */
	wide?: boolean

	/**
	 * The mark the app is recognised by, shown at the head of the tray.
	 */
	logo?: ComponentChildren

	/**
	 * What the app says about itself beside the mark, such as the name and the release on show.
	 */
	meta?: ComponentChildren

	/**
	 * The control leaving the content of the moment, shown at the head of the content column in place of `name`,
	 * which is what marks the screen as one the reader is finished with rather than one they arrived at.
	 */
	done?: ComponentChildren

	/**
	 * The control returning to the step before, shown at the end of the content header; superseded by the turning
	 * mark while the shared client is busy.
	 */
	back?: ComponentChildren

	/**
	 * What the content of the moment is called, shown at the head of its column unless `done` stands there instead.
	 */
	name?: ComponentChildren

	/**
	 * The control opening what the screen keeps out of the way, shown at the end of the content header where `back`
	 * is left out; superseded by the turning mark while the shared client is busy.
	 */
	menu?: ComponentChildren

	/**
	 * The standing controls the tray holds, such as the sections of the app and the filters in force.
	 */
	tray?: ComponentChildren

	/**
	 * What the tray is called, telling its landmark apart from the content beside it for a reader moving between
	 * them; unnamed if omitted, which leaves the tray announced by its kind alone. Wording the interface is written
	 * in, never ours, so a screen speaking to its readers in another language names it in theirs.
	 */
	trayName?: string

	/**
	 * What stands at the foot of the tray, such as the reader signed in and the way out.
	 */
	info?: ComponentChildren

	/**
	 * What stands at the foot of the content, such as the copyright and the terms.
	 */
	copy?: ComponentChildren

	/**
	 * The content of the moment, filling the column beside the tray.
	 */
	children?: ComponentChildren

}) {

	const id = useId();

	const fetching = useFetching();

	const lead = done ?? name;
	const trail = back ?? menu;

	// the content landmark is named by the heading already on show, so the reference and what it points at stand or
	// fall on the same condition and the reference is never left dangling

	const title = lead ? `${id}-title` : undefined;

	/*
	 * Waiting and reach are stated on the element rather than in a class list: a stylesheet has no way to tell a busy
	 * frame from an idle one, and `aria-busy` says it to assistive technology in the same breath, leaving the
	 * stylesheet to read the attribute the markup already owes.
	 */

	return createElement("tile-page", {

		"aria-busy": fetching,

		locked: lock,
		wide

	}, <>

		{/* locking takes the tray out of reach for every gesture at once, rather than for the pointer alone */}

		<aside

			aria-label={trayName}
			inert={lock}

		>

			<header>
				{logo && <span>{logo}</span>}
				{meta && <span>{meta}</span>}
			</header>

			<section>{tray}</section>
			<footer>{info}</footer>

		</aside>

		<main aria-labelledby={title}>

			{/* the mark stands where the navigation would, a reader asked to wait having nowhere to go meanwhile */}

			<header>
				{lead && <span id={title}>{lead}</span>}
				{fetching ? <Icon.LoaderCircle/> : trail && <span>{trail}</span>}
			</header>

			<section>{children}</section>
			<footer>{copy}</footer>

		</main>

	</>);

}
