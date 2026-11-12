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
 * API documentation samples.
 *
 * @module
 */

import { Page, type Sample } from "@metreeca/specimen/index.core.js";


const samples: readonly Sample[] = [];


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function TileApis() {

	return <Page

		eyebrow="@metreeca/tile-apis"
		title="API Documentation"
		lead={<>
			The documentation of a linked data API, drawn from the shapes it serves: the resources it exposes, the
			properties describing them and the links relating them. Samples land here as the widgets are migrated.
		</>}

		samples={samples}

	/>;

}
