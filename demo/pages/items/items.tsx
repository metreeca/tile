/*
 * Copyright © 2020-2021 Metreeca srl
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

import { useEntry, useOptions, useRange } from "../../../code/hooks/entry";
import { useQuery } from "../../../code/hooks/query";
import { ToolField } from "../../../code/tiles/field";
import { ToolInput } from "../../../code/tiles/input";
import { ToolOptions } from "../../../code/tiles/options";
import { ToolPane } from "../../../code/tiles/pane";
import { ToolRange } from "../../../code/tiles/range";
import { ToolSpin } from "../../../code/tiles/spin";
import { DemoPage } from "../../tiles/page";

const Items={ id: "", contains: [{ id: "", label: "" }] };


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function DemoItems() {

	const id="https://demo.metreeca.com/toys/products/";

	const [query, putQuery]=useQuery({});
	const items=useEntry(id, Items, query);

	return <DemoPage item={"Items"} menu={items.wait(<ToolSpin/>)}

		pane={<ToolPane header={<ToolInput icon placeholder={"Search"} value={["", () => {}]}/>}>

			<ToolField name={"Product Line"} searchable
				selector={<ToolOptions options={useOptions(id, "line", [query, putQuery])}/>}
			/>

			<ToolField name={"Price"}
				selector={<ToolRange range={useRange(id, "price", [query, putQuery])}/>}
			/>

		</ToolPane>}

	>{items.then(items => items.contains.map(item =>
		<a href={item.id}>{item.label}</a>
	))}</DemoPage>;

}
