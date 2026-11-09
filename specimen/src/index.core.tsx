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
 * Specimen frame.
 *
 * Lays every package page out as one long scrolling sheet inside the frame an app lays its own screens out in: a bar
 * carrying the packages and the page settings, an outline of the sections following the reader, and the sections
 * themselves, each opened by its heading group, so the frame is shown by being used rather than described.
 *
 * @module
 */

import { app } from "@metreeca/clay";
import { isContent } from "@metreeca/clay-widgets";
import { Button } from "@metreeca/clay-widgets/button";
import { Choice } from "@metreeca/clay-widgets/choice";
import { Icon } from "@metreeca/clay-widgets/icon";
import { Link } from "@metreeca/clay-widgets/link";
import { Strip } from "@metreeca/clay-widgets/strip";
import { TOC, type TOCEntry } from "@metreeca/clay-widgets/toc";
import { Tool } from "@metreeca/clay-widgets/tool";
import { useRouter } from "@metreeca/clay/router";
import { useStorage } from "@metreeca/clay/storage";
import { type ComponentChildren, createElement, Fragment } from "preact";
import { useEffect } from "preact/hooks";


export const Root = "/";

export const TileWidgetsPath = "/tile-widgets/";


/**
 * A section of a package page: the id it is linked to by, the group of the outline it is listed under, what it is
 * called, the shorter name the outline lists it by if its title is too long for the rail, what it is about and the
 * samples it shows to the reader as live widgets rather than as pictures or descriptions of them.
 *
 * A sample filling the window, such as a shell, stands on a screen of its own instead: it names the location of that
 * screen, which the outline opens in a new tab, and takes no section on the page.
 */
export type Sample = {

	readonly id: string
	readonly group: string
	readonly title: string
	readonly label?: string

} & ({

	readonly lead?: ComponentChildren
	readonly view: ComponentChildren

} | {

	readonly href: string

})


export const schemes = {
	auto: <Icon.Monitor aria-label="System"><title>System Theme</title></Icon.Monitor>,
	light: <Icon.Sun aria-label="Light"><title>Light Theme</title></Icon.Sun>,
	dark: <Icon.Moon aria-label="Dark"><title>Dark Theme</title></Icon.Moon>
};

type Scheme = keyof typeof schemes


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a package page.
 *
 * Opens the page with what the package is, lists every section in the outline of the tray under the group it belongs
 * to, and sets the sections one after the other, each opened by its heading group.
 *
 * @param options The page configuration
 *
 * @returns The package page, inside the specimen frame
 */
export function Page({

	eyebrow,
	title,
	lead,
	samples

}: {

	eyebrow: string
	title: string
	lead: ComponentChildren
	samples: readonly Sample[]

}) {

	const router = useRouter();

	const [scheme, setScheme] = useScheme();

	return <Tool

		meta={<Button
			icon={<span class="brand">@metreeca/<strong>tile</strong></span>}
			look="subtle"
			name="@metreeca/tile"
			onClick={() => router(Root)}
		/>}

		head={<nav class="packages" aria-label="Packages">
			<Link active look="subtle" href={`${TileWidgetsPath}*`}>Widgets</Link>
		</nav>}

		menu={<Strip align="center" space="spacing100">

			<small>v{VERSION}</small>

			<Choice name="Colour scheme" look="subtle" options={schemes} value={scheme} onChange={setScheme}/>

		</Strip>}

		tray={<TOC name="Sections" compact entries={outline(samples)}/>}

		copy={<small>{app.copy}</small>}

	>

		<Intro eyebrow={eyebrow} title={title} lead={lead}/>

		{samples.map(sample => "view" in sample && <Fragment key={sample.id}>
			<Intro id={sample.id} level={2} eyebrow={sample.group} title={sample.title} lead={sample.lead}/>
			{sample.view}
		</Fragment>)}

	</Tool>;

}


/**
 * Adopts the colour scheme the reader chose, remembered across pages and tabs, pinning it on the root of the document.
 *
 * @returns The scheme in force and the way to choose another
 */
export function useScheme() {

	const state = useStorage<Scheme>(localStorage, "specimen-scheme", "auto");

	// the scheme is pinned on the root of the document, which no render of a page owns

	useEffect(() => apply(state[0]), [state[0]]);

	return state;

}


/**
 * Opens a page or one of its samples with the heading group of the design system: the part of the page it belongs to,
 * the title ranked at `level`, and what it is about; the id given is the target its outline entry links to.
 */
function Intro({

	id,

	level = 1,

	eyebrow,
	title,
	lead

}: {

	id?: string

	level?: 1 | 2

	eyebrow: ComponentChildren
	title: ComponentChildren
	lead?: ComponentChildren

}) {

	return <hgroup id={id}>
		<p>{eyebrow}</p>
		{createElement(`h${level}`, {}, title)}
		{isContent(lead) && <p>{lead}</p>}
	</hgroup>;

}

/**
 * Groups the sections of a page into the outline listing them, in the order the page holds them.
 */
function outline(samples: readonly Sample[]): readonly TOCEntry[] {

	const groups = [...new Set(samples.map(({ group }) => group))];

	return groups.map(group => ({
		label: group,
		entries: samples
			.filter(sample => sample.group === group)
			.map(sample => "href" in sample
				? { label: sample.label ?? sample.title, href: sample.href, target: "_blank" }
				: { label: sample.label ?? sample.title, href: `#${sample.id}` }
			)
	}));

}

/**
 * Pins the colour scheme chosen on the root of the page, or leaves it to the platform.
 */
function apply(scheme: Scheme): void {

	if ( scheme === "auto" ) {
		document.documentElement.removeAttribute("data-scheme");
	} else {
		document.documentElement.setAttribute("data-scheme", scheme);
	}

}
