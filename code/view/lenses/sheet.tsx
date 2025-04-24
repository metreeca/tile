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

import { isFunction, isObject } from "@metreeca/core";
import { isEntry } from "@metreeca/core/entry";
import { Frame, isFrame, Order, toFrameString } from "@metreeca/core/frame";
import { isString } from "@metreeca/core/string";
import { Collection } from "@metreeca/data/models/collection";
import { Selection } from "@metreeca/data/models/selection";
import { TileHint } from "@metreeca/view/widgets/hint";
import { TileMore } from "@metreeca/view/widgets/more";
import React, { createElement, Fragment, ReactNode, useState } from "react";
import "./sheet.css";


const LimitInit=25;
const LimitNext=25;


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function TileSheet<V extends Frame>({

	placeholder,

	sorted,

	as=toFrameString,

	children: [collection]

}: {

	placeholder?: ReactNode

	sorted?: string | Order | ((x: V, y: V) => number)

	as?: (item: V) => ReactNode

	selection?: Selection<V>
	children: Collection<V>

}) {

	const [offset, setOffset]=useState(0); // !!! sliding window
	const [limit, setLimit]=useState(LimitInit);

	const order=
		isString(sorted) ? { [sorted]: "increasing" }
			: isObject(sorted) ? sorted
				: isFrame(collection.model) ? { label: "increasing" }
					: {};

	const items=collection.items({

		...collection.model,
		...collection.query,

		...Object.entries(order).reduce((order, [expression, criterion]) => ({

			...order, ...Order(collection.model, expression, criterion)

		}), {}),

		"@": offset,
		"#": limit + 1

	});

	const [cache, setCache]=useState(items);


	const loading=items === cache;
	const pending=loading || items && items.length > limit;


	function load() {
		if ( !loading ) {
			setCache(items);
			setLimit(limit + LimitNext);
		}
	}


	return items?.length ? createElement("tile-sheet", {}, <>

			{(isFunction(sorted) ? [...items].sort(sorted) : items).map((item) =>
				<Fragment key={isEntry(item) ? item.id : JSON.stringify(item)}>{

					as(item)

				}</Fragment>
			)}

			{pending && <TileMore onLoad={load}/>}

		</>)

		: placeholder ? <TileHint>{placeholder} <span>{items ? "No Matches" : "Loading…"}</span></TileHint>

			: null;

}


