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

import { ComponentChildren, render } from "preact";
import "../code/fonts/roboto.css";
import "../code/index.css";
import { active, hash, Router, useRouter } from "../code/nests/router";
import { ToolPage } from "../code/tiles/page";
import { ToolPane } from "../code/tiles/pane";
import "./index.css";


const store=hash();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function link(route: string) {
	return store(route);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function DemoPage({

	children

}: {

	children?: ComponentChildren

}) {
	return <ToolPage

		pane={<ToolPane header={"Metreeca/Tile Demo"}>

			<a {...active(link("/"))}>home</a>
			<a {...active(link("/lucide/*"))}>lucide</a>

		</ToolPane>}

	>{

		children

	}</ToolPage>;
}

render(<Router store={store} routes={{

	"/": () => {

		const { push }=useRouter();

		return <DemoPage>
			<button onClick={() => push("/lucide")}>x</button>
		</DemoPage>;
	},

	"/lucide": () => <DemoPage>
		<input autofocus style={{ border: "solid 1px #CCC" }}

			onInput={e => console.log(e.type)}
			onChange={e => console.log(e.type)}

		/>
	</DemoPage>

}}/>, document.body);