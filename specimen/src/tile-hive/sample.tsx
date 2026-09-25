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
 * Presents a layout as the items it arranges and the frame it arranges them in, so what the layout decides is read off
 * the position the items take rather than off the code.
 *
 * @module
 */

import { Box } from "@metreeca/tile-hive/box";
import { type ComponentChildren } from "preact";
import "./index.css";


/**
 * Creates a set of items.
 *
 * Draws each label as a raised card, so the items read apart from one another and from the frame around them whatever
 * the colour scheme.
 *
 * @param options The widget configuration
 *
 * @returns The items, in the order given
 */
export function Items({ labels }: {

	/**
	 * The label of each item, one card per label.
	 */
	labels: ReadonlyArray<string>

}) {
	return <>{labels.map(label =>

		<Box key={label} css={{
			backgroundColor: "backgroundColorRaised",
			boxShadow: "boxShadowRaised",
			borderRadius: "borderRadius025",
			padding: "spacing050"
		}}>{label}</Box>
	)}</>;
}

/**
 * Creates a framed sample.
 *
 * Sets a layout in a dashed frame, as large as what it holds or as the layout around it stretches it to, and names
 * what the sample shows beneath it.
 *
 * @param options The widget configuration
 *
 * @returns The framed sample
 */
export function Frame({ label, children }: {

	/**
	 * What the sample shows.
	 */
	label: ComponentChildren

	/**
	 * The layout the frame holds.
	 */
	children: ComponentChildren

}) {
	return <figure class="frame">
		<div>{children}</div>
		<figcaption>{label}</figcaption>
	</figure>;
}
