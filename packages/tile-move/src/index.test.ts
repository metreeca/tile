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

import { type DragEndEvent, type DragOverEvent, type DragStartEvent } from "@dnd-kit/dom";
import { isSortable } from "@dnd-kit/dom/sortable";
import { type ComponentChild, createElement, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { DragDrop, useDroppable, useSortable } from "./index.core.js";


function Droppable({ id }: { id: string }) {

	const { target } = useDroppable({ id, element: id });

	return createElement("div", { id, "data-state": target ? "target" : "idle" });

}

function Sortable({ id, index = 0, group, disabled }: { id: string, index?: number, group?: string, disabled?: boolean }) {

	const { dragging, dropping, target } = useSortable({ id, element: id, index, group, disabled });

	return createElement("div", {
		id, "data-state": dragging ? "dragging" : dropping ? "dropping" : target ? "target" : "idle"
	});

}


/**
 * Renders a node into the page, waiting for the bindings to settle after the render.
 */
async function mount(node: ComponentChild): Promise<void> {

	act(() => render(node, document.body));

	await act(async () => new Promise(resolve => setTimeout(resolve, 50)));

}

function state(id: string): null | string {
	return document.getElementById(id)?.dataset.state ?? null;
}

/**
 * Presses a key on an element, as the keyboard sensor expects it.
 */
async function press(id: string, code: string): Promise<void> {
	await act(async () => {

		document.getElementById(id)?.dispatchEvent(new KeyboardEvent("keydown", { code, key: code, bubbles: true }));

		await new Promise(resolve => setTimeout(resolve, 50));

	});
}


beforeAll(async () => { // test harness: happy-dom implements no Web Animations, which dnd-kit queries while measuring
	Object.assign(document, { getAnimations: document.getAnimations ?? (() => []) });
});

beforeAll(async () => { // test harness: happy-dom lays out nothing, so bound elements stand in a column, in page order

	vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {

		const row = [...document.querySelectorAll("[id]")].indexOf(this);

		return row < 0 ? new DOMRect(0, 0, 400, 400) : new DOMRect(0, row * 100, 100, 50);

	});

});

afterEach(async () => {
	act(() => render(null, document.body));
});


describe("DragDrop", () => {

	it("should render its children", async () => {

		await mount(createElement(DragDrop, {}, createElement("p", {}, "nested")));

		expect(document.body.textContent).toBe("nested");

	});

	it("should notify the start of a drag", async () => {

		const onDragStart = vi.fn<(event: DragStartEvent) => void>();

		await mount(createElement(DragDrop, { onDragStart }, createElement(Sortable, { id: "card" })));
		await press("card", "Space");

		expect(onDragStart).toHaveBeenCalledOnce();
		expect(onDragStart.mock.lastCall?.[0].operation.source?.id).toBe("card");

	});

	it("should notify a move over a drop target", async () => {

		const onDragOver = vi.fn<(event: DragOverEvent) => void>();

		await mount(createElement(DragDrop, { onDragOver },
			createElement(Sortable, { id: "card" }),
			createElement(Droppable, { id: "bin" })
		));

		await press("card", "Space");
		await press("card", "ArrowDown");

		expect(onDragOver).toHaveBeenCalled();
		expect(onDragOver.mock.lastCall?.[0].operation.target?.id).toBe("bin");

	});

	it("should notify a drop", async () => {

		const onDragEnd = vi.fn<(event: DragEndEvent) => void>();

		await mount(createElement(DragDrop, { onDragEnd }, createElement(Sortable, { id: "card" })));
		await press("card", "Space");
		await press("card", "Space");

		expect(onDragEnd).toHaveBeenCalledOnce();
		expect(onDragEnd.mock.lastCall?.[0].canceled).toBe(false);

	});

	it("should notify a cancellation", async () => {

		const onDragEnd = vi.fn<(event: DragEndEvent) => void>();

		await mount(createElement(DragDrop, { onDragEnd }, createElement(Sortable, { id: "card" })));
		await press("card", "Space");
		await press("card", "Escape");

		expect(onDragEnd).toHaveBeenCalledOnce();
		expect(onDragEnd.mock.lastCall?.[0].canceled).toBe(true);

	});

	it("should notify the handlers of the latest render", async () => {

		const earlier = vi.fn<(event: DragStartEvent) => void>();
		const latest = vi.fn<(event: DragStartEvent) => void>();

		await mount(createElement(DragDrop, { onDragStart: earlier }, createElement(Sortable, { id: "card" })));
		await mount(createElement(DragDrop, { onDragStart: latest }, createElement(Sortable, { id: "card" })));
		await press("card", "Space");

		expect(earlier).not.toHaveBeenCalled();
		expect(latest).toHaveBeenCalledOnce();

	});

	it("should keep bindings in different contexts apart", async () => {

		const onDragStart = vi.fn<(event: DragStartEvent) => void>();

		await mount(createElement("div", {},
			createElement(DragDrop, { onDragStart }),
			createElement(DragDrop, {}, createElement(Sortable, { id: "card" }))
		));

		await press("card", "Space");

		expect(onDragStart).not.toHaveBeenCalled();

	});

	describe("announcements", () => {

		function Named({ id, label }: { id: string, label?: string }) {

			useSortable({ id, element: id, index: 0 });

			return createElement("div", { id }, label);

		}

		function Labelled({ id, label }: { id: string, label: string }) {

			useSortable({ id, element: id, index: 0 });

			return createElement("div", { id, "aria-labelledby": `${id}-label` },
				createElement("span", { id: `${id}-label` }, label)
			);

		}

		function announcement(): string {
			return document.querySelector("[aria-live]")?.textContent ?? "";
		}


		it("should name the item picked up after its content", async () => {

			await mount(createElement(DragDrop, {}, createElement(Named, { id: "card", label: "Fix the login" })));
			await press("card", "Space");

			expect(announcement()).toBe("Picked up Fix the login.");

		});

		it("should name the item picked up after the label it refers to", async () => {

			await mount(createElement(DragDrop, {}, createElement(Labelled, { id: "card", label: "Book the room" })));
			await press("card", "Space");

			expect(announcement()).toBe("Picked up Book the room.");

		});

		it("should name the item picked up after its id, if it carries no text", async () => {

			await mount(createElement(DragDrop, {}, createElement(Named, { id: "card" })));
			await press("card", "Space");

			expect(announcement()).toBe("Picked up card.");

		});

		it("should name the item dropped over a target", async () => {

			await mount(createElement(DragDrop, {},
				createElement(Named, { id: "card", label: "Fix the login" }),
				createElement(Droppable, { id: "bin" })
			));

			await press("card", "Space");
			await press("card", "ArrowDown");
			await press("card", "Space");

			expect(announcement()).toBe("Fix the login was dropped over bin.");

		});

		it("should name the item dropped over no target", async () => {

			await mount(createElement(DragDrop, {}, createElement(Named, { id: "card", label: "Fix the login" })));
			await press("card", "Space");
			await press("card", "Space");

			expect(announcement()).toBe("Fix the login was dropped.");

		});

		it("should name the item dropped where it stands as dropped over no target", async () => {

			await mount(createElement(DragDrop, {},
				createElement("div", { id: "list" }, createElement(Sortable, { id: "card" }))
			));

			await press("card", "Space");
			await press("card", "Space");

			expect(announcement()).toBe("card was dropped.");

		});

		it("should name the item sent back", async () => {

			await mount(createElement(DragDrop, {}, createElement(Named, { id: "card", label: "Fix the login" })));
			await press("card", "Space");
			await press("card", "Escape");

			expect(announcement()).toBe("Dragging was cancelled. Fix the login was dropped.");

		});

		it("should read out the instructions for an item that can be dragged", async () => {

			await mount(createElement(DragDrop, {}, createElement(Named, { id: "card", label: "Fix the login" })));

			const description = document.getElementById("card")?.getAttribute("aria-describedby") ?? "";

			expect(document.getElementById(description)?.textContent).toBe("To pick up a draggable item, press the space"
				+ " bar. While dragging, use the arrow keys to move the item in a given direction. Press space again to drop"
				+ " the item in its new position, or press escape to cancel.");

		});

	});

});

describe("useDroppable()", () => {

	it("should not be a target at first", async () => {

		await mount(createElement(DragDrop, {}, createElement(Droppable, { id: "bin" })));

		expect(state("bin")).toBe("idle");

	});

	it("should be a target while a dragged element hovers over it", async () => {

		await mount(createElement(DragDrop, {},
			createElement(Sortable, { id: "card" }),
			createElement(Droppable, { id: "bin" })
		));

		await press("card", "Space");
		await press("card", "ArrowDown");

		expect(state("bin")).toBe("target");

	});

	it("should stay inert outside any context", async () => {

		await mount(createElement(Droppable, { id: "bin" }));

		expect(state("bin")).toBe("idle");

	});

});

describe("useSortable()", () => {

	it("should not be dragging at first", async () => {

		await mount(createElement(DragDrop, {}, createElement(Sortable, { id: "item" })));

		expect(state("item")).toBe("idle");

	});

	it("should be dragging while picked up", async () => {

		await mount(createElement(DragDrop, {}, createElement(Sortable, { id: "item" })));
		await press("item", "Space");

		expect(state("item")).toBe("dragging");

	});

	it("should stop dragging once cancelled", async () => {

		await mount(createElement(DragDrop, {}, createElement(Sortable, { id: "item" })));
		await press("item", "Space");
		await press("item", "Escape");

		expect(state("item")).not.toBe("dragging");

	});

	it("should not start dragging while disabled", async () => {

		const onDragStart = vi.fn<(event: DragStartEvent) => void>();

		await mount(createElement(DragDrop, { onDragStart }, createElement(Sortable, { id: "item", disabled: true })));
		await press("item", "Space");

		expect(onDragStart).not.toHaveBeenCalled();
		expect(state("item")).toBe("idle");

	});

	it("should follow the disabled state of the latest render", async () => {

		const onDragStart = vi.fn<(event: DragStartEvent) => void>();

		await mount(createElement(DragDrop, { onDragStart }, createElement(Sortable, { id: "item", disabled: true })));
		await mount(createElement(DragDrop, { onDragStart }, createElement(Sortable, { id: "item", disabled: false })));
		await press("item", "Space");

		expect(onDragStart).toHaveBeenCalledOnce();

	});

	it("should take part in drags as a sortable item at the given place", async () => {

		const onDragStart = vi.fn<(event: DragStartEvent) => void>();

		await mount(createElement(DragDrop, { onDragStart },
			createElement(Sortable, { id: "item", index: 1, group: "list" })
		));

		await press("item", "Space");

		const source = onDragStart.mock.lastCall?.[0].operation.source ?? null;

		expect(isSortable(source) && [source.index, source.group]).toEqual([1, "list"]);

	});

	it("should follow the place of the latest render", async () => {

		const onDragStart = vi.fn<(event: DragStartEvent) => void>();

		await mount(createElement(DragDrop, { onDragStart },
			createElement(Sortable, { id: "item", index: 0, group: "one" })
		));

		await mount(createElement(DragDrop, { onDragStart },
			createElement(Sortable, { id: "item", index: 2, group: "two" })
		));

		await press("item", "Space");

		const source = onDragStart.mock.lastCall?.[0].operation.source ?? null;

		expect(isSortable(source) && [source.index, source.group]).toEqual([2, "two"]);

	});

	it("should stay inert outside any context", async () => {

		await mount(createElement(Sortable, { id: "item" }));
		await press("item", "Space");

		expect(state("item")).toBe("idle");

	});

});
