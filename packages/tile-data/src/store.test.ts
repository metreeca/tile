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

import type { ResourceShape } from "@metreeca/blue/resource";
import { NotFound } from "@metreeca/http";
import type { Store as Backend, StoreObserver } from "@metreeca/keep";
import type { Template } from "@metreeca/qest/model";
import { createElement, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Store, useResource } from "./store.js";


const entry = "https://example.com/resource";

const shape = {} as ResourceShape; // ;(cast) test mock: the fake store never reads the shape
const model = { label: {} } satisfies Template;

const resource = { id: entry, label: "resource" };


type Binding = ReturnType<typeof useResource<typeof shape, typeof model>>;


function backend(overrides: { readonly [K in keyof Backend]?: unknown }): Backend {
	return {
		lookup: async () => resource,
		observe: () => () => {},
		...overrides
	} as Backend; // ;(cast) test mock: only the members the hook calls are provided
}

function mount(store: Backend): () => Binding {

	const seen = vi.fn<(binding: Binding) => void>();

	function Probe() {

		const binding = useResource({ entry, shape, model });

		seen(binding);

		return createElement("output", {}, binding({
			blank: "blank",
			ready: ({ state }) => `ready ${JSON.stringify(state)}`,
			stale: ({ state }) => `stale ${JSON.stringify(state)}`,
			error: ({ state }) => `error ${state.status}`
		}));

	}

	act(() => render(createElement(Store, {
		factory: () => store,
		children: createElement(Probe, {})
	}), document.body));

	return () => seen.mock.lastCall![0]; // test harness: Probe has rendered at least once
}

function text(): string {
	return document.body.textContent ?? "";
}

async function settled(expected: string): Promise<void> {
	await vi.waitFor(() => expect(text()).toBe(expected));
}


afterEach(async () => {
	act(() => render(null, document.body));
});


describe("useResource()", () => {

	describe("retrieval", () => {

		it("should be blank until the resource is retrieved", async () => {

			mount(backend({ lookup: () => new Promise(() => {}) }));

			expect(text()).toBe("blank");

		});

		it("should retrieve the resource from the shared store", async () => {

			const lookup = vi.fn(async () => resource);

			mount(backend({ lookup }));

			await settled(`ready ${JSON.stringify(resource)}`);

			expect(lookup).toHaveBeenCalledWith({ entry, shape, model });

		});

		it("should move to error on a missing resource", async () => {

			mount(backend({ lookup: async () => undefined }));

			await settled(`error ${NotFound}`);

		});

		it("should move to error on a failed retrieval", async () => {

			mount(backend({ lookup: async () => { throw { status: 503, title: "Service Unavailable" }; } }));

			await settled("error 503");

		});

	});

	describe("change tracking", () => {

		it("should observe changes to the bound resource only", async () => {

			const observe = vi.fn(() => () => {});

			mount(backend({ observe }));

			await settled(`ready ${JSON.stringify(resource)}`);

			expect(observe).toHaveBeenCalledWith(expect.any(Function), entry);

		});

		it("should retrieve the resource again as the store signals a change to it", async () => {

			const updated = { ...resource, label: "updated" };

			const lookup = vi.fn().mockResolvedValueOnce(resource).mockResolvedValue(updated);
			const observe = vi.fn((_observer: StoreObserver) => () => {});

			mount(backend({ lookup, observe }));

			await settled(`ready ${JSON.stringify(resource)}`);

			await act(async () => observe.mock.calls.forEach(([observer]) => observer({ [entry]: true })));

			await settled(`ready ${JSON.stringify(updated)}`);

		});

		it("should be stale while the resource is refreshed", async () => {

			const lookup = vi.fn().mockResolvedValueOnce(resource).mockReturnValue(new Promise(() => {}));
			const observe = vi.fn((_observer: StoreObserver) => () => {});

			mount(backend({ lookup, observe }));

			await settled(`ready ${JSON.stringify(resource)}`);

			await act(async () => observe.mock.calls.forEach(([observer]) => observer({ [entry]: true })));

			await settled(`stale ${JSON.stringify(resource)}`);

		});

		it("should move to error on a failed refresh", async () => {

			const lookup = vi.fn().mockResolvedValueOnce(resource).mockRejectedValue({ status: 503 });
			const observe = vi.fn((_observer: StoreObserver) => () => {});

			mount(backend({ lookup, observe }));

			await settled(`ready ${JSON.stringify(resource)}`);

			await act(async () => observe.mock.calls.forEach(([observer]) => observer({ [entry]: true })));

			await settled("error 503");

		});

		it("should stop observing the store as the component goes away", async () => {

			const detach = vi.fn();

			mount(backend({ observe: () => detach }));

			await settled(`ready ${JSON.stringify(resource)}`);

			act(() => render(null, document.body));

			expect(detach).toHaveBeenCalled();

		});

	});

	describe("update()", () => {

		it("should write the resource back to the store", async () => {

			const update = vi.fn(async () => entry);

			const binding = mount(backend({ update }));

			await settled(`ready ${JSON.stringify(resource)}`);

			await binding()({ ready: ({ update }) => update(resource) });

			expect(update).toHaveBeenCalledWith({ entry, shape, state: resource });

		});

		it("should reject on a missing resource, moving to error", async () => {

			const binding = mount(backend({ update: async () => undefined }));

			await settled(`ready ${JSON.stringify(resource)}`);

			await expect(binding()({ ready: ({ update }) => update(resource) })).rejects.toMatchObject({ status: NotFound });

			await settled(`error ${NotFound}`);

		});

		it("should reject on a failed write, moving to error", async () => {

			const binding = mount(backend({ update: async () => { throw { status: 422 }; } }));

			await settled(`ready ${JSON.stringify(resource)}`);

			await expect(binding()({ ready: ({ update }) => update(resource) })).rejects.toMatchObject({ status: 422 });

			await settled("error 422");

		});

	});

	describe("delete()", () => {

		it("should remove the resource from the store, resolving to its parent collection", async () => {

			const remove = vi.fn(async () => entry);

			const binding = mount(backend({ delete: remove }));

			await settled(`ready ${JSON.stringify(resource)}`);

			const parent = await binding()({ ready: ({ delete: remove }) => remove() });

			expect(remove).toHaveBeenCalledWith({ entry, shape });
			expect(parent).toBe("https://example.com/");

		});

		it("should reject on a missing resource, moving to error", async () => {

			const binding = mount(backend({ delete: async () => undefined }));

			await settled(`ready ${JSON.stringify(resource)}`);

			await expect(binding()({ ready: ({ delete: remove }) => remove() })).rejects.toMatchObject({ status: NotFound });

			await settled(`error ${NotFound}`);

		});

		it("should reject on a failed removal, moving to error", async () => {

			const binding = mount(backend({ delete: async () => { throw { status: 409 }; } }));

			await settled(`ready ${JSON.stringify(resource)}`);

			await expect(binding()({ ready: ({ delete: remove }) => remove() })).rejects.toMatchObject({ status: 409 });

			await settled("error 409");

		});

	});

	describe("reload()", () => {

		it("should retrieve the resource again, discarding the error", async () => {

			const lookup = vi.fn().mockResolvedValueOnce(undefined).mockResolvedValue(resource);

			const binding = mount(backend({ lookup }));

			await settled(`error ${NotFound}`);

			await binding()({ error: ({ reload }) => reload() });

			await settled(`ready ${JSON.stringify(resource)}`);

		});

		it("should reject on a failed retrieval, moving to error", async () => {

			const lookup = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValue({ status: 503 });

			const binding = mount(backend({ lookup }));

			await settled(`error ${NotFound}`);

			await expect(binding()({ error: ({ reload }) => reload() })).rejects.toMatchObject({ status: 503 });

			await settled("error 503");

		});

	});

});
