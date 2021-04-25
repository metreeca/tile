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
import "../code/index.css";
import { Router } from "../code/nests/router";
import { ToolOptions } from "../code/tiles/options";
import { TilePage } from "../code/tiles/page";

render(<TilePage side={<>

	<ToolOptions label="Product Line" path={""} state={[{}, () => {}]}/>
	<ToolOptions label="Scale" path={""} state={[{}, () => {}]}/>

	<a href={"/uno"}>uno</a>
	<a href={"/due"}>due</a>

</>}>

	<Router routes={{

		"/": () => <div>!</div>,
		"/uno": () => <div>uno!</div>,
		"/due": () => <div>due!</div>

	}}/>

</TilePage>, document.body);