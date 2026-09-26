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

import { reference } from "@metreeca/blue/reference";
import { id, multiple, required, resource as shaped, type ResourceShape } from "@metreeca/blue/resource";
import { string } from "@metreeca/blue/string";
import { Conflict, NotFound } from "@metreeca/http";
import type { Store as Backend, StoreObserver } from "@metreeca/keep";
import type { Template } from "@metreeca/qest/model";
import { createElement, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";

import { type Items, Store, useCollection, useResource, useStore } from "./store.js";


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

function mount(store: Backend, target: string = entry): () => Binding {

	const seen = vi.fn<(binding: Binding) => void>();

	function Probe() {

		const binding = useResource({ entry: target, shape, model });

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

function orphan(hook: () => unknown): () => void {

	function Probe() {

		hook();

		return null;

	}

	return () => act(() => render(createElement(Probe, {}), document.body));
}


/**
 * The Node process the tests run in, reduced to the unhandled rejection events: the package compiles against the
 * DOM alone, with no Node type definitions.
 */
declare const process: {
	on(event: "unhandledRejection", listener: (reason: unknown) => void): void
	off(event: "unhandledRejection", listener: (reason: unknown) => void): void
};

/**
 * Collects the rejections nobody handled, as the page would take them up.
 */
const unhandled = vi.fn<(reason: unknown) => void>();


beforeEach(async () => {
	process.on("unhandledRejection", unhandled);
});

afterEach(async () => {
	act(() => render(null, document.body));
	process.off("unhandledRejection", unhandled);
	unhandled.mockClear();
	vi.unstubAllGlobals();
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe("useStore()", () => {

	it("should retrieve the store offered by the enclosing context", async () => {

		const store = backend({});
		const seen = vi.fn<(store: Backend) => void>();

		function Probe() {

			seen(useStore());

			return null;

		}

		act(() => render(createElement(Store, {
			factory: () => store,
			children: createElement(Probe, {})
		}), document.body));

		expect(seen).toHaveBeenCalledWith(store);

	});

	it("should throw outside a store context", async () => {
		expect(orphan(useStore)).toThrow("missing <Store> context");
	});

});

describe("useResource()", () => {

	it("should throw outside a store context", async () => {
		expect(orphan(() => useResource({ entry, shape, model }))).toThrow("missing <Store> context");
	});

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

		it("should resolve a relative identifier against the current location", async () => {

			vi.stubGlobal("location", { href: "https://example.com/page" });

			const lookup = vi.fn(async () => resource);

			mount(backend({ lookup }), "resource");

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

		it("should report a failed retrieval through the binding only", async () => {

			mount(backend({ lookup: async () => { throw { status: 503 }; } }));

			await settled("error 503");

			await new Promise(resolve => setTimeout(resolve)); // an unhandled rejection is detected once the task ends

			expect(unhandled).not.toHaveBeenCalled();

		});

		it("should keep the resource until another one is retrieved", async () => {

			const lookup = vi.fn().mockResolvedValueOnce(resource).mockReturnValue(new Promise(() => {}));
			const store = backend({ lookup });

			function Probe({ entry }: { readonly entry: string }) {
				return createElement("output", {}, useResource({ entry, shape, model })({
					blank: "blank",
					ready: ({ state }) => `ready ${JSON.stringify(state)}`,
					stale: ({ state }) => `stale ${JSON.stringify(state)}`,
					error: ({ state }) => `error ${state.status}`
				}));
			}

			function bind(entry: string): void {
				act(() => render(createElement(Store, {
					factory: () => store,
					children: createElement(Probe, { entry })
				}), document.body));
			}

			bind(entry);

			await settled(`ready ${JSON.stringify(resource)}`);

			bind("https://example.com/other");

			expect(lookup).toHaveBeenLastCalledWith({ entry: "https://example.com/other", shape, model });
			expect(text()).toBe(`ready ${JSON.stringify(resource)}`);

		});

		it("should retrieve the resource again as the template changes, keeping it meanwhile", async () => {

			const lookup = vi.fn().mockResolvedValueOnce(resource).mockReturnValue(new Promise(() => {}));
			const store = backend({ lookup });

			function Probe({ model }: { readonly model: Template }) {
				return createElement("output", {}, useResource({ entry, shape, model })({
					blank: "blank",
					ready: ({ state }) => `ready ${JSON.stringify(state)}`,
					stale: ({ state }) => `stale ${JSON.stringify(state)}`,
					error: ({ state }) => `error ${state.status}`
				}));
			}

			function bind(model: Template): void {
				act(() => render(createElement(Store, {
					factory: () => store,
					children: createElement(Probe, { model })
				}), document.body));
			}

			bind(model);

			await settled(`ready ${JSON.stringify(resource)}`);

			const wider = { ...model, id: {} };

			bind(wider);

			expect(lookup).toHaveBeenLastCalledWith({ entry, shape, model: wider });
			expect(text()).toBe(`ready ${JSON.stringify(resource)}`);

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

		it("should report a failed refresh through the binding only", async () => {

			const lookup = vi.fn().mockResolvedValueOnce(resource).mockRejectedValue({ status: 503 });
			const observe = vi.fn((_observer: StoreObserver) => () => {});

			mount(backend({ lookup, observe }));

			await settled(`ready ${JSON.stringify(resource)}`);

			await act(async () => observe.mock.calls.forEach(([observer]) => observer({ [entry]: true })));

			await settled("error 503");

			await new Promise(resolve => setTimeout(resolve)); // an unhandled rejection is detected once the task ends

			expect(unhandled).not.toHaveBeenCalled();

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

		it("should leave a failed write to the caller", async () => {

			const binding = mount(backend({ update: async () => { throw { status: 422 }; } }));

			await settled(`ready ${JSON.stringify(resource)}`);

			await expect(binding()({ ready: ({ update }) => update(resource) })).rejects.toMatchObject({ status: 422 });

			await settled("error 422");

			await new Promise(resolve => setTimeout(resolve)); // an unhandled rejection is detected once the task ends

			expect(unhandled).not.toHaveBeenCalled();

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

describe("useCollection()", () => {

	const Item = shaped({ id: id(), label: required(string()) });
	const Catalogue = shaped({ id: id(), members: multiple(reference(Item)) });

	const field = "members";
	const items = [{ id: "https://example.com/resource/1", label: "one" }];

	type Collection = ReturnType<typeof useCollection<typeof Catalogue, typeof field, typeof model>>;


	function collection(overrides: { readonly [K in keyof Backend]?: unknown }): Backend {
		return backend({ lookup: async () => ({ members: items }), ...overrides });
	}

	function mount(store: Backend, target: string = entry): () => Collection {

		const seen = vi.fn<(binding: Collection) => void>();

		function Probe() {

			const binding = useCollection({ entry: target, field, shape: Catalogue, model });

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


	it("should throw outside a store context", async () => {
		expect(orphan(() => useCollection({ entry, field, shape: Catalogue, model }))).toThrow("missing <Store> context");
	});

	describe("retrieval", () => {

		it("should be blank until the collection is retrieved", async () => {

			mount(collection({ lookup: () => new Promise(() => {}) }));

			expect(text()).toBe("blank");

		});

		it("should retrieve the items through the property collecting them", async () => {

			const lookup = vi.fn(async () => ({ members: items }));

			mount(collection({ lookup }));

			await settled(`ready ${JSON.stringify(items)}`);

			expect(lookup).toHaveBeenCalledWith({ entry, shape: Catalogue, model: { members: model } });

		});

		it("should resolve a relative identifier against the current location", async () => {

			vi.stubGlobal("location", { href: "https://example.com/page" });

			const lookup = vi.fn(async () => ({ members: items }));

			mount(collection({ lookup }), "resource");

			await settled(`ready ${JSON.stringify(items)}`);

			expect(lookup).toHaveBeenCalledWith({ entry, shape: Catalogue, model: { members: model } });

		});

		it("should take a collection left out of the resource as empty", async () => {

			mount(collection({ lookup: async () => ({}) }));

			await settled("ready []");

		});

		it("should type the items as the template narrows them", async () => {

			expectTypeOf<Items<typeof Catalogue, typeof field, typeof model>>()
				.toEqualTypeOf<readonly { readonly label: string }[]>();

		});

		it("should move to error on a missing resource", async () => {

			mount(collection({ lookup: async () => undefined }));

			await settled(`error ${NotFound}`);

		});

		it("should move to error on a failed retrieval", async () => {

			mount(collection({ lookup: async () => { throw { status: 503 }; } }));

			await settled("error 503");

		});

		it("should report a failed retrieval through the binding only", async () => {

			mount(collection({ lookup: async () => { throw { status: 503 }; } }));

			await settled("error 503");

			await new Promise(resolve => setTimeout(resolve)); // an unhandled rejection is detected once the task ends

			expect(unhandled).not.toHaveBeenCalled();

		});

	});

	describe("change tracking", () => {

		it("should observe changes to the resource holding the collection", async () => {

			const observe = vi.fn(() => () => {});

			mount(collection({ observe }));

			await settled(`ready ${JSON.stringify(items)}`);

			expect(observe).toHaveBeenCalledWith(expect.any(Function), entry);

		});

		it("should be stale while the collection is refreshed", async () => {

			const lookup = vi.fn().mockResolvedValueOnce({ members: items }).mockReturnValue(new Promise(() => {}));
			const observe = vi.fn((_observer: StoreObserver) => () => {});

			mount(collection({ lookup, observe }));

			await settled(`ready ${JSON.stringify(items)}`);

			await act(async () => observe.mock.calls.forEach(([observer]) => observer({ [entry]: true })));

			await settled(`stale ${JSON.stringify(items)}`);

		});

	});

	describe("create()", () => {

		const item = { label: "two" };
		const location = "https://example.com/resource/2";

		it("should add the item to the collection, resolving to its identifier", async () => {

			const create = vi.fn(async () => location);

			const binding = mount(collection({ create }));

			await settled(`ready ${JSON.stringify(items)}`);

			await expect(binding()({ ready: ({ create }) => create(item) })).resolves.toBe(location);

			expect(create).toHaveBeenCalledWith({ entry, shape: Item, state: item });

		});

		it("should reject on an existing item, moving to error", async () => {

			const binding = mount(collection({ create: async () => undefined }));

			await settled(`ready ${JSON.stringify(items)}`);

			await expect(binding()({ ready: ({ create }) => create(item) })).rejects.toMatchObject({ status: Conflict });

			await settled(`error ${Conflict}`);

		});

		it("should reject on a failed creation, moving to error", async () => {

			const binding = mount(collection({ create: async () => { throw { status: 422 }; } }));

			await settled(`ready ${JSON.stringify(items)}`);

			await expect(binding()({ ready: ({ create }) => create(item) })).rejects.toMatchObject({ status: 422 });

			await settled("error 422");

		});

	});

	describe("reload()", () => {

		it("should retrieve the collection again, discarding the error", async () => {

			const lookup = vi.fn().mockResolvedValueOnce(undefined).mockResolvedValue({ members: items });

			const binding = mount(collection({ lookup }));

			await settled(`error ${NotFound}`);

			await binding()({ error: ({ reload }) => reload() });

			await settled(`ready ${JSON.stringify(items)}`);

		});

	});

});
