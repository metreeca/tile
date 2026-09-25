/*
 * Copyright © 2025-2026 Metreeca srl
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
 * Layout samples.
 *
 * @module
 */

import { type Tokens } from "@metreeca/tile";
import { Button } from "@metreeca/tile-cell/button";
import { Icon } from "@metreeca/tile-cell/icon";
import { Link } from "@metreeca/tile-cell/link";
import { Box } from "@metreeca/tile-hive/box";
import { Stack } from "@metreeca/tile-hive/stack";
import { Strip } from "@metreeca/tile-hive/strip";
import "./index.css";


const here = "/tile-hive/layout";

const raised: Tokens = {
	backgroundColor: "backgroundColorRaised",
	boxShadow: "boxShadowRaised",
	borderRadius: "borderRadius050",
	padding: "spacing100"
};

const seasons: ReadonlyArray<readonly [string, string]> = [
	[ "Spring", "Days lengthen, and the first leaves open." ],
	[ "Summer", "The longest days, and the warmest." ],
	[ "Autumn", "Days shorten, and the leaves turn." ],
	[ "Winter", "The shortest days, and the coldest." ]
];


/**
 * Creates the layout section.
 *
 * Shows a screen assembled from boxes, stacks and strips alone, with no layout rule written for it: a bar setting its
 * title apart from its actions, a sidebar keeping its settings at the bottom, and a wrapping row of cards.
 *
 * @returns The layout section
 */
export function Layouts() {
	return <>

		<p>Boxes, stacks and strips compose into a whole screen with no layout rule written for it. The bar is a raised
			box holding a strip that sets the title apart from the actions (<code>place="head"</code>). Below it, a
			strip stretching its items sets a sidebar beside the content: the sidebar is a box as tall as the content it
			stands beside, and the stack it holds fills it, keeping its settings at the
			bottom (<code>place="tail"</code>). The content is a wrapping strip of cards, each a box stretched to the tallest
			in its row, holding a stack that keeps its action at the bottom, pushed to the end by a strip of its
			own (<code>place="end"</code>).</p>

		<Box css={{ backgroundColor: "backgroundColorSunken", borderRadius: "borderRadius050", padding: "spacing100" }}>
			<Stack space="spacing100">

				<Box css={raised}>
					<Strip place="head" align="center" space="spacing050">
						<strong>Seasons</strong>
						<Button icon={<Icon.Create/>} label="New"/>
						<Button look="strong" mode="commit" icon={<Icon.Save/>} label="Save"/>
					</Strip>
				</Box>

				<Strip align="stretch" space="spacing150">

					<Box css={raised}>
						<Stack place="tail" space="spacing050">
							<Link look="subtle" href={here}>Overview</Link>
							<Link look="subtle" href={here}>Calendar</Link>
							<Link look="subtle" href={here}>Archive</Link>
							<Link look="subtle" href={here}>Settings</Link>
						</Stack>
					</Box>

					<Strip grow wrap align="stretch" space="spacing100">{seasons.map(([ season, text ]) =>

						<Box key={season} css={raised}>
							<Stack place="tail" space="spacing050">
								<strong>{season}</strong>
								<span>{text}</span>
								<Strip place="end"><Button icon={<Icon.Update/>} label="Edit"/></Strip>
							</Stack>
						</Box>
					)}</Strip>

				</Strip>

			</Stack>
		</Box>

	</>;
}
