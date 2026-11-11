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
 * Binding samples.
 *
 * @module
 */

import { Page, type Sample } from "@metreeca/specimen/index.core.js";
import { Actions } from "@metreeca/specimen/tile/actions.js";
import { Collection } from "@metreeca/specimen/tile/collection.js";
import { Count } from "@metreeca/specimen/tile/count.js";
import { Search } from "@metreeca/specimen/tile/search.js";
import { Members } from "@metreeca/specimen/tile/members.js";
import { Query } from "@metreeca/specimen/tile/query.js";
import { Range } from "@metreeca/specimen/tile/range.js";
import { Resource } from "@metreeca/specimen/tile/resource.js";
import { Store } from "@metreeca/specimen/tile/store.js";
import { Tally } from "@metreeca/specimen/tile/tally.js";


const samples: readonly Sample[] = [

	{ id: "store", group: "Stores", title: "Store", view: <Store/> },

	{ id: "resource", group: "Resources", title: "Resource", view: <Resource/> },

	{ id: "collection", group: "Collections", title: "Collection", view: <Collection/> },
	{ id: "query", group: "Collections", title: "Query", view: <Query/> },
	{ id: "actions", group: "Collections", title: "Actions", view: <Actions/> },
	{ id: "members", group: "Collections", title: "Members", view: <Members/> },
	{ id: "count", group: "Collections", title: "Count", view: <Count/> },

	{ id: "search", group: "Facets", title: "Search", view: <Search/> },
	{ id: "tally", group: "Facets", title: "Tally", view: <Tally/> },
	{ id: "range", group: "Facets", title: "Range", view: <Range/> }

];


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function Tile() {

	return <Page

		eyebrow="@metreeca/tile"
		title="Store and Bindings"
		lead={<>
			The linked data behaviour an interface is wired to, with no rendering of its own: one shared store, the
			resources and collections components bind to, and the facets and counters narrowing and counting them. Every sample
			below draws its own markup over the same hooks the widgets use, reading from an in-memory toys store.
		</>}

		samples={samples}

	/>;

}
