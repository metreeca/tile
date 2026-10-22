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
 * Path samples.
 *
 * @module
 */

import { Link } from "@metreeca/tile-cell/link";
import { Path } from "@metreeca/tile-cell/path";
import { Style } from "@metreeca/tile-hive/style";
import "./index.css";


/**
 * Creates the paths section.
 *
 * Shows the breadcrumb trail stating where a screen sits in the hierarchy, and how the trail fits a narrow row.
 *
 * @returns The paths section
 */
export function Paths() {
	return <>

		<p>A path lays the levels above the current page in a row, outermost first, each a link leading back to it,
			and ends on the page itself, announced as the current one. The separators are drawn rather than written,
			so they are never read out as steps.</p>

		<div class="paths">
			<Path name="Breadcrumb">
				<Link href="/">Specimen</Link>
				<Link href="/tile-cell/">Cell</Link>
				Paths
			</Path>
			<Style css={{ fontSize: "fontSizeLarge" }}>
				<Path name="Breadcrumb">
					<Link href="/">Specimen</Link>
					<Link href="/tile-cell/">Cell</Link>
					Paths
				</Path>
			</Style>
		</div>

		<p>A trail too long for its row keeps the levels above the page whole and clips the page name instead, which
			the heading of the screen states in full anyway.</p>

		<div class="paths narrow">
			<Path name="Breadcrumb">
				<Link href="/">Specimen</Link>
				<Link href="/tile-cell/">Cell</Link>
				A page name far too long to fit the row it is set in
			</Path>
		</div>

	</>;
}
