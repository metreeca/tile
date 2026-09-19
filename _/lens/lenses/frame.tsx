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

import { isDefined } from "../Core/src/index.js";
import { Frame, isFrame, toFrameString } from "@metreeca/core/frame";
import { Resource } from "@metreeca/data/models/resource";
import { TileHint } from "@metreeca/view/widgets/hint";
import React, { ReactNode } from "react";

// !!! the Tile prefix is dropped on migration, but `Frame` clashes with the model type imported here: rename by role

export function TileFrame<V extends Frame>({

	placeholder,

	as=toFrameString,

	children: state

}: {

	placeholder?: ReactNode

	as?: (resource: V) => ReactNode

	children: undefined | V | Resource<V>

}) {

	const resource=isFrame(state) ? state : isDefined(state) ? state[0] : undefined;

	return <>{

		resource ? as(resource)
			: placeholder ? <TileHint>{placeholder}</TileHint>
				: null

	}</>;

}
