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

import { render } from "preact";
import "../code/fonts/roboto.css";
import "../code/index.css";
import { Router } from "../code/nests/router";
import { X } from "../code/tiles/icon";
import { TilePage } from "../code/tiles/page";
import "./index.css";

render(<TilePage side={<>

	<a href={"/lucide"}>lucide</a>

</>}>

	<Router routes={{

		"/": () => <div>!</div>,
		"/due": () => <div><X/></div>,

		"/lucide": () => <input autofocus style={{ border: "solid 1px #CCC" }}

			onInput={e => console.log(e.type)}
			onChange={e => console.log(e.type)}

		/>

	}}/>

</TilePage>, document.body);