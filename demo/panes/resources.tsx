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

import { copy, useRouter } from "../../code/nests/router";
import { ToolPane } from "../../code/tiles/pane";

export function ToolResources() {

	const { active }=useRouter();

	return <ToolPane

		header={<a href={"/"}>Metreeca/Tile</a>}
		footer={<small>{copy}</small>}

	>

		<a {...active("/loaders")}>Loaders</a>

		<a {...active("/uno/*")}>uno</a>
		<a {...active("/due/*")}>due</a>
		<a {...active("/tre/*")}>tre</a>

	</ToolPane>;
}