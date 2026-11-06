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

import { createState } from "@metreeca/core/state";
import { createElement, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useModel } from "./model.js";


interface Counter {

	readonly value: number;

	up(): this;

}

function createCounter({ start }: { start: number }) {
	return createState<Counter>({

		value: start,

		up() { return { value: this.value + 1 }; }

	});
}


/**
 * The counter of the last render, and the values every render showed.
 */
const seen = vi.fn<(counter: Counter) => void>();

function Probe({ start, tracked }: { start: number, tracked?: boolean }) {

	const counter = useModel(() => createCounter({ start }), tracked ? [start] : undefined);

	seen(counter);

	return createElement("output", {}, counter.value);

}

function mount(start: number, tracked?: boolean): void {
	act(() => render(createElement(Probe, { start, tracked }), document.body));
}

function counter(): Counter {
	return seen.mock.lastCall![0]; // test harness: Probe has rendered at least once
}

function text(): string {
	return document.body.textContent ?? "";
}

async function settled(expected: string): Promise<void> {
	await vi.waitFor(() => expect(text()).toBe(expected));
}


afterEach(async () => {
	act(() => render(null, document.body));
	seen.mockClear();
});


describe("useModel()", () => {

	it("should show the model as created", async () => {

		mount(1);

		expect(text()).toBe("1");

	});

	it("should render again after a transition", async () => {

		mount(1);

		act(() => void counter().up());

		await settled("2");

	});

	describe("without dependencies", () => {

		it("should keep the model across prop changes", async () => {

			mount(1);

			act(() => void counter().up());

			await settled("2");

			mount(10);

			expect(text()).toBe("2");

		});

	});

	describe("with dependencies", () => {

		it("should keep the model while dependencies are unchanged", async () => {

			mount(1, true);

			act(() => void counter().up());

			await settled("2");

			mount(1, true);

			expect(text()).toBe("2");

		});

		it("should create the model again when a dependency changes", async () => {

			mount(1, true);

			act(() => void counter().up());

			await settled("2");

			mount(10, true);

			expect(text()).toBe("10");

		});

		it("should return the new model in the render the change shows up in", async () => {

			mount(1, true);

			seen.mockClear();

			mount(10, true);

			expect(seen.mock.calls.map(([counter]) => counter.value)).not.toContain(1);

		});

		it("should keep following transitions on the new model", async () => {

			mount(1, true);
			mount(10, true);

			act(() => void counter().up());

			await settled("11");

		});

		it("should ignore transitions on a superseded model", async () => {

			mount(1, true);

			const superseded = counter();

			mount(10, true);

			act(() => void superseded.up());

			await new Promise(resolve => setTimeout(resolve, 10)); // the notification of a transition is asynchronous

			expect(text()).toBe("10");

		});

	});

});
