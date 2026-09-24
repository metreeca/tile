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

import { isArray } from "../type/src/index.js";
import { classes } from "@metreeca/view";
import React, { createElement, ReactNode } from "react";

import "./info.css";


interface TileInfoEntry {
	label: ReactNode,
	value: ReactNode
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Resource info box.
 *
 * @param children
 * @constructor
 */
// !!! the Tile prefix is dropped on migration, but `Info` clashes with the lucide-preact icon: rename by role

export function TileInfo({

	center=false,

	children

}: {

	center?: boolean

	children: undefined | { [label: string]: ReactNode } | Array<{ label: ReactNode, value: ReactNode }>

}) {

	if ( children ) {

		const entries: TileInfoEntry[]=isArray<TileInfoEntry>(children)
			? children
			: Object.entries(children).map(([label, value]) => ({ label, value }));

		return createElement("tile-info", {

				class: classes({ center })

			}, entries

				.filter(({ value }) => value)

				.map(({ label, value }, index) => <React.Fragment key={index}>

					<dt>{label}</dt>
					<dd>{value}</dd>

				</React.Fragment>)
		);

	} else {

		return null;

	}

}
