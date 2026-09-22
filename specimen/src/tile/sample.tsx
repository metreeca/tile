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
 * Token listings.
 *
 * Presents a family of design system tokens as a listing, so it is taken in as a set rather than one token at a time:
 * what each token is responsible for stands beside a sample drawn with it, while a family whose members run in an
 * order is shown as a band, and one whose members merely name things as a row of chips.
 *
 * A listing is stated over the design system contract, so a section names the tokens it shows and says how one is to
 * be drawn only where a colour swatch would not show it.
 *
 * @module
 */

import { css, type Property } from "@metreeca/tile";
import { type ComponentChild } from "preact";
import "./sample.css";


/**
 * The custom property of a token and what the token is responsible for.
 */
export type Entry = readonly [Property, string]

/**
 * The custom property of a scale step or a series slot and the position it stands for.
 */
export type Stop = readonly [Property, string]

/**
 * The custom properties a colour is drawn in and filled with, and what the two of them stand for.
 */
export type Pair = readonly [Property, Property, string]


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a token listing.
 *
 * Lists a family of tokens as a table, each row naming what a token is responsible for beside a sample drawn with it,
 * so a token is found by what it decides rather than by its name.
 *
 * @param options The widget configuration
 *
 * @returns The token listing
 */
export function Samples({ entries, sample = swatch }: {

	/**
	 * The tokens shown, in the order they are listed, each with what it is responsible for.
	 */
	readonly entries: ReadonlyArray<Entry>;

	/**
	 * How a token is drawn, where a colour swatch would not show it: a measure as a bar, a duration as a mark in
	 * motion, a threshold as a flag that fills. A roundel filled with the token if omitted, which is what a colour
	 * takes.
	 *
	 * @param property The custom property carrying the value of the token to be drawn
	 */
	readonly sample?: (property: Property) => ComponentChild;

}) {

	return <table class="samples">

		<tbody>{entries.map(([ property, note ]) => <tr key={property}>

			<td class="sample">{sample(property)}</td>
			<td><code>{property}</code></td>
			<td>{note}</td>

		</tr>)}</tbody>

	</table>;

}

/**
 * Creates a colour pair listing.
 *
 * Lists the colours that come as a pair, showing the mark one draws beside the notice the other fills, so the two are
 * read together as the one step they stand for rather than as two colours listed side by side.
 *
 * @param options The widget configuration
 *
 * @returns The colour pair listing
 */
export function Pairs({ pairs }: {

	/**
	 * The pairs shown, in the order they are listed, each with what the two of them stand for.
	 */
	readonly pairs: ReadonlyArray<Pair>;

}) {

	return <table class="samples">

		<tbody>{pairs.map(([ color, background, note ]) => <tr key={color}>

			<td class="sample">
				<span class="pair">
					{swatch(color)}
					<span class="card" style={{

						borderColor: css.var(color),
						backgroundColor: css.var(background)

					}}>Aa</span>
				</span>
			</td>

			<td><code>{color}</code><br/><code>{background}</code></td>
			<td>{note}</td>

		</tr>)}</tbody>

	</table>;

}

/**
 * Creates a palette listing.
 *
 * Shows a palette as the kind of thing it is, so a reader sees at once whether its colours run in an order or merely
 * tell things apart: a scale reads as one band split into its steps, a set of slots as chips standing on their own.
 *
 * @param options The widget configuration
 *
 * @returns The palette listing
 */
export function Ramp({ chips, stops }: {

	/**
	 * Whether the colours name things rather than running in an order, shown as separate chips; one band if omitted.
	 */
	readonly chips?: boolean;

	/**
	 * The steps or slots shown, in the order they stand, each with the position it stands for.
	 */
	readonly stops: ReadonlyArray<Stop>;

}) {

	return <ol class={chips ? "ramp chips" : "ramp"}>{stops.map(([ property, step ]) => <li key={property}>

		<span style={{ backgroundColor: css.var(property) }}/>
		<code>{step}</code>

	</li>)}</ol>;

}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Draws a colour as a roundel, which is what a token given no sample of its own takes.
 */
function swatch(property: Property) {
	return <span class="roundel" style={{ backgroundColor: css.var(property) }}/>;
}
