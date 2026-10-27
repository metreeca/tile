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

import type { Criteria } from "@metreeca/qest/model";
import { createElement, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useQuery } from "./query.js";
import { Router } from "./router.js";


describe("useQuery()", () => {

	const route = "/catalogue/";
	const key = `${route}#query`;


	function mount(): () => ReturnType<typeof useQuery> {

		const queries = vi.fn<(query: ReturnType<typeof useQuery>) => void>();

		function Probe() {

			queries(useQuery());

			return null;

		}

		act(() => render(createElement(Router, { children: createElement(Probe, {}) }), document.body));

		return () => queries.mock.lastCall![0]; // test harness: Probe has rendered at least once
	}


	beforeEach(async () => {
		history.replaceState(null, "", route);
		sessionStorage.clear();
	});

	afterEach(async () => {
		act(() => render(null, document.body));
	});


	describe("reading", () => {

		it("should start empty where no place holds criteria", async () => {
			expect(mount()()[0]).toEqual({});
		});

		it("should read the criteria from the history entry first", async () => {

			history.replaceState({ "~label": "state" } satisfies Criteria, "", `${route}?~label=%22query%22`);
			sessionStorage.setItem(key, "~label=%22session%22");

			expect(mount()()[0]).toEqual({ "~label": "state" });

		});

		it("should read the criteria from the location query where the history entry holds none", async () => {

			history.replaceState(null, "", `${route}?~label=%22query%22`);
			sessionStorage.setItem(key, "~label=%22session%22");

			expect(mount()()[0]).toEqual({ "~label": "query" });

		});

		it("should read the criteria last written in the session where the location holds none", async () => {

			sessionStorage.setItem(key, "~label=%22session%22");

			expect(mount()()[0]).toEqual({ "~label": "session" });

		});

		it("should skip a malformed location query", async () => {

			history.replaceState(null, "", `${route}?%%%`);
			sessionStorage.setItem(key, "~label=%22session%22");

			expect(mount()()[0]).toEqual({ "~label": "session" });

		});

		it("should keep the criteria read in the location as the component mounts", async () => {

			sessionStorage.setItem(key, "~label=%22session%22");

			mount();

			expect(location.search).toBe("?~label=%22session%22");

		});

	});

	describe("writing", () => {

		it("should hand over the criteria written", async () => {

			const query = mount();

			act(() => query()[1]({ "~label": "art" }));

			expect(query()[0]).toEqual({ "~label": "art" });

		});

		it("should keep the criteria written in the location query, the path and the hash in place", async () => {

			history.replaceState(null, "", `${route}#top`);

			const query = mount();

			act(() => query()[1]({ "~label": "art" }));

			expect(`${location.pathname}${location.search}${location.hash}`).toBe(`${route}?~label=%22art%22#top`);

		});

		it("should keep the criteria written in the history entry, adding none", async () => {

			const query = mount();
			const length = history.length;

			act(() => query()[1]({ "~label": "art" }));

			expect(history.state).toEqual({ "~label": "art" });
			expect(history.length).toBe(length);

		});

		it("should keep the criteria written in the session, under the route", async () => {

			const query = mount();

			act(() => query()[1]({ "~label": "art" }));

			expect(sessionStorage.getItem(key)).toBe("~label=%22art%22");

		});

		it("should leave the location with no query on empty criteria", async () => {

			history.replaceState(null, "", `${route}?~label=%22art%22`);

			const query = mount();

			act(() => query()[1]({}));

			expect(location.search).toBe("");

		});

	});

});
