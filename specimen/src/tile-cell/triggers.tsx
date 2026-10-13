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
 * Trigger samples.
 *
 * @module
 */

import { More } from "@metreeca/tile-cell/more";
import { useState } from "preact/hooks";


const Batch = 20;
const Total = 100;
const Delay = 1000;


/**
 * Creates the triggers section.
 *
 * Shows a list growing a batch at a time as the reader scrolls to its end, until there is nothing left to fetch.
 *
 * @returns The triggers section
 */
export function Triggers() {

	const [count, setCount] = useState(Batch);

	/*
	 * Each batch lands after a delay standing in for an exchange, so the mark is seen turning. A trigger asking twice
	 * before the batch lands asks for the same one, so the second request changes nothing.
	 */

	const load = () => setTimeout(() => setCount(Math.min(count + Batch, Total)), Delay);

	return <>

		<p>A trigger closes a list fetched as it is read: scrolling it into view asks for the next batch, and the list
			stops rendering it once there is nothing left to fetch.</p>

		<ol>
			{Array.from({ length: count }, (_, index) => <li key={index}>Item {index + 1}</li>)}
		</ol>

		{count < Total && <More onLoad={load}/>}

	</>;

}
