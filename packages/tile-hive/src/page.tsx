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

import { classes } from "@metreeca/tile-cell";
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
 * Waiting is stated by the page itself: while the {@link @metreeca/tile-data!fetch.Fetch shared client} has exchanges
 * in flight, the frame fades, marks itself busy for assistive technology, and shows a turning mark in the content
 * header in place of whatever navigation sits there. No call site takes part, so a screen states waiting by
 * performing its exchanges through that client and nothing else. Nothing is taken out of reach meanwhile: the
 * content is on its way out rather than unavailable, and a gesture that must not be repeated while an exchange runs
 * is held back by the control offering it.
 *
 * The two columns are landmarks a reader moves between directly. The content is named by the heading it is already
 * showing, whether that is `head` or the `done` standing in for it, so a reader arriving at it hears which screen
 * they are on. The tray carries no name of its own: what a reader wants named there is the sections or the filters
 * it holds, which say what they are far better than a word for the whole region would, so a screen names those as
 * it puts them in.
 *
 * `lock` takes the tray out of reach for every gesture at once, pointer and keyboard alike, so a reader is never
 * left tabbing into something the screen is showing as unavailable; whoever sets it owes the reader somewhere to
 * land if the focus was in the tray at the time.
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

	head,
	menu,

	tray,

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
	 * The control leaving the content of the moment, shown at the head of the content column in place of `head`,
	 * which is what marks the screen as one the reader is finished with rather than one they arrived at.
	 */
	done?: ComponentChildren

	/**
	 * The control returning to the step before, shown at the end of the content header; superseded by the turning
	 * mark while the shared client is busy.
	 */
	back?: ComponentChildren

	/**
	 * What the content of the moment is called, which for a screen describing a resource is that resource's own
	 * label. It heads the content column unless `done` stands there instead, and names the content landmark either
	 * way, so a reader arriving at it hears which screen they are on.
	 */
	head?: ComponentChildren

	/**
	 * The control opening what the screen keeps out of the way, shown at the end of the content header where `back`
	 * is left out; superseded by the turning mark while the shared client is busy.
	 */
	menu?: ComponentChildren

	/**
	 * The standing controls the tray holds, such as the sections of the app and the filters in force. The tray is a
	 * complementary landmark carrying no name of its own, so a group within it that a reader would want to reach
	 * directly, a navigation block above all, names itself as it is put in.
	 */
	tray?: ComponentChildren

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

	const lead = done ?? head;
	const tail = back ?? menu;

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

		<aside inert={lock}>

			<header>
				{logo && <span>{logo}</span>}
				{meta && <span>{meta}</span>}
			</header>

			<section>{tray}</section>
			<footer>{info}</footer>

		</aside>

		<main aria-labelledby={title}>

			{/*
			 * The mark stands over the navigation rather than in place of it: what it covers keeps its place and is
			 * merely put out of sight, so the bar is the same height waiting or not and nothing shifts underneath a
			 * reader. Being out of sight takes it out of the accessibility tree and out of reach with it, so nothing
			 * answers a gesture while it cannot be seen.
			 */}

			<header>
				{lead && <span id={title}>{lead}</span>}
				{tail && <span class={classes({ busy: fetching })}>{tail}</span>}
				{fetching && <Icon.LoaderCircle/>}
			</header>

			<section>{children}</section>
			<footer>{copy}</footer>

		</main>

	</>);

}
