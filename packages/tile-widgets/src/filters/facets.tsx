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
 * Facet groups.
 *
 * Gathers related facets into a single column, so that the controls narrowing a collection read as one group and line
 * up with each other, whatever mix of searches, ranges and tallies the group holds.
 *
 * @module
 */

import { type ComponentChildren, createElement } from "preact";
import "./facets.css";


/**
 * Creates a facet group.
 *
 * Stacks the facets it holds top to bottom, in the order given, each stretched to the width of the group and a spacing
 * step apart from the next. The group grows with its facets and never scrolls, leaving that to the area holding it,
 * so a sidebar or a drawer decides on its own how a long list of facets is reached.
 *
 * ```tsx
 * const collection = useCollection({ entry: "/courses/", shape: Course });
 *
 * <Facets>
 *     <Search collection={collection} field={"label"}/>
 *     <Tally collection={collection} field={"subject"}/>
 * </Facets>
 * ```
 *
 * @param options The widget configuration
 *
 * @returns The facet group
 */
export function Facets({

	children

}: {

	/**
	 * The facets grouped.
	 */
	children?: ComponentChildren

}) {

	return createElement("tile-facets", {}, children);

}
