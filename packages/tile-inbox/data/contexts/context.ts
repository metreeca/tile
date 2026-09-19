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

import { TileFetcher } from "@metreeca/data/contexts/fetcher";
import { TileGraph } from "@metreeca/data/contexts/graph";
import { TileTrace } from "@metreeca/data/contexts/trace";
import { createElement, Fragment, FunctionComponent, ReactNode } from "react";


const services: FunctionComponent<any>[]=[
	TileFetcher,
	TileGraph,
	TileTrace
];


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function TileContext({

	children

}: {

	children: ReactNode

}) {

	return [...services].reverse().reduce(
		(services, service) => createElement(service, {}, services),
		createElement(Fragment, {}, children)
	);

}