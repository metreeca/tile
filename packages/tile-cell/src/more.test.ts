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

import { createElement, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { More } from "./more.js";


/*
 * The page offers no viewport to scroll, so a stand-in observer tracks the elements watched and lets a test bring
 * them into view or take them out of it.
 */

const watched = new Set<Element>();

const callbacks = new Map<Element, IntersectionObserverCallback>();


class Observer {

	readonly #callback: IntersectionObserverCallback;

	constructor(callback: IntersectionObserverCallback) {
		this.#callback = callback;
	}

	observe(element: Element): void {
		watched.add(element);
		callbacks.set(element, this.#callback);
	}

	unobserve(element: Element): void {
		watched.delete(element);
	}

	disconnect(): void {
		[...callbacks].filter(([, callback]) => callback === this.#callback).forEach(([element]) => watched.delete(element));
	}

}


function scroll(isIntersecting: boolean): void {
	act(() => [...watched].forEach(target => callbacks.get(target)?.(
		[{ target, isIntersecting } as unknown as IntersectionObserverEntry], // ;(test stub) the entry fields read
		{} as IntersectionObserver // ;(test stub) the observer argument is never read
	)));
}

function mount(options: Parameters<typeof More>[0]): void {
	act(() => render(createElement(More, options), document.body));
}


beforeEach(async () => {
	vi.stubGlobal("IntersectionObserver", Observer);
});

afterEach(async () => {
	act(() => render(null, document.body));
	watched.clear();
	callbacks.clear();
	vi.unstubAllGlobals();
});


describe("More", () => {

	it("should show a turning mark by default", async () => {

		mount({ onLoad: () => {} });

		expect(document.querySelector("tile-more > svg")).not.toBeNull();

	});

	it("should show the content given in place of the mark", async () => {

		mount({ onLoad: () => {}, children: createElement("span", {}, "Loading") });

		expect(document.querySelector("tile-more")?.innerHTML).toBe("<span>Loading</span>");

	});

	describe("onLoad", () => {

		it("should ask for more once in view", async () => {

			const onLoad = vi.fn();

			mount({ onLoad });
			scroll(true);

			expect(onLoad).toHaveBeenCalledOnce();

		});

		it("should not ask for more while out of view", async () => {

			const onLoad = vi.fn();

			mount({ onLoad });
			scroll(false);

			expect(onLoad).not.toHaveBeenCalled();

		});

		it("should hand each request to the latest handler", async () => {

			const before = vi.fn();
			const after = vi.fn();

			mount({ onLoad: before });
			mount({ onLoad: after });
			scroll(true);

			expect(before).not.toHaveBeenCalled();
			expect(after).toHaveBeenCalledOnce();

		});

		it("should stop asking once removed", async () => {

			const onLoad = vi.fn();

			mount({ onLoad });
			act(() => render(null, document.body));
			scroll(true);

			expect(onLoad).not.toHaveBeenCalled();

		});

	});

});
