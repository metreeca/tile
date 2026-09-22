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

import { Button } from "@metreeca/tile-cell/button";
import { Icon } from "@metreeca/tile-cell/icon";
import { useFetching } from "@metreeca/tile-data/fetch";
import { type ComponentChildren, createElement } from "preact";
import { useId } from "preact/hooks";
import "./page.css";

/**
 * Creates a page.
 *
 * Lays a screen out as two scrolling columns, the tray and the content, each carrying a header that stays in view as
 * the column scrolls and a footer beneath what it holds; a screen with no use for the tray is laid out on the content
 * column alone. Every slot is optional and one left out takes no room, so a screen with no tray footer closes up
 * rather than holding a gap for it.
 *
 * Waiting is stated by the page itself: while the {@link @metreeca/tile-data!fetch.Fetch shared client} has exchanges
 * in flight, the frame fades, marks itself busy for assistive technology, and shows a turning mark at the end of the
 * content header, in place of whatever navigation sits there. Nothing else moves while it stands: a screen with no
 * content header is not given one for the duration, and a header that stands keeps the height it had. No call site
 * takes part, so a screen states waiting by performing its exchanges through that client and nothing else. Nothing is
 * taken out of reach meanwhile: the content is on its way out rather than unavailable, and a gesture that must not be
 * repeated while an exchange runs is held back by the control offering it.
 *
 * The columns are landmarks a reader moves between directly. The content is named by the heading it is already
 * showing, whether that is `head` or the `done` standing in for it, so a reader arriving at it hears which screen
 * they are on. The tray carries no name of its own: what a reader wants named there is the sections or the filters
 * it holds, which say what they are far better than a word for the whole region would, so a screen names those as
 * it puts them in.
 *
 * `lock` takes the tray out of reach for every gesture at once, pointer and keyboard alike, so a reader is never
 * left tabbing into something the screen is showing as unavailable; whoever sets it owes the reader somewhere to
 * land if the focus was in the tray at the time. `main` goes further and leaves the tray out of the frame altogether,
 * for a screen a reader is meant to see through rather than move around in.
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
	main = false,
	wide = false,

	logo,
	meta,
	tray,
	info,

	done,
	back,

	head,
	menu,
	foot,

	children

}: {

	/**
	 * Whether the tray is out of reach, as it is while the content has the reader's full attention: what it holds
	 * fades away while the surface it stands on keeps its place, it drops out of the tab order and the accessibility
	 * tree, and it answers no gesture until it is let back in; reachable if omitted.
	 */
	lock?: boolean

	/**
	 * Whether the content stands on its own, the tray being left out of the frame rather than merely put out of reach
	 * as `lock` leaves it: the column closes up, the content takes the room it held, and nothing handed to the tray
	 * slots is shown or left in the accessibility tree. Set it where a screen is meant to be seen through rather than
	 * moved around in, such as a sign-in or a splash; the tray stands if omitted.
	 */
	main?: boolean

	/**
	 * Whether the content is given the whole width beside the tray, rather than the reading measure it is otherwise
	 * capped at: set it where the content is a table, a chart or a map, which a window has no more room for than it
	 * has, and leave it where the content is prose, which a long line only makes harder to follow. Capped if
	 * omitted.
	 */
	wide?: boolean

	/**
	 * The mark the app is recognised by, standing at the head of the tray.
	 */
	logo?: ComponentChildren

	/**
	 * What stands opposite the mark at the head of the tray, such as the release on show or a standing control.
	 */
	meta?: ComponentChildren

	/**
	 * The standing controls the tray holds, such as the sections of the app and the filters in force. The tray
	 * carries no name of its own, so a group a reader would want to reach directly, a navigation block above all,
	 * names itself as it is put in.
	 */
	tray?: ComponentChildren

	/**
	 * What stands at the foot of the tray, such as the reader signed in and the way out.
	 */
	info?: ComponentChildren

	/**
	 * The way out of the content of the moment, standing at the head of the content column in place of `head` and
	 * naming the content landmark while it does: a screen offering it is one the reader finishes rather than one
	 * they simply arrived at.
	 */
	done?: ComponentChildren

	/**
	 * The control returning to the step before, standing at the end of the content header and taking the place `menu`
	 * would have had; it gives way to the turning mark while an exchange is in flight.
	 */
	back?: ComponentChildren

	/**
	 * What the content of the moment is called. It heads the content column unless `done` stands there instead, and
	 * names the content landmark either way, so a reader arriving at it hears which screen they are on.
	 */
	head?: ComponentChildren

	/**
	 * The control opening whatever the screen holds back, standing at the end of the content header where `back` is
	 * left out; it gives way to the turning mark while an exchange is in flight.
	 */
	menu?: ComponentChildren

	/**
	 * What stands at the foot of the content, such as the copyright and the terms.
	 */
	foot?: ComponentChildren

	/**
	 * The content of the moment, filling the body of the content column.
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
		main,
		wide

	}, <>

		{/* locking takes the tray out of reach for every gesture at once, rather than for the pointer alone */}

		{!main && <aside inert={lock}>

            <header>
				{logo && <span>{logo}</span>}
				{meta && <span>{meta}</span>}
            </header>

            <section>{tray}</section>
            <footer>{info}</footer>

        </aside>}

		<main aria-labelledby={title}>

			<header>
				{lead && <span id={title}>{lead}</span>}
				{tail && <span inert={fetching}>{tail}</span>}
			</header>

			{/*
			 * The mark stands in the row the header is laid in without standing in the header itself: a bar the
			 * screen gave nothing to show is left out, and waiting has no business bringing one back. It takes the
			 * navigation's place for as long as an exchange runs, the end of the bar being taken off show meanwhile,
			 * and the bar keeps the height its own content asks for either way.
			 *
			 * It is drawn as the control it stands in for, so it comes to rest exactly where the control it covers
			 * stood, with nothing measured off by hand. The whole of it is made inert: waiting is already stated by
			 * `aria-busy` on the frame, so a reader meets nothing here, the name the control type asks for never
			 * reaches anybody, and nothing answers a gesture.
			 */}

			{fetching && <span class="busy" inert>
				<Button icon={<Icon.RefreshCw/>} look="subtle" name="Waiting"/>
			</span>}

			<section>{children}</section>
			<footer>{foot}</footer>

		</main>

	</>);

}
