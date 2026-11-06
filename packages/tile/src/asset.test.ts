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

import { InternalServerError, NetworkError, NotFound } from "@metreeca/http";
import { createElement, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAsset } from "./asset.js";
import { Fetch, useFetching } from "./fetch.js";
import { Router, useRoute, useRouter } from "./router.js";


/**
 * The requests the client was asked to perform, in order.
 */
const requests: Request[] = [];

/**
 * The pending responses, settled by the test in the order the requests were made.
 */
const pending: Settler[] = [];

type Settler = {
	resolve: (response: Response) => void
	reject: (reason: unknown) => void
}

const client = vi.fn((input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {

	const request = new Request(input, init);

	requests.push(request);

	return new Promise<Response>((resolve, reject) => {

		pending.push({ resolve, reject });

		request.signal.addEventListener("abort", () => reject(request.signal.reason));

	});

});


/**
 * The navigator of the last render.
 */
const navigator = vi.fn<(navigate: ReturnType<typeof useRouter>) => void>();

function Probe({ path }: { path?: string }) {

	const route = useRoute(); // the call site settles the asset of the route on show

	const text = useAsset(path ?? route);
	const busy = useFetching();

	navigator(useRouter());

	return createElement("output", { "data-busy": busy },
		text === undefined ? "<loading>" : typeof text === "number" ? `<failed ${text}>` : text
	);

}

async function mount(path?: string): Promise<void> {
	await act(async () => {

		render(
			createElement(Fetch, {
				fetch: client,
				children: createElement(Router, { children: createElement(Probe, { path }) })
			}),
			document.body
		);

		await settle();

	});
}

async function navigate(route: string): Promise<void> {
	await act(async () => {

		navigator.mock.lastCall![0](route); // test harness: Probe has rendered at least once

		await settle();

	});
}

async function respond(response: Response | Error, index = pending.length-1): Promise<void> {
	await act(async () => {

		if ( response instanceof Error ) {
			pending[index]!.reject(response); // test harness: the request was made
		} else {
			pending[index]!.resolve(response); // test harness: the request was made
		}

		await settle();

	});
}

/**
 * Lets the exchanges in flight make their way through the client middlewares.
 */
async function settle(): Promise<void> {
	await new Promise(resolve => setTimeout(resolve, 0));
}

function text(): string {
	return document.body.textContent ?? "";
}

function busy(): boolean {
	return document.querySelector("output")?.dataset.busy === "true";
}

function urls(): string[] {
	return requests.map(request => new URL(request.url).pathname);
}


beforeEach(async () => {
	history.replaceState(null, "", "/");
});

afterEach(async () => {
	act(() => render(null, document.body));
	requests.length = 0;
	pending.length = 0;
	client.mockClear();
	navigator.mockClear();
});


describe("useAsset()", () => {

	describe("location", () => {

		it("should retrieve the current route by default", async () => {

			history.replaceState(null, "", "/guide/intro.md");

			await mount();

			expect(urls()).toEqual(["/guide/intro.md"]);

		});

		it("should retrieve a folder as it is", async () => {

			history.replaceState(null, "", "/guide/");

			await mount();

			expect(urls()).toEqual(["/guide/"]);

		});

		it("should retrieve a path naming no file as it is", async () => {

			history.replaceState(null, "", "/guide/intro");

			await mount();

			expect(urls()).toEqual(["/guide/intro"]);

		});

		it("should ignore the query and the hash of the route", async () => {

			history.replaceState(null, "", "/guide/intro.md?x=1#part");

			await mount();

			expect(urls()).toEqual(["/guide/intro.md"]);

		});

		it("should resolve a relative path against the current route", async () => {

			history.replaceState(null, "", "/guide/intro.md");

			await mount("other.md");

			expect(urls()).toEqual(["/guide/other.md"]);

		});

		it("should take an absolute path as it is", async () => {

			history.replaceState(null, "", "/guide/intro.md");

			await mount("/notes/index.md");

			expect(urls()).toEqual(["/notes/index.md"]);

		});

	});

	describe("retrieval", () => {

		it("should ask for the media type of the asset", async () => {

			history.replaceState(null, "", "/guide/index.md");

			await mount();

			expect(requests[0]?.headers.get("accept")).toBe("text/markdown");

		});

		it("should ask for the media type of an asset of another type", async () => {

			history.replaceState(null, "", "/guide/");

			await mount("data.json");

			expect(requests[0]?.headers.get("accept")).toBe("application/json");

		});

		it("should ask for any media type for an unknown extension", async () => {

			history.replaceState(null, "", "/guide/");

			await mount("data.xyz");

			expect(requests[0]?.headers.get("accept")).toBe("*/*");

		});

		it("should ask for any media type for a path naming no file", async () => {

			history.replaceState(null, "", "/guide/");

			await mount();

			expect(requests[0]?.headers.get("accept")).toBe("*/*");

		});

		it("should retrieve through the client of the fetch context", async () => {

			history.replaceState(null, "", "/guide/");

			await mount();

			expect(client).toHaveBeenCalledOnce();
			expect(busy()).toBe(true);

		});

		it("should state undefined while retrieving", async () => {

			history.replaceState(null, "", "/guide/");

			await mount();

			expect(text()).toBe("<loading>");

		});

		it("should state the text of a retrieved asset", async () => {

			history.replaceState(null, "", "/guide/");

			await mount();

			await respond(new Response("# Guide"));

			expect(text()).toBe("# Guide");

		});

		it("should state the status of a missing asset", async () => {

			history.replaceState(null, "", "/guide/");

			await mount();

			await respond(new Response("not found", { status: NotFound }));

			expect(text()).toBe(`<failed ${NotFound}>`);

		});

		it("should state the status of a failed response", async () => {

			history.replaceState(null, "", "/guide/");

			await mount();

			await respond(new Response("failed", { status: InternalServerError }));

			expect(text()).toBe(`<failed ${InternalServerError}>`);

		});

		it("should state a network error for a failed exchange", async () => {

			history.replaceState(null, "", "/guide/");

			await mount();

			await respond(new TypeError("network down"));

			expect(text()).toBe(`<failed ${NetworkError}>`);

		});

	});

	describe("navigation", () => {

		it("should retrieve the asset of the new route", async () => {

			history.replaceState(null, "", "/guide/");

			await mount();
			await navigate("/guide/intro");

			expect(urls()).toEqual(["/guide/", "/guide/intro"]);

		});

		it("should drop the previous text while retrieving the new asset", async () => {

			history.replaceState(null, "", "/guide/");

			await mount();

			await respond(new Response("# Guide"));

			await navigate("/guide/intro");

			expect(text()).toBe("<loading>");

		});

		it("should abort the retrieval of the previous asset", async () => {

			history.replaceState(null, "", "/guide/");

			await mount();
			await navigate("/guide/intro");

			expect(requests[0]?.signal.aborted).toBe(true);

		});

		it("should ignore the outcome of an aborted retrieval", async () => {

			history.replaceState(null, "", "/guide/");

			await mount();
			await navigate("/guide/intro");

			await respond(new Response("# Intro"));

			expect(text()).toBe("# Intro");

		});

		it("should not retrieve again on a change of query alone", async () => {

			history.replaceState(null, "", "/guide/intro");

			await mount();
			await navigate("/guide/intro?x=1");

			expect(urls()).toEqual(["/guide/intro"]);

		});

	});

});
