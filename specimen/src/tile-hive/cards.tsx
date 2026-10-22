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
 * Resource summary card samples.
 *
 * @module
 */

import { Frame } from "@metreeca/specimen/tile-hive/sample.js";
import { Card } from "@metreeca/tile-hive/card";
import { Stack } from "@metreeca/tile-hive/stack";
import "./index.css";


type Options = Parameters<typeof Card>[0]


const sides: ReadonlyArray<NonNullable<Options["side"]>> = [ "start", "end" ];


/**
 * Creates the resource summary card section.
 *
 * Shows the same entries with the side column at the start and at the end of each card, including one with no image
 * whose description runs on under the tags at the end, so the two layouts compare one above the other.
 *
 * @returns The resource summary card section
 */
export function Cards() {
	return <>

		<p>A card sums up a resource: its title over a description, beside its tags over an image standing for it. The side
			column keeps to the start or to the end of the card; at the end, a description with no image beneath the side
			column runs on under the tags.</p>

		<div class="frames">
			<Stack space="spacing100">{sides.map(side =>

				<Frame key={side} label={<code>side="{side}"</code>}>
					<Entries side={side}/>
				</Frame>
			)}</Stack>
		</div>

	</>;
}


function Entries({ side }: {

	side: "start" | "end"

}) {
	return <>

		<Card side={side} title="Annual report" tags="Report" image={<>AR</>}>
			Financial statements and governance review for the fiscal year ending in March.
		</Card>

		<Card side={side} title="Sustainability plan" tags="Plan">
			Targets and milestones for reducing emissions across the operations of the group.
		</Card>

	</>;
}
