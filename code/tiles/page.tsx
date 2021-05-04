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
import { label } from "../graphs";
import "./page.css";

const title=document.title;
const icon=(document.querySelector("link[rel=icon]") as HTMLLinkElement).href; // !!! handle nulls
const copy=(document.querySelector("meta[name=copyright]") as HTMLMetaElement).content; // !!! handle nulls


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface Props {

	home?: ComponentChildren
	side?: ComponentChildren

	name?: ComponentChildren
	menu?: ComponentChildren

	children?: ComponentChildren

}

export function TilePage({

	home=<a href={"/"}>{title}</a>,
	side,

	name=<a href={""}>{label("")}</a>,
	menu,

	children

}: Props) {

	return createElement("tile-page", {}, <>

		<aside>

			<header>{home}</header>
			<section>{side}</section>

		</aside>

		<main>

			<header>
				<h1>{name}</h1>
				<nav>{menu}</nav>
			</header>

			<section>{children}</section>

		</main>

	</>);
}

