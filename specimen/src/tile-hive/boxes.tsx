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
 * Box samples.
 *
 * @module
 */

import { Box } from "@metreeca/tile-hive/box";
import { Stack } from "@metreeca/tile-hive/stack";
import "./index.css";


/**
 * Creates the box section.
 *
 * Shows what a box sets its content on: the padding, the rounding, the lift and the paint, each named as a design
 * system token, and how the shape stays with the box while the paint carries on inside it.
 *
 * @returns The box section
 */
export function Boxes() {
	return <>

		<p>A box sets what it holds on a box of its own, shaped and painted by the design system tokens it is given.
			The padding, the rounding and the shadow shape the box alone, while the text and background colours paint
			it and carry on to everything inside it.</p>

		<p>A card is a raised surface with the lift that goes with it, padded and rounded on the steps of the spacing
			and radius ladders:</p>

		<Box css={{
			backgroundColor: "backgroundColorRaised",
			boxShadow: "boxShadowRaised",
			borderRadius: "borderRadius050",
			padding: "spacing100"
		}}>
			<p>A card stays in the flow, lifted just enough to read apart from the page.</p>
		</Box>

		<p>A well goes the other way, sunk below the page and carrying no shadow:</p>

		<Box css={{
			backgroundColor: "backgroundColorSunken",
			borderRadius: "borderRadius050",
			padding: "spacing100"
		}}>
			<p>A well is where a thing is dropped into.</p>
		</Box>

		<p>The shape does not carry on: a box nested in another starts square, flat and unpadded, while the colour
			assigned to the outer one reaches the text inside both.</p>

		<Box css={{
			color: "colorStrong",
			backgroundColor: "backgroundColorSunken",
			borderRadius: "borderRadius050",
			padding: "spacing150"
		}}>

			<Stack space="spacing050">

				<p>The outer box is padded, rounded and painted in the accent.</p>

				<Box css={{ backgroundColor: "backgroundColorRaised" }}>
					<p>The inner box is painted a surface of its own, and keeps the accent.</p>
				</Box>

			</Stack>

		</Box>

	</>;
}
