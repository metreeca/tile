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
 * Property panel samples.
 *
 * @module
 */

import { Frame } from "@metreeca/specimen/tile-hive/sample.js";
import { Info } from "@metreeca/tile-hive/info";
import { type ComponentChildren } from "preact";
import "./index.css";


/**
 * Creates the property panel section.
 *
 * Shows the same properties laid out for the body of a page and for a sidebar, with the rule that sets consecutive
 * panels apart and the entries a panel leaves out for want of a value, so the two layouts compare side by side.
 *
 * @returns The property panel section
 */
export function Infos() {
	return <>

		<p>A panel lists the properties of a resource, each value beside the label naming it. In the body of a page the
			labels and the values meet in the middle; in a sidebar they are spread from edge to edge. A property with no
			value is left out, and consecutive panels are set apart by a rule.</p>

		<div class="columns">

			<Frame label="center">
				<Panels place="center"/>
			</Frame>

			<Frame label="spread">
				<Panels place="spread"/>
			</Frame>

		</div>

	</>;
}


function Panels({ place }: {

	place: "center" | "spread"

}) {
	return <>

		<Info place={place}>{{
			title: "Annual report",
			author: "Jane Doe",
			editor: undefined,
			published: "2026-03-15"
		}}</Info>

		<Info place={place}>{[
			{
				label: "Keywords", value: <Items labels={place === "center"
					? ["Finance", "Governance", "Sustainability"]
					: ["finance", "governance", "sustainability"]
				}/>
			},
			{ label: "Status", value: "Published" }
		]}</Info>

	</>;
}

function Items({ labels }: {

	labels: ReadonlyArray<ComponentChildren>

}) {
	return <ul>{labels.map((label, index) => <li key={index}>{label}</li>)}</ul>;
}
