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

import { createElement, Fragment, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { type Post, usePosts, useBoard, Board } from "./board.js";


const saving: Post = { instance: "urn:test:saving", status: "pending", message: "Saving" };
const saved: Post = { instance: "urn:test:saving", status: "success", message: "Saved" };
const loading: Post = { instance: "urn:test:loading", status: "pending", message: "Loading" };
const failed: Post = { instance: "urn:test:failed", status: "failure", message: "Failed" };

const uuid = /^urn:uuid:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;


/**
 * The posts and the board the last render saw.
 */
const seen = vi.fn<(posts: readonly Post[], board: Board) => void>();

/**
 * The posts the board returned, in the order they were put up or raised.
 */
const returns = vi.fn<(post: Post) => void>();

function Probe() {

	seen(usePosts(), useBoard());

	return null;

}

function mount(limit?: number): void {
	act(() => render(createElement(Board, { limit, children: createElement(Probe, {}) }), document.body));
}

function unwrapped(): void {
	act(() => render(createElement(Probe, {}), document.body));
}

function standing(): readonly Post[] {
	return seen.mock.lastCall![0]; // test harness: Probe has rendered at least once
}

function board(): Board {
	return seen.mock.lastCall![1]; // test harness: Probe has rendered at least once
}

/**
 * Calls the board, collecting what the call returns, as `act` hands back nothing.
 */
function collect(call: () => Post): Post {

	act(() => { returns(call()); });

	return returns.mock.lastCall![0]; // test harness: called just above

}

function post(...drafts: readonly Parameters<Board["post"]>[0][]): readonly Post[] {
	return drafts.map(draft => collect(() => board().post(draft)));
}

function raise(...issues: readonly unknown[]): readonly Post[] {
	return issues.map(issue => collect(() => board().raise(issue)));
}

function clear(posts?: Post | readonly Post[]): void {
	act(() => board().clear(posts));
}

function broken(init: ErrorEventInit): void {
	act(() => { window.dispatchEvent(new ErrorEvent("error", init)); });
}


afterEach(async () => {
	act(() => render(null, document.body));
	seen.mockClear();
	returns.mockClear();
	vi.restoreAllMocks();
});


describe("Board()", () => {

	it("should stand against no post", async () => {

		mount();

		expect(standing()).toEqual([]);

	});

	it("should stand against every post by default", async () => {

		mount();
		post(saving, loading);
		raise({ status: 500 });

		expect(standing()).toHaveLength(3);

	});

	it("should stand against every post where the limit is not positive", async () => {

		mount(-1);
		post(saving, loading);

		expect(standing()).toHaveLength(2);

	});

	it("should clear the oldest posts standing beyond the limit", async () => {

		mount(2);
		post(saving, loading);
		raise({ status: 500 });

		expect(standing()).toEqual([loading, expect.objectContaining({ status: "failure" })]);

	});

	it("should reject a fractional limit", async () => {

		expect(() => mount(1.5)).toThrow(TypeError);

	});

	it("should raise a broken script", async () => {

		mount();
		broken({ error: new TypeError("broken") });

		expect(standing()[0]?.problem).toMatchObject({ title: "TypeError", detail: "broken" });

	});

	it("should raise a broken script by its message where it carries no error", async () => {

		mount();
		broken({ message: "broken" });

		expect(standing()[0]?.problem).toMatchObject({ report: "broken" });

	});

	it("should raise an unhandled rejection", async () => {

		mount();

		act(() => { window.dispatchEvent(Object.assign(new Event("unhandledrejection"), { reason: { status: 503 } })); });

		expect(standing()[0]?.problem).toMatchObject({ status: 503 });

	});

	it("should stop raising page issues once unmounted", async () => {

		mount();
		act(() => render(null, document.body));
		mount();
		broken({ error: new TypeError("broken") });

		expect(standing()).toHaveLength(1);

	});

});

describe("useBoard()", () => {

	it("should keep the board across renders", async () => {

		mount();

		const before = board();

		post(saving);

		expect(board()).toBe(before);

	});

	it("should not render a component only posting when posts change", async () => {

		const rendered = vi.fn();

		function Poster() {

			rendered(useBoard());

			return null;

		}

		act(() => render(createElement(Board, {
			children: createElement(Fragment, {}, createElement(Poster, {}), createElement(Probe, {}))
		}), document.body));

		post(saving);

		expect(rendered).toHaveBeenCalledTimes(1);

	});

	describe("post", () => {

		it("should state the post last", async () => {

			mount();
			post(saving, loading);

			expect(standing()).toEqual([saving, loading]);

		});

		it("should return the post as posted", async () => {

			mount();

			expect(post(saving)).toEqual([saving]);

		});

		it("should identify a post put up with no identity as a UUID URN", async () => {

			mount();

			const [saving] = post({ message: "Saving" });

			expect(saving?.instance).toMatch(uuid);
			expect(standing()).toEqual([saving]);

		});

		it("should post a post with no status as having nothing to report", async () => {

			mount();

			expect(post({ message: "Saving" })[0]?.status).toBe("normal");

		});

		it("should update a standing post where it stands", async () => {

			mount();
			post(saving, loading, saved);

			expect(standing()).toEqual([saved, loading]);

		});

		it("should ignore a post standing as given", async () => {

			mount();
			post(saving);

			const before = standing();

			post({ ...saving });

			expect(standing()).toBe(before);

		});

		it("should return the post as posted outside any board, posting it nowhere", async () => {

			unwrapped();

			expect(post({ message: "Saving" })[0]).toMatchObject({ status: "normal", message: "Saving" });
			expect(standing()).toEqual([]);

		});

	});

	describe("raise", () => {

		it("should state the issue last as a failure", async () => {

			mount();
			post(saving);
			raise({ status: 500 });

			expect(standing().map(({ status }) => status)).toEqual(["pending", "failure"]);

		});

		it("should return the post as raised", async () => {

			mount();

			expect(raise({ status: 500 })).toEqual(standing());

		});

		it("should return the post as raised outside any board", async () => {

			vi.spyOn(console, "error").mockImplementation(() => {});

			unwrapped();

			expect(raise({ status: 500 })[0]).toMatchObject({ status: "failure" });

		});

		it("should keep problem details as given", async () => {

			const problem = { status: 404, title: "Not Found", detail: "unknown resource" };

			mount();
			raise(problem);

			expect(standing()[0]?.problem).toMatchObject(problem);

		});

		it("should state an error as problem details of its own, leaving its stack out", async () => {

			mount();
			raise(new TypeError("broken"));

			expect(standing()[0]?.problem).toMatchObject({ status: 0, title: "TypeError", detail: "broken" });
			expect(standing()[0]?.problem).not.toHaveProperty("stack");

		});

		it("should carry an issue that is JSON data as machine-readable details", async () => {

			mount();
			raise({ code: 42 });

			expect(standing()[0]?.problem).toMatchObject({ status: 0, report: { code: 42 } });

		});

		it("should render an issue that is not JSON data", async () => {

			mount();
			raise(() => {});

			expect(standing()[0]?.problem).toMatchObject({ status: 0, detail: expect.any(String) });

		});

		it("should carry the explanation of the problem as the message", async () => {

			mount();
			raise({ status: 404, title: "Not Found", detail: "unknown resource" });

			expect(standing()[0]?.message).toBe("unknown resource");

		});

		it("should carry the summary of the problem as the message, failing an explanation", async () => {

			mount();
			raise({ status: 404, title: "Not Found" });

			expect(standing()[0]?.message).toBe("Not Found");

		});

		it("should carry a message where the problem states neither explanation nor summary", async () => {

			mount();
			raise({ status: 500 });

			expect(standing()[0]?.message).not.toBe("");

		});

		it("should state the same issue twice as two posts", async () => {

			const problem = { status: 500 };

			mount();
			raise(problem, problem);

			expect(standing()).toHaveLength(2);
			expect(standing()[0]?.instance).not.toBe(standing()[1]?.instance);

		});

		it("should identify a raised post as a UUID URN", async () => {

			mount();
			raise({ status: 404 });

			expect(standing()[0]?.instance).toMatch(uuid);

		});

		it("should not take the occurrence stated by the source as the identity", async () => {

			mount();
			raise({ status: 404, instance: "/products/1" });

			expect(standing()[0]?.instance).toMatch(uuid);

		});

		it("should log an issue raised outside any board", async () => {

			const log = vi.spyOn(console, "error").mockImplementation(() => {});

			unwrapped();
			raise({ status: 500 });

			expect(log).toHaveBeenCalled();

		});

	});

	describe("clear", () => {

		it("should clear the post given, leaving the others standing", async () => {

			mount();
			post(saving, loading);
			clear(saving);

			expect(standing()).toEqual([loading]);

		});

		it("should clear a post by its identity, whatever it last carried", async () => {

			mount();
			post(saving, loading);
			clear(saved);

			expect(standing()).toEqual([loading]);

		});

		it("should clear the posts given, leaving the others standing", async () => {

			mount();
			post(saving, loading, failed);
			clear([saving, failed]);

			expect(standing()).toEqual([loading]);

		});

		it("should clear every standing post", async () => {

			mount();
			post(saving);
			raise({ status: 500 });
			clear();

			expect(standing()).toEqual([]);

		});

		it("should ignore a post no longer standing", async () => {

			mount();
			post(saving);
			clear(saving);

			const before = standing();

			clear(saving);

			expect(standing()).toBe(before);

		});

		it("should clear nothing outside any board", async () => {

			unwrapped();
			clear();

			expect(standing()).toEqual([]);

		});

	});

});

describe("usePosts()", () => {

	it("should stand against no post outside any board", async () => {

		unwrapped();

		expect(standing()).toEqual([]);

	});

});
