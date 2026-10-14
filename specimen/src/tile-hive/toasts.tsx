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
 * Toast samples.
 *
 * @module
 */

import { Button } from "@metreeca/tile-cell/button";
import { type Post, usePosts, useBoard, Board } from "@metreeca/tile-data/board";
import { Toast } from "@metreeca/tile-hive/toast";
import "../tile-cell/index.css";


const Delay = 2000;

const Samples: readonly Required<Pick<Post, "status" | "message">>[] = [
	{ status: "normal", message: "Two drafts are waiting" },
	{ status: "pending", message: "Saving the changes…" },
	{ status: "success", message: "Changes saved" },
	{ status: "warning", message: "Changes saved, two fields left empty" },
	{ status: "failure", message: "Changes not saved" },
	{ status: "defect", message: "The editor stopped working" }
];


/**
 * Creates the toasts section.
 *
 * Shows the toasts an interface floats over the page to tell how its operations are going, one for each post any
 * number of sources put up at once on a shared board.
 *
 * @returns The toasts section
 */
export function Toasts() {
	return <Board>

		<p>Toasts float over the top of the screen, one for each post standing on the board, telling how an operation is
			going and how it ended, marked with the glyph matching its status. They hold no timing of their own, so the
			source posting one takes it away.</p>

		<Sources/>

		<p>Sources post to one shared board and the stack shows every post standing, so concurrent operations never
			paint over one another: running one moves its toast from pending to how it ended, then clears it, and the
			toast fades out while the others stay. An issue a source catches is raised as a failure.</p>

		<Operations/>

		<p>A batch runs a mix of operations at once, each taking its own time and ending its own way: the toasts of
			those completed go away on their own after a while, while those completed with caveats and those that failed
			stand until they are cleared, so clearing them alone shows a subset fading out while the rest stay.</p>

		<Batch/>

		<p>An actionable post shows its message as a link, handing the post back to the interface when followed: here
			following it clears the post and notes what was opened.</p>

		<Actionable/>

		<Shown/>

	</Board>;
}


function Actionable() {

	const { post } = useBoard();

	return <div class="controls">
		<Button label="actionable" onClick={() => post({
			status: "warning",
			message: "Changes saved, two fields left empty: review them",
			actionable: true
		})}/>
	</div>;

}

function Shown() {

	const { post, clear } = useBoard();

	return <Toast position={["bottom", "start"]} timeout={2500} onAction={acted => {
		clear(acted);
		post({ message: `Opened “${acted.message}”` });
	}}/>;

}


function Sources() {

	const { post, clear } = useBoard();

	return <div class="controls">

		{Samples.map(sample =>
			<Button key={sample.status} label={sample.status} onClick={() => post(sample)}/>
		)}

		<Button label="dismiss" look="subtle" onClick={() => clear()}/>

	</div>;

}

function Operations() {

	const { post, raise, clear } = useBoard();

	const run = (name: string) => {

		const toast = post({ status: "pending", message: `Running ${name}…` });

		setTimeout(() => {

			const ended = post({ ...toast, status: "success", message: `Completed ${name}` });

			setTimeout(() => clear(ended), Delay);

		}, Delay);

	};

	return <div class="controls">
		<Button label="run first" onClick={() => run("first")}/>
		<Button label="run second" onClick={() => run("second")}/>
		<Button label="raise" onClick={() => raise({ status: 404, title: "Not Found", detail: "Unknown product" })}/>
	</div>;

}

function Batch() {

	const { post, raise, clear } = useBoard();
	const posts = usePosts();

	const issues = posts.filter(({ status }) => status === "warning" || status === "failure");

	/*
	 * Each operation posts its progress, then replaces it with how it ended once its time is up. A failure is raised
	 * as an issue would be, so it takes the place of the progress post rather than updating it.
	 */

	const start = ({ name, time, outcome }: Operation) => {

		const progress = post({ status: "pending", message: `${name}…` });

		setTimeout(() => {

			if ( outcome === "failure" ) {

				clear(progress);
				raise({ status: 503, title: "Service Unavailable", detail: `${name} failed, the service is unavailable` });

			} else {

				post({ ...progress, status: outcome, message: Endings[outcome](name) });

			}

		}, time);

	};

	return <div class="controls">

		<Button label="run a batch" onClick={() => Jobs.forEach(start)}/>

		<Button disabled={issues.length === 0} label="clear issues" look="subtle" onClick={() => clear(issues)}/>

		<Button label="note" onClick={() => post({ message: `${posts.length} posts standing` })}/>

	</div>;

}


type Operation = {
	name: string
	time: number
	outcome: "success" | "warning" | "failure"
};

const Jobs: readonly Operation[] = [
	{ name: "Uploading the catalogue", time: 1500, outcome: "success" },
	{ name: "Syncing the contacts", time: 2500, outcome: "warning" },
	{ name: "Exporting the report", time: 3500, outcome: "failure" },
	{ name: "Indexing the archive", time: 4500, outcome: "success" },
	{ name: "Publishing the release", time: 5500, outcome: "failure" }
];

const Endings: Readonly<Record<"success" | "warning", (name: string) => string>> = {
	success: name => `${name}: done`,
	warning: name => `${name}: done, three records skipped`
};
