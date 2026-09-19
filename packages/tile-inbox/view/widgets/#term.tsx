/*
 * Copyright © 2020-2025 Metreeca srl
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

import { id, isFocus, Simple, string } from "@metreeca/mesh/index_";
import { TileFlag } from "@metreeca/tile/widgets/flag";
import { AtSign, ChevronRight, File } from "@metreeca/tile/widgets/icon";
import { isBoolean } from "mesh";
import * as React from "react";
import { createElement } from "react";
import "./#term.css";


export function TileTerm({

	children,

	disabled,
	compact

}: {

	children: Simple,

	disabled?: boolean,
	compact?: boolean,

}) {

	const label=string(children);

	return createElement("tile-term", {

		class: disabled ? "disabled" : undefined

	}, <>{

		isBoolean(children) ? <TileFlag>{children}</TileFlag>

			: isFocus(children) ? <a title={label} href={id(children)}>{compact ? <ChevronRight/> : label}</a>

				: label.match(/^[-.\\w]+@[-.\\w]+$/) ?
					<a title={label} href={`mailto:${label}`}>{compact ? <AtSign/> : label}</a>

					: <span title={label}>{compact ? <File/> : label}</span>

	}</>);
}

