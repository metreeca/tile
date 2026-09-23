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
 * Logo samples.
 *
 * @module
 */

import { Logo } from "@metreeca/tile-cell/logo";
import { app } from "@metreeca/tile-data";
import { Style } from "@metreeca/tile-hive/style";
import "./index.css";


/**
 * Creates the logos section.
 *
 * Shows the lockup an app is recognised by, set at the size of the line around it.
 *
 * @returns The logos section
 */
export function Logos() {
	return <>

		<p>A logo takes the app mark from what the document already states and sets it in a row with whatever names the
			app beside it, so a screen places the lockup rather than a mark and a name it has to keep together. The mark
			stands exactly as tall as the capitals around it and sits on their baseline, so it takes the size of the
			line it is set in rather than carrying a measure of its own.</p>

		<div class="controls">
			<Logo>{app.name}</Logo>
			<Logo name={app.name}/>
			<Style css={{ fontSize: "fontSizeLarge" }}><Logo>{app.name}</Logo></Style>
			<Style css={{ fontSize: "fontSizeSmall" }}><Logo>{app.name}</Logo></Style>
		</div>

		<p>A logo standing beside the app name leaves the mark decorative, read once through the name; one standing on
			the mark alone states what it stands for, as the second above does. A document stating no icon leaves the
			row holding only what it was given.</p>

	</>;
}
