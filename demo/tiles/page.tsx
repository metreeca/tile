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

import { ComponentChildren } from "preact";
import { Github } from "../../code/tiles/icon";
import { ToolPage } from "../../code/tiles/page";
import { ToolResources } from "../panes/resources";

export function DemoPage({

	item,
	menu,

	children

}: {

	item?: ComponentChildren
	menu?: ComponentChildren

	children?: ComponentChildren

}) {

	return <ToolPage item={item} menu={menu}

		pane={<ToolResources/>}

		user={<a href={"https://github.com/metreeca/tile"} target={"_blank"}><Github/></a>}

	>{

		children

	}</ToolPage>;

}