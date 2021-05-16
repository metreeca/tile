/*
 * Copyright © 2020-2021 Metreeca srl
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

import { ComponentChildren, createElement } from "preact";
import { useValue } from "../hooks/value";
import { icon } from "../nests/router";
import { MoreHorizontal } from "./icon";
import "./page.css";

let expansion: Tray;

const enum Tray { Show="show", Hide="hide", Flip="flip" }


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function ToolPage({

	logo,
	tabs,
	user,

	pane,

	item,
	menu,

	children

}: {

	logo?: string
	tabs?: ComponentChildren
	user?: ComponentChildren

	pane?: ComponentChildren

	item?: ComponentChildren
	menu?: ComponentChildren

	children?: ComponentChildren

}) {

	const [tray, setTray]=useValue(expansion);

	const image={ style: { backgroundImage: `url(${logo || icon})` } };

	return createElement("tool-page", {}, <>

		<aside class={tray === Tray.Flip ? undefined : tray} onClick={e =>
			(e.target === e.currentTarget || (e.target as Element).closest("a")) && setTray(expansion)
		}>

			<nav>

				<header>
					<button onClick={() => setTray(expansion=(tray === Tray.Hide) ? Tray.Flip : Tray.Hide)} {...image}/>
				</header>

				<section onClick={e => (e.target as Element).closest("button") && setTray(Tray.Show)}>
					{tabs}
				</section>

				<footer>{user}</footer>

			</nav>

			<div>{pane}</div>

		</aside>

		<main>

			<div>

				<header>

					<button onClick={() => setTray(Tray.Show)} {...image}/>

					<h1>{item}</h1>

					<nav>
						{menu}
						<button><MoreHorizontal/></button>
						{/* !!! handle on mobile view */}
					</nav>

				</header>

				<section>{children}</section>

			</div>

		</main>

	</>);
}

export function ToolPane({

	header,
	footer,

	children

}: {

	header?: ComponentChildren
	footer?: ComponentChildren

	children?: ComponentChildren

}) {
	return <>

		<header>{header}</header>

		<section>{children}</section>

		<footer>{footer}</footer>

	</>;
}