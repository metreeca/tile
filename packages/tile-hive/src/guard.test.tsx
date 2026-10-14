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

import { Board, type Post, usePosts } from "@metreeca/tile-data/board";
import { type JSX, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Guard } from "./guard.js";


/**
 * The posts standing on the board the last render saw.
 */
const seen = vi.fn<(posts: readonly Post[]) => void>();

function Probe() {

	seen(usePosts());

	return null;

}

function Broken(): never {
	throw new TypeError("broken");
}

function mount(element: JSX.Element): string {

	act(() => render(<Board>{element}<Probe/></Board>, document.body));

	return document.body.innerHTML;

}

function standing(): readonly Post[] {
	return seen.mock.lastCall![0]; // test harness: Probe has rendered at least once
}


beforeEach(async () => {
	vi.spyOn(console, "error").mockImplementation(() => {}); // failures are logged as caught, kept out of the run
});

afterEach(async () => {
	act(() => render(null, document.body));
	seen.mockClear();
	vi.restoreAllMocks();
});


describe("Guard", () => {

	it("renders what it holds while nothing fails", async () => {

		expect(mount(<Guard fallback={<p>failed</p>}><p>held</p></Guard>))
			.toBe("<tile-guard><p>held</p></tile-guard>");

	});

	it("renders the fallback in place of what it holds once it fails", async () => {

		expect(mount(<Guard fallback={<p>failed</p>}><p>held</p><Broken/></Guard>))
			.toBe("<tile-guard><p>failed</p></tile-guard>");

	});

	it("renders nothing in place of what it holds once it fails, given no fallback", async () => {

		expect(mount(<Guard><p>held</p><Broken/></Guard>))
			.toBe("<tile-guard></tile-guard>");

	});

	it("leaves what stands beside it rendered", async () => {

		expect(mount(<><p>beside</p><Guard><Broken/></Guard></>))
			.toBe("<p>beside</p><tile-guard></tile-guard>");

	});

	it("confines a failure to the innermost guard enclosing it", async () => {

		expect(mount(<Guard fallback={<p>outer</p>}><p>held</p><Guard fallback={<p>inner</p>}><Broken/></Guard></Guard>))
			.toBe("<tile-guard><p>held</p><tile-guard><p>inner</p></tile-guard></tile-guard>");

	});

	it("logs the failure to the console as caught", async () => {

		mount(<Guard><Broken/></Guard>);

		expect(console.error).toHaveBeenCalledWith(expect.objectContaining({ message: "broken", stack: expect.any(String) }));

	});

	it("raises the failure on the enclosing board", async () => {

		mount(<Guard><Broken/></Guard>);

		expect(standing()).toEqual([expect.objectContaining({
			status: "defect",
			problem: expect.objectContaining({ title: "TypeError", detail: "broken" })
		})]);

	});

});
