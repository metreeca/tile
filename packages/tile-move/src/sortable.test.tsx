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

import { type ComponentChildren, type JSX, render } from "preact";
import { useState } from "preact/hooks";
import { act } from "preact/test-utils";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { type Move } from "./sortable.core.js";
import { Sortable } from "./sortable.js";


describe("Sortable", () => {

	type Lists = Readonly<Record<string, readonly string[]>>;

	const board: Lists = { "To do": ["write", "test"], "Done": ["plan"], "Later": [] };

	const initial = [["write", "test"], ["plan"], []];
	const swapped = [["test", "write"], ["plan"], []];


	const swap: Move = { item: "test", from: { list: "To do", index: 1 }, to: { list: "To do", index: 0 } };


	function Board({

		surface,

		items = board,

		onMove,

		children = item => item

	}: {

		surface?: boolean

		items?: Lists

		onMove?: (move: Move) => void | false | Promise<unknown>

		children?: (item: string) => ComponentChildren

	}) {
		return <Sortable name="Board" surface={surface} items={items} onMove={onMove}>{children}</Sortable>;
	}

	/**
	 * Lays out lists giving every move back as it is handed over.
	 */
	function Adopting() {

		const [items, setItems] = useState(board);

		return <Board items={items} onMove={({ item, from, to }) => setItems(items => {

			const stripped = { ...items, [from.list]: items[from.list].filter(key => key !== item) };
			const target = stripped[to.list];

			return { ...stripped, [to.list]: [...target.slice(0, to.index), item, ...target.slice(to.index)] };

		})}/>;

	}


	/**
	 * Waits for the renders and the bindings a change brings about.
	 */
	async function settle(): Promise<void> {
		await act(async () => new Promise(resolve => setTimeout(resolve, 50)));
	}

	async function mount(element: JSX.Element): Promise<HTMLElement> {

		act(() => render(element, document.body));

		await settle();

		return document.body.querySelector<HTMLElement>(":scope > tile-sortable")!; // test harness: rendered above

	}

	function labels(sortable: HTMLElement): string[] {
		return [...sortable.querySelectorAll(":scope > section > header")].map(header => header.textContent ?? "");
	}

	/**
	 * Reads the items of each list in the order shown, which their flex order carries while the DOM keeps the order
	 * given, skipping the stand-in dnd-kit leaves while an item is carried.
	 */
	function contents(sortable: HTMLElement): string[][] {
		return [...sortable.querySelectorAll(":scope > section > ul")].map(list =>
			[...list.querySelectorAll<HTMLElement>(":scope > li:not([data-dnd-placeholder])")]
				.sort((x, y) => Number(x.style.order) - Number(y.style.order))
				.map(item => item.textContent ?? "")
		);
	}

	function items(sortable: HTMLElement): HTMLElement[] {
		return [...sortable.querySelectorAll<HTMLElement>("li:not([data-dnd-placeholder])")];
	}

	function item(sortable: HTMLElement, key: string): null | HTMLElement {
		return items(sortable).find(item => item.textContent?.startsWith(key)) ?? null;
	}

	/**
	 * Retrieves the handle of an item, the grip beside its content or the item itself if dragged by its surface.
	 */
	function handle(sortable: HTMLElement, key: string): null | HTMLElement {

		const entry = item(sortable, key);

		return entry?.hasAttribute("data-surface") ? entry : entry?.querySelector(":scope > button") ?? null;

	}

	function content(sortable: HTMLElement, key: string): null | HTMLElement {
		return item(sortable, key)?.querySelector(":scope > div") ?? null;
	}

	/**
	 * Gives an element the focus, waiting for the renders it brings about, as a reader's next key arrives after them.
	 */
	async function focus(element: null | HTMLElement): Promise<void> {

		act(() => element?.focus());

		await settle();

	}

	async function press(element: null | Element, code: string): Promise<void> {

		element?.dispatchEvent(new KeyboardEvent("keydown", { code, key: code, bubbles: true }));

		await settle();

	}

	/**
	 * Picks an item up from the keyboard, carries it with the keys given and drops it; the handle takes the focus
	 * first, as it does under a reader's hands.
	 */
	async function carry(sortable: HTMLElement, key: string, ...keys: readonly string[]): Promise<void> {

		await focus(handle(sortable, key));

		await press(handle(sortable, key), "Space");

		await keys.reduce((previous, code) => previous.then(() => press(handle(sortable, key), code)), Promise.resolve());

		await press(handle(sortable, key), "Space");

	}

	function pointer(type: string, x: number, pointerType: string = "mouse"): PointerEvent {
		return new PointerEvent(type, {
			bubbles: true, isPrimary: true, button: 0, pointerType, pointerId: 1, clientX: x, clientY: 50
		});
	}

	/**
	 * Presses the pointer on an element and moves it well past the distance a drag starts after, releasing it once it
	 * is known whether the item under it was picked up.
	 */
	async function point(element: null | Element): Promise<boolean> {

		await act(async () => { element?.dispatchEvent(pointer("pointerdown", 50)); });
		await act(async () => { document.dispatchEvent(pointer("pointermove", 60)); });

		document.dispatchEvent(pointer("pointermove", 90));

		await settle();

		const picked = element?.closest<HTMLElement>("li")?.dataset.state === "dragging";

		document.dispatchEvent(pointer("pointerup", 90));

		await settle();

		return picked;

	}

	/**
	 * Presses the pointer on an element and holds it still well past the delay a drag starts after, releasing it once
	 * it is known whether the item under it was picked up.
	 */
	async function hold(element: null | Element, pointerType: string = "mouse"): Promise<boolean> {

		await act(async () => {

			element?.dispatchEvent(pointer("pointerdown", 50, pointerType));

			await new Promise(resolve => setTimeout(resolve, 300));

		});

		const picked = element?.closest<HTMLElement>("li")?.dataset.state === "dragging";

		document.dispatchEvent(pointer("pointerup", 50, pointerType));

		await settle();

		return picked;

	}

	/**
	 * Creates a promise settled on demand, its resolver waiting for the renders the settlement brings about.
	 */
	function deferred(): { promise: Promise<void>, resolve: () => Promise<void> } {

		let resolve = () => {}; // test harness: a promise hands out its resolver only to its executor

		const promise = new Promise<void>(executor => resolve = executor);

		return {
			promise, resolve: async () => {

				resolve();

				await settle();

			}
		};

	}


	beforeAll(async () => { // test harness: happy-dom implements no Web Animations, which dnd-kit queries while measuring
		Object.assign(document, { getAnimations: document.getAnimations ?? (() => []) });
	});

	beforeAll(async () => { // test harness: happy-dom lays out nothing, so lists stand in columns and items in rows

		vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {

			const list = this.closest("section");
			const column = list ? [...list.parentElement?.children ?? []].indexOf(list) : 0;
			const entry = this.closest("li");
			const row = entry ? [...entry.parentElement?.children ?? []].indexOf(entry) : -1;

			return entry
				? new DOMRect(column * 200, 40 + row * 40, 180, 30)
				: new DOMRect(column * 200, 0, 180, 400);

		});

	});

	afterEach(async () => {
		act(() => render(null, document.body));
	});


	describe("rendering", () => {

		it("renders a section for each list, under its label, in order", async () => {

			expect(labels(await mount(<Board/>))).toEqual(["To do", "Done", "Later"]);

		});

		it("renders the items of each list, in order, through the content given", async () => {

			const sortable = await mount(<Board>{item => item.toUpperCase()}</Board>);

			expect(contents(sortable)).toEqual([["WRITE", "TEST"], ["PLAN"], []]);

		});

		it("names the set of lists", async () => {

			const sortable = await mount(<Board/>);

			expect([sortable.getAttribute("role"), sortable.getAttribute("aria-label")]).toEqual(["group", "Board"]);

		});

		it("names each list after its label", async () => {

			const sortable = await mount(<Board/>);

			const names = [...sortable.querySelectorAll(":scope > section > ul")].map(list =>
				document.getElementById(list.getAttribute("aria-labelledby") ?? "")?.textContent
			);

			expect(names).toEqual(["To do", "Done", "Later"]);

		});

		it("follows the items given", async () => {

			await mount(<Board/>);

			const sortable = await mount(<Board items={{ "To do": ["test"], "Done": ["plan", "write"] }}/>);

			expect(labels(sortable)).toEqual(["To do", "Done"]);
			expect(contents(sortable)).toEqual([["test"], ["plan", "write"]]);

		});

		it("rejects repeated item keys", async () => {

			await expect(mount(<Board items={{ one: ["a"], two: ["a"] }}/>)).rejects.toThrow(TypeError);

		});

	});

	describe("keyboard", () => {

		it("makes the lists a single tab stop", async () => {

			const sortable = await mount(<Board/>);

			expect(items(sortable).map(entry => handle(sortable, entry.textContent ?? "")?.getAttribute("tabindex")))
				.toEqual(["0", "-1", "-1"]);

		});

		it("moves the focus from item to item with the arrow keys", async () => {

			const sortable = await mount(<Board/>);

			await focus(handle(sortable, "write"));

			await press(handle(sortable, "write"), "ArrowDown");

			const next = document.activeElement;

			await press(handle(sortable, "test"), "ArrowRight");

			const last = document.activeElement;

			await press(handle(sortable, "plan"), "ArrowLeft");

			expect([next, last, document.activeElement]).toEqual([
				handle(sortable, "test"), handle(sortable, "plan"), handle(sortable, "test")
			]);

		});

		it("moves the focus to the first and the last item with Home and End", async () => {

			const sortable = await mount(<Board/>);

			await focus(handle(sortable, "test"));

			await press(handle(sortable, "test"), "End");

			const last = document.activeElement;

			await press(handle(sortable, "plan"), "Home");

			expect([last, document.activeElement]).toEqual([handle(sortable, "plan"), handle(sortable, "write")]);

		});

		it("names each grip after the item it moves, keeping the content out of it", async () => {

			const sortable = await mount(<Board>{item => item.toUpperCase()}</Board>);

			const grips = [...sortable.querySelectorAll("li > button")];

			expect(grips.map(grip => document.getElementById(grip.getAttribute("aria-labelledby") ?? "")?.textContent))
				.toEqual(["WRITE", "TEST", "PLAN"]);

			expect(grips.map(grip => grip.textContent)).toEqual(["", "", ""]);

		});

		it("hands over the move an item is dropped by", async () => {

			const onMove = vi.fn();
			const sortable = await mount(<Board onMove={onMove}/>);

			await carry(sortable, "test", "ArrowUp");

			expect(onMove).toHaveBeenCalledWith(swap);

		});

		it("hands over a move into another list", async () => {

			const onMove = vi.fn();
			const sortable = await mount(<Board onMove={onMove}/>);

			await carry(sortable, "test", "ArrowRight");

			expect(onMove).toHaveBeenCalledWith({
				item: "test", from: { list: "To do", index: 1 }, to: { list: "Done", index: 0 }
			});

		});

		it("hands over nothing for an item dropped where it was picked up", async () => {

			const onMove = vi.fn();
			const sortable = await mount(<Board onMove={onMove}/>);

			await carry(sortable, "test");

			expect(onMove).not.toHaveBeenCalled();
			expect(contents(sortable)).toEqual(initial);

		});

		it("sends a cancelled item back", async () => {

			const onMove = vi.fn();
			const sortable = await mount(<Board onMove={onMove}/>);

			await focus(handle(sortable, "test"));

			await press(handle(sortable, "test"), "Space");
			await press(handle(sortable, "test"), "ArrowUp");
			await press(handle(sortable, "test"), "Escape");

			expect(onMove).not.toHaveBeenCalled();
			expect(contents(sortable)).toEqual(initial);

		});

		it("sends a dropped item back unless the move is given back", async () => {

			const sortable = await mount(<Board onMove={() => {}}/>);

			await carry(sortable, "test", "ArrowUp");

			expect(contents(sortable)).toEqual(initial);

		});

		it("keeps a dropped item where the move given back places it", async () => {

			const sortable = await mount(<Adopting/>);

			await carry(sortable, "test", "ArrowUp");

			expect(contents(sortable)).toEqual(swapped);

		});

		it("starts every move from the items given", async () => {

			const sortable = await mount(<Board onMove={() => {}}/>);

			await carry(sortable, "test", "ArrowUp");

			await press(handle(sortable, "write"), "Space");
			await press(handle(sortable, "write"), "Escape");

			expect(contents(sortable)).toEqual(initial);

		});

	});

	describe("pointer", () => {

		it("drags an item by its grip", async () => {

			const sortable = await mount(<Board/>);

			expect(await point(handle(sortable, "write"))).toBe(true);

		});

		it("drags an item by touch after a brief hold", async () => {

			const sortable = await mount(<Board/>);

			expect(await hold(handle(sortable, "write"), "touch")).toBe(true);

		});

		it("leaves the content of an item to the pointer", async () => {

			const sortable = await mount(<Board/>);

			expect(await point(content(sortable, "write"))).toBe(false);

		});

	});

	describe("surface", () => {

		it("draws no grip on an item dragged by its whole surface", async () => {

			const sortable = await mount(<Board surface/>);

			expect(sortable.querySelectorAll("li > button")).toHaveLength(0);

		});

		it("keeps the item a list item", async () => {

			const sortable = await mount(<Board surface/>);

			expect(items(sortable).map(item => item.getAttribute("role"))).toEqual(["listitem", "listitem", "listitem"]);

		});

		it("makes the item itself the single tab stop of the lists", async () => {

			const sortable = await mount(<Board surface/>);

			expect(items(sortable).map(item => item.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);

		});

		it("describes the item with the instructions for moving it", async () => {

			const sortable = await mount(<Board surface/>);

			const description = document.getElementById(item(sortable, "write")?.getAttribute("aria-describedby") ?? "");

			expect(description?.textContent).toMatch(/space bar/);

		});

		it("moves the focus from item to item with the arrow keys", async () => {

			const sortable = await mount(<Board surface/>);

			await focus(item(sortable, "write"));

			await press(item(sortable, "write"), "ArrowDown");

			expect(document.activeElement).toBe(item(sortable, "test"));

		});

		it("moves an item with the keyboard by the item itself", async () => {

			const onMove = vi.fn();
			const sortable = await mount(<Board surface onMove={onMove}/>);

			await carry(sortable, "test", "ArrowUp");

			expect(onMove).toHaveBeenCalledWith(swap);

		});

		it("drags an item by its whole surface", async () => {

			const sortable = await mount(<Board surface/>);

			expect(await point(content(sortable, "write"))).toBe(true);

		});

		it("drags an item by its whole surface once asked to after the first render", async () => {

			const sortable = await mount(<Board/>);

			await mount(<Board surface/>);

			expect(await point(content(sortable, "write"))).toBe(true);

		});

		it("drags an item by the plain text in its content", async () => {

			const sortable = await mount(<Board surface>{item => <small>{item}</small>}</Board>);

			expect(await point(content(sortable, "write")?.querySelector("small") ?? null)).toBe(true);

		});

		it("drags an item by the buttons in its content", async () => {

			const sortable = await mount(<Board surface>{item => <>{item}<button type="button" aria-label="Details"/></>}</Board>);

			expect(await point(content(sortable, "write")?.querySelector("button") ?? null)).toBe(true);

		});

		it("drags an item by the links in its content", async () => {

			const sortable = await mount(<Board surface>{item => <a href="#details">{item}</a>}</Board>);

			expect(await point(content(sortable, "write")?.querySelector("a") ?? null)).toBe(true);

		});

		it("drags an item by the custom controls in its content", async () => {

			const sortable = await mount(<Board surface>{item =>
				<>{item}<span role="switch" tabIndex={0} aria-checked="false" aria-label="Flag"/></>
			}</Board>);

			expect(await point(content(sortable, "write")?.querySelector("span") ?? null)).toBe(true);

		});

		it("keeps an item pressed still on a control in its content in place", async () => {

			const sortable = await mount(<Board surface>{item => <>{item}<button type="button" aria-label="Details"/></>}</Board>);

			expect(await hold(content(sortable, "write")?.querySelector("button") ?? null)).toBe(false);

		});

		it("leaves the keys pressed on the controls in an item to them", async () => {

			const sortable = await mount(<Board surface>{item => <>{item}<button type="button" aria-label="Details"/></>}</Board>);

			const button = content(sortable, "write")?.querySelector("button") ?? null;

			await focus(button);

			await press(button, "Space");
			await press(button, "ArrowDown");

			expect([item(sortable, "write")?.dataset.state, document.activeElement]).toEqual([undefined, button]);

		});

		it("leaves the text fields in the content of an item to the pointer", async () => {

			const sortable = await mount(<Board surface>{item => <>{item}<input type="text" aria-label="Note"/></>}</Board>);

			expect(await point(content(sortable, "write")?.querySelector("input") ?? null)).toBe(false);

		});

		it("leaves the custom fields in the content of an item to the pointer", async () => {

			const sortable = await mount(<Board surface>{item =>
				<>{item}<span role="slider" tabIndex={0} aria-valuenow={0} aria-label="Effort"/></>
			}</Board>);

			expect(await point(content(sortable, "write")?.querySelector("span") ?? null)).toBe(false);

		});

	});

	describe("pending moves", () => {

		it("keeps the order an item is dropped in while it is waiting", async () => {

			const { promise } = deferred();
			const sortable = await mount(<Board onMove={() => promise}/>);

			await carry(sortable, "test", "ArrowUp");

			expect(contents(sortable)).toEqual(swapped);

		});

		it("sends an item refused outright back at once, announcing the refusal", async () => {

			const onMove = vi.fn(() => false);
			const sortable = await mount(<Board onMove={onMove}/>);

			await carry(sortable, "test", "ArrowUp");

			expect(onMove).toHaveBeenCalledOnce();
			expect(contents(sortable)).toEqual(initial);
			expect(sortable.hasAttribute("aria-busy")).toBe(false);
			expect(sortable.querySelector("[role='status']")?.textContent).toBe("The move was refused.");

		});

		it("marks the item and the lists as waiting", async () => {

			const { promise } = deferred();
			const sortable = await mount(<Board onMove={() => promise}/>);

			await carry(sortable, "test", "ArrowUp");

			expect(sortable.getAttribute("aria-busy")).toBe("true");
			expect(item(sortable, "test")?.dataset.state).toBe("pending");
			expect(item(sortable, "test")?.getAttribute("aria-busy")).toBe("true");

		});

		it("marks every grip as unavailable while an item is waiting", async () => {

			const { promise } = deferred();
			const sortable = await mount(<Board onMove={() => promise}/>);

			await carry(sortable, "test", "ArrowUp");

			expect(items(sortable).map(entry => handle(sortable, entry.textContent ?? "")?.getAttribute("aria-disabled")))
				.toEqual(["true", "true", "true"]);

		});

		it("locks the lists while an item is waiting", async () => {

			const { promise } = deferred();
			const onMove = vi.fn(() => promise);
			const sortable = await mount(<Board onMove={onMove}/>);

			await carry(sortable, "test", "ArrowUp");
			await carry(sortable, "write", "ArrowUp");

			expect(onMove).toHaveBeenCalledTimes(1);
			expect(contents(sortable)).toEqual(swapped);

		});

		it("keeps the focus on an item the keyboard carries into another list", async () => {

			const { promise } = deferred();
			const sortable = await mount(<Board onMove={() => promise}/>);

			await carry(sortable, "test", "ArrowRight");

			expect([contents(sortable), document.activeElement])
				.toEqual([[["write"], ["test", "plan"], []], handle(sortable, "test")]);

		});

		it("sends an item back once an order not given back settles, unlocking the lists", async () => {

			const { promise, resolve } = deferred();
			const onMove = vi.fn(() => promise);
			const sortable = await mount(<Board onMove={onMove}/>);

			await carry(sortable, "test", "ArrowUp");
			await resolve();

			expect(contents(sortable)).toEqual(initial);
			expect(sortable.hasAttribute("aria-busy")).toBe(false);

			await carry(sortable, "write", "ArrowDown");

			expect(onMove).toHaveBeenCalledTimes(2);

		});

		it("announces a move refused", async () => {

			const { promise, resolve } = deferred();
			const sortable = await mount(<Board onMove={() => promise}/>);

			await carry(sortable, "test", "ArrowUp");
			await resolve();

			expect(sortable.querySelector("[role='status']")?.textContent).toBe("The move was refused.");

		});

		it("announces nothing for an order given back", async () => {

			const sortable = await mount(<Adopting/>);

			await carry(sortable, "test", "ArrowUp");
			await settle();

			expect(sortable.querySelector("[role='status']")?.textContent).toBe("");

		});

	});

});
