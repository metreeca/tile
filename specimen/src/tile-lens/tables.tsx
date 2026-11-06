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
 * Table samples.
 *
 * @module
 */

import { integer } from "@metreeca/blue/number";
import { reference } from "@metreeca/blue/reference";
import { id, multiple, required, resource } from "@metreeca/blue/resource";
import { string } from "@metreeca/blue/string";
import { isNumber, isObject } from "@metreeca/core";
import { getIRIBase } from "@metreeca/core/resource";
import { createFetch } from "@metreeca/http";
import { mock } from "@metreeca/http/mock";
import { decodeTemplate } from "@metreeca/qest/model";
import { Icon } from "@metreeca/tile-cell/icon";
import { More } from "@metreeca/tile-cell/more";
import { Fetch } from "@metreeca/tile/fetch";
import { type Collection, Store, useCollection, useMembers } from "@metreeca/tile/store";
import { Table } from "@metreeca/tile-lens/table";


const entry = "https://example.com/courses/";

const Course = resource({ id: id(), label: required(string()), area: required(string()), year: required(integer()) });
const Catalogue = resource({ id: id(), members: multiple(reference(Course)) });

const areas = ["Arts", "Engineering", "Law", "Medicine", "Science"];

const courses = Array.from({ length: 200 }, (_, index) => ({
	id: `${entry}${index + 1}`,
	label: `Course ${String(index + 1).padStart(3, "0")}`,
	area: areas[index%areas.length]!, // index within bounds
	year: 2000 + (index*7)%25
}));

type Course = typeof courses[number];


/**
 * Answers a collection query over the sample courses, sorted on the first `^` key and paged as the query asks.
 */
async function serve(request: Request): Promise<Response> {

	const query = decodeTemplate(new URL(request.url).search.slice(1), { base: getIRIBase(entry) });
	const members: { readonly [key: string]: unknown } = isObject(query.members) ? query.members : {};

	const [key, direction] = Object.entries(members).find(([key]) => key.startsWith("^")) ?? ["^label", "asc"];
	const field = key.slice(1) as keyof Course; // ;(cast) sample server: keys name course fields
	const sign = direction === "desc" ? -1 : 1;

	const offset = isNumber(members["@"]) ? members["@"] : 0;
	const limit = isNumber(members["#"]) && members["#"] > 0 ? members["#"] : courses.length;

	return Response.json({
		members: courses
			.slice()
			.sort((x, y) => sign*String(x[field]).localeCompare(String(y[field])))
			.slice(offset, offset + limit)
	});

}


/**
 * Creates the tables section.
 *
 * @returns The tables section
 */
export function Tables() {

	const collection = useCollection({ entry, shape: Catalogue });

	return <Fetch fetch={createFetch(mock({ serve, delay: 500 }))}>

		<Store>

			<p>A table shows the members of a collection one row per item, sorted on any sortable column by its header.
				Grouped by area, leading cells repeating the row above are faded.</p>

			<Listing collection={collection}/>

		</Store>

	</Fetch>;

}


function Listing({

	collection

}: {

	collection: Collection<typeof Catalogue, "members">

}) {

	const members = useMembers(collection, {
		model: { id: {}, label: {}, area: {}, year: {} },
		order: { area: "asc" },
		batch: 25
	});

	return <>

		<Table name="Courses" hierarchy members={members} placeholder={<Icon.Table/>} columns={{
			Area: { sort: "area", render: item => item.area },
			Course: { sort: "label", render: item => item.label },
			Year: { sort: "year", align: "end", render: item => item.year }
		}}/>

		{members({ ready: ({ load }) => load && <More onLoad={load}/> })}

	</>;

}
