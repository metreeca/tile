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
import { afterEach, describe, expect, it, vi } from "vitest";

import { useStorage } from "./storage.js";


/**
 * The setter of the last render.
 */
const seen = vi.fn<(set: (value: string | undefined) => void) => void>();

function Probe({ storage = localStorage, entry = "entry" }: { storage?: Storage, entry?: string }) {

	const [value, set] = useStorage(storage, entry, () => "initial");

	seen(set);

	return createElement("output", {}, value);

}

function mount(props: { storage?: Storage, entry?: string } = {}): void {
	act(() => render(createElement(Probe, props), document.body));
}

function set(value: string | undefined): void {
	act(() => seen.mock.lastCall![0](value)); // test harness: Probe has rendered at least once
}

function text(): string {
	return document.body.textContent ?? "";
}

/**
 * Writes an entry as another page would, notifying the change the way the browser does.
 */
function external(storage: Storage, key: string | null, value: string | null): void {
	act(() => {

		if ( key === null ) {
			storage.clear();
		} else if ( value === null ) {
			storage.removeItem(key);
		} else {
			storage.setItem(key, value);
		}

		window.dispatchEvent(new StorageEvent("storage", { key, newValue: value, storageArea: storage }));

	});
}


afterEach(async () => {
	act(() => render(null, document.body));
	localStorage.clear();
	sessionStorage.clear();
	seen.mockClear();
});


describe("useStorage()", () => {

	describe("reading", () => {

		it("should show the initial value of an empty entry", async () => {

			mount();

			expect(text()).toBe("initial");

		});

		it("should show the stored value", async () => {

			localStorage.setItem("entry", JSON.stringify("stored"));

			mount();

			expect(text()).toBe("stored");

		});

		it("should read from the given storage area", async () => {

			localStorage.setItem("entry", JSON.stringify("local"));
			sessionStorage.setItem("entry", JSON.stringify("session"));

			mount({ storage: sessionStorage });

			expect(text()).toBe("session");

		});

		it("should not write the initial value", async () => {

			mount();

			expect(localStorage.getItem("entry")).toBeNull();

		});

	});

	describe("writing", () => {

		it("should show the value set", async () => {

			mount();
			set("updated");

			expect(text()).toBe("updated");

		});

		it("should store the value set as JSON", async () => {

			mount();
			set("updated");

			expect(localStorage.getItem("entry")).toBe(JSON.stringify("updated"));

		});

		it("should keep the value set across mounts", async () => {

			mount();
			set("updated");

			act(() => render(null, document.body));

			mount();

			expect(text()).toBe("updated");

		});

		it("should remove the entry when set to undefined", async () => {

			mount();
			set("updated");
			set(undefined);

			expect(localStorage.getItem("entry")).toBeNull();
			expect(text()).toBe("initial");

		});

	});

	describe("following other pages", () => {

		it("should show a value written elsewhere", async () => {

			mount();
			external(localStorage, "entry", JSON.stringify("external"));

			expect(text()).toBe("external");

		});

		it("should show the initial value once the entry is removed elsewhere", async () => {

			localStorage.setItem("entry", JSON.stringify("stored"));

			mount();
			external(localStorage, "entry", null);

			expect(text()).toBe("initial");

		});

		it("should show the initial value once the storage area is cleared elsewhere", async () => {

			localStorage.setItem("entry", JSON.stringify("stored"));

			mount();
			external(localStorage, null, null);

			expect(text()).toBe("initial");

		});

		it("should ignore changes to other entries", async () => {

			mount();
			external(localStorage, "other", JSON.stringify("external"));

			expect(text()).toBe("initial");

		});

		it("should ignore changes to other storage areas", async () => {

			mount({ storage: sessionStorage });
			external(localStorage, "entry", JSON.stringify("external"));

			expect(text()).toBe("initial");

		});

		it("should stop following once unmounted", async () => {

			mount();

			act(() => render(null, document.body));

			external(localStorage, "entry", JSON.stringify("external"));

			expect(text()).toBe("");

		});

	});

	describe("changing the entry", () => {

		it("should show the value of the new entry", async () => {

			localStorage.setItem("other", JSON.stringify("other"));

			mount();
			mount({ entry: "other" });

			expect(text()).toBe("other");

		});

		it("should follow the new entry", async () => {

			mount();
			mount({ entry: "other" });

			external(localStorage, "other", JSON.stringify("external"));

			expect(text()).toBe("external");

		});

		it("should stop following the previous entry", async () => {

			mount();
			mount({ entry: "other" });

			external(localStorage, "entry", JSON.stringify("external"));

			expect(text()).toBe("initial");

		});

		it("should write to the new entry", async () => {

			mount();
			mount({ entry: "other" });
			set("updated");

			expect(localStorage.getItem("other")).toBe(JSON.stringify("updated"));
			expect(localStorage.getItem("entry")).toBeNull();

		});

	});

});
