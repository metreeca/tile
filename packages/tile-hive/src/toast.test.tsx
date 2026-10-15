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

import { type Post, usePosts, useBoard, Board } from "@metreeca/tile-data/board";
import { render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toast } from "./toast.js";


const saving: Post = { instance: "urn:test:saving", status: "pending", message: "Saving" };
const saved: Post = { instance: "urn:test:saving", status: "success", message: "Saved" };
const loading: Post = { instance: "urn:test:loading", status: "pending", message: "Loading" };
const failed: Post = { instance: "urn:test:failed", status: "failure", message: "Failed" };


/**
 * The board and the posts standing on it the last render saw.
 */
const seen = vi.fn<(board: Board, posts: readonly Post[]) => void>();

function Probe() {

	seen(useBoard(), usePosts());

	return null;

}

function mount(props: NonNullable<Parameters<typeof Toast>[0]> = {}): void {
	act(() => render(<Board><Toast {...props}/><Probe/></Board>, document.body));
}

function board(): Board {
	return seen.mock.lastCall![0]; // test harness: Probe has rendered at least once
}

function standing(): readonly Post[] {
	return seen.mock.lastCall![1]; // test harness: Probe has rendered at least once
}

function post(...posts: readonly Post[]): void {
	posts.forEach(post => act(() => { board().post(post); }));
}

function clear(posts: Post | readonly Post[]): void {
	act(() => board().clear(posts));
}

function elapse(ms: number): void {
	act(() => { vi.advanceTimersByTime(ms); });
}

function region(): HTMLElement | null {
	return document.querySelector("tile-toast");
}

/**
 * The toasts in the stack, as `message:status`, marked with `!` where on their way out.
 */
function toasts(): readonly string[] {
	return Array.from(document.querySelectorAll("tile-toast > div"), toast =>
		`${toast.textContent}:${toast.getAttribute("status")}${toast.hasAttribute("hidden") ? "!" : ""}`
	);
}

/**
 * The toast carrying a message.
 */
function toast(message: string): Element | null {
	return Array.from(document.querySelectorAll("tile-toast > div")).find(toast => toast.textContent === message) ?? null;
}

/**
 * Ends an opacity transition on an element, as the browser does once it has run its course.
 */
function ended(element: Element | null): void {
	act(() => {
		element?.dispatchEvent(Object.assign(new Event("transitionend", { bubbles: true }), { propertyName: "opacity" }));
	});
}

/**
 * Ends the fade of the toast carrying a message.
 */
function faded(message: string): void {
	ended(toast(message));
}


beforeEach(() => { vi.useFakeTimers(); });

afterEach(async () => {
	act(() => render(null, document.body));
	seen.mockClear();
	vi.useRealTimers();
});


describe("Toast()", () => {

	it("should render a polite live region with no toast while nothing stands", async () => {

		mount();

		expect(region()?.getAttribute("role")).toBe("status");
		expect(toasts()).toEqual([]);

	});

	it("should render the live region with no toast outside any board", async () => {

		act(() => render(<Toast/>, document.body));

		expect(region()?.getAttribute("role")).toBe("status");
		expect(toasts()).toEqual([]);

	});

	it("should show a toast for each post standing, newest first", async () => {

		mount();
		post(saving, loading);

		expect(toasts()).toEqual(["Loading:pending", "Saving:pending"]);

	});

	it("should mark each toast with the glyph of its status", async () => {

		mount();
		post(
			{ instance: "urn:test:normal", status: "normal", message: "Normal" },
			{ instance: "urn:test:pending", status: "pending", message: "Pending" },
			{ instance: "urn:test:success", status: "success", message: "Success" },
			{ instance: "urn:test:warning", status: "warning", message: "Warning" },
			{ instance: "urn:test:failure", status: "failure", message: "Failure" },
			{ instance: "urn:test:defect", status: "defect", message: "Defect" }
		);

		const glyphs = Array.from(document.querySelectorAll("tile-toast > div > div > div > svg"), glyph => glyph.innerHTML);

		expect(glyphs).toHaveLength(6);
		expect(new Set(glyphs).size).toBe(6);

	});

	it("should update a toast where it stands", async () => {

		mount();
		post(saving, loading, saved);

		expect(toasts()).toEqual(["Loading:pending", "Saved:success"]);

	});

	it("should keep a cleared toast on its way out where it stood", async () => {

		mount();
		post(saving, loading, failed);
		clear(loading);

		expect(toasts()).toEqual(["Failed:failure", "Loading:pending!", "Saving:pending"]);

	});

	it("should keep a toast on its way out while the board changes again", async () => {

		mount();
		post(saving, loading);
		clear(loading);
		post(failed);

		expect(toasts()).toEqual(["Failed:failure", "Loading:pending!", "Saving:pending"]);

	});

	it("should keep a toast on its way out while a transition of what it carries ends", async () => {

		mount();
		post(saving, loading);
		clear(loading);
		ended(toast("Loading")?.querySelector("button") ?? null);

		expect(toasts()).toEqual(["Loading:pending!", "Saving:pending"]);

	});

	it("should drop a toast on its way out once it has faded", async () => {

		mount();
		post(saving, loading);
		clear(loading);
		faded("Loading");

		expect(toasts()).toEqual(["Saving:pending"]);

	});

	it("should name the dismiss control", async () => {

		mount();
		post(saving);

		expect(toast("Saving")?.querySelector("button")?.getAttribute("aria-label")).toBe("Dismiss");

	});

	it("should clear a post from the board when its toast is dismissed", async () => {

		mount();
		post(saving, loading);

		act(() => toast("Loading")?.querySelector("button")?.click());

		expect(standing()).toEqual([saving]);
		expect(toasts()).toEqual(["Loading:pending!", "Saving:pending"]);

	});

	describe("position", () => {

		function placed(position?: NonNullable<Parameters<typeof Toast>[0]>["position"]): readonly (string | null)[] {

			mount({ position });

			return [region()?.getAttribute("edge") ?? null, region()?.getAttribute("side") ?? null];

		}

		it("should float at the top, centred, by default", async () => {

			expect(placed()).toEqual(["top", "center"]);

		});

		it("should centre the stack on the edge given alone", async () => {

			expect(placed("bottom")).toEqual(["bottom", "center"]);

		});

		it("should place the stack on the edge and side given", async () => {

			expect(placed(["bottom", "end"])).toEqual(["bottom", "end"]);

		});

	});

	describe("timeout", () => {

		const noted: Post = { instance: "urn:test:noted", status: "normal", message: "Noted" };
		const warned: Post = { instance: "urn:test:warned", status: "warning", message: "Warned" };

		it("should take away the toast of a completed or plain post once the timeout is up", async () => {

			mount({ timeout: 5000 });
			post(saved, noted);
			elapse(5000);

			expect(toasts()).toEqual(["Noted:normal!", "Saved:success!"]);

		});

		it("should leave the post standing on the board once its toast is taken away", async () => {

			mount({ timeout: 5000 });
			post(saved);
			elapse(5000);

			expect(standing()).toEqual([saved]);

		});

		it("should keep a post until the timeout is up", async () => {

			mount({ timeout: 5000 });
			post(saved);
			elapse(4999);

			expect(toasts()).toEqual(["Saved:success"]);

		});

		it("should keep pending, warning and failure posts", async () => {

			mount({ timeout: 5000 });
			post(loading, warned, failed);
			elapse(60000);

			expect(toasts()).toEqual(["Failed:failure", "Warned:warning", "Loading:pending"]);

		});

		it("should keep actionable posts whatever their status where a handler is given", async () => {

			mount({ timeout: 5000, onAction: () => {} });
			post({ ...saved, actionable: true }, { ...noted, actionable: true });
			elapse(60000);

			expect(toasts()).toEqual(["Noted:normal", "Saved:success"]);

		});

		it("should start the timeout once a post is updated to a completed one", async () => {

			mount({ timeout: 5000 });
			post(saving);
			elapse(4000);
			post(saved);
			elapse(4000);

			expect(toasts()).toEqual(["Saved:success"]);

			elapse(1000);

			expect(toasts()).toEqual(["Saved:success!"]);

		});

		it("should keep a timed out toast in place once it has faded, as its post still stands", async () => {

			mount({ timeout: 5000 });
			post(saved, loading);
			elapse(5000);
			faded("Saved");
			post({ ...saved, message: "Saved again" });

			expect(toasts()).toEqual(["Loading:pending", "Saved again:success"]);

		});

		it("should drop a timed out toast once its post is cleared, as it has no fade left to run", async () => {

			mount({ timeout: 5000 });
			post(saved, loading);
			elapse(5000);
			faded("Saved");
			clear(saved);

			expect(toasts()).toEqual(["Loading:pending"]);

		});

		it("should take the timeout given", async () => {

			mount({ timeout: 1000 });
			post(saved);
			elapse(1000);

			expect(toasts()).toEqual(["Saved:success!"]);

		});

		it("should take nothing away on its own by default", async () => {

			mount();
			post(saved, noted);
			elapse(60000);

			expect(toasts()).toEqual(["Noted:normal", "Saved:success"]);

		});

		it("should take nothing away on its own where the timeout is not positive", async () => {

			mount({ timeout: 0 });
			post(saved, noted);
			elapse(60000);

			expect(toasts()).toEqual(["Noted:normal", "Saved:success"]);

		});

	});

	describe("onAction", () => {

		const linked: Post = { ...failed, actionable: true };

		function link(): HTMLButtonElement | null {
			return document.querySelector("tile-toast > div span > button");
		}

		it("should show the message of an actionable post as a control", async () => {

			mount({ onAction: () => {} });
			post(linked);

			expect(link()?.textContent).toBe("Failed");

		});

		it("should clear the post and hand it to the handler when its message is activated", async () => {

			const acted = vi.fn<(post: Post) => void>();

			mount({ onAction: acted });
			post(linked);

			act(() => link()?.click());

			expect(acted).toHaveBeenCalledWith(linked);
			expect(standing()).toEqual([]);

		});

		it("should keep standing a post the handler puts up again", async () => {

			const retrying: Post = { ...linked, status: "pending", message: "Retrying", actionable: false };

			mount({ onAction: () => board().post(retrying) });
			post(linked);

			act(() => link()?.click());

			expect(standing()).toEqual([retrying]);

		});

		it("should show the message of a post that is not actionable as plain text", async () => {

			mount({ onAction: () => {} });
			post(failed);

			expect(link()).toBeNull();

		});

		it("should show the message of an actionable post as plain text where no handler is given", async () => {

			mount();
			post(linked);

			expect(link()).toBeNull();

		});

	});

	describe("dismiss all", () => {

		function all(): HTMLButtonElement | null {
			return document.querySelector("tile-toast > footer button");
		}

		it("should offer no global dismiss control for a single toast", async () => {

			mount();
			post(saving);

			expect(all()).toBeNull();

		});

		it("should offer no global dismiss control while a single toast is still shown", async () => {

			mount();
			post(saving, loading);
			clear(loading);

			expect(all()).toBeNull();

		});

		it("should offer a global dismiss control while several toasts are shown", async () => {

			mount();
			post(saving, loading);

			expect(all()?.getAttribute("aria-label")).toBe("Dismiss all");

		});

		it("should clear every post shown from the board", async () => {

			mount();
			post(saving, loading);

			act(() => all()?.click());

			expect(standing()).toEqual([]);

		});

		it("should leave standing the posts whose toasts timed out", async () => {

			mount({ timeout: 5000 });
			post(saved, loading, failed);
			elapse(5000);

			act(() => all()?.click());

			expect(standing()).toEqual([saved]);

		});

	});

});
