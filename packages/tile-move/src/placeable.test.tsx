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
import { type Move } from "./placeable.core.js";
import { Placeable } from "./placeable.js";


describe("Placeable", () => {

	interface Issue {
		readonly id: string;
		readonly row: string;
		readonly column: string;
		readonly title: string;
	}

	const rows = ["bug", "task"];
	const columns = ["todo", "done"];

	const issues: readonly Issue[] = [
		{ id: "a", row: "bug", column: "todo", title: "Alpha" },
		{ id: "b", row: "bug", column: "todo", title: "Beta" },
		{ id: "c", row: "task", column: "done", title: "Gamma" }
	];

	const initial = [[["Alpha", "Beta"], []], [[], ["Gamma"]]];
	const moved = [[["Alpha"], ["Beta"]], [[], ["Gamma"]]];
	const move = { card: "b", from: { row: "bug", column: "todo" }, to: { row: "bug", column: "done" } };


	/**
	 * Lays the cells out in a grid, each tagged with its place so the stubbed layout below can find it.
	 */
	function Grid({

		surface,

		card = issue => issue.title,
		items = issues,

		onMove

	}: {

		surface?: boolean

		card?: (issue: Issue) => ComponentChildren
		items?: readonly Issue[]

		onMove?: (move: Move) => void | Promise<unknown>

	}) {
		return <Placeable name="Issues" surface={surface} items={items} card={card} onMove={onMove}>{cell =>
			rows.map((row, y) => <div key={row}>{columns.map((column, x) =>
				<div key={column} data-x={x} data-y={y}>{cell({ row, column }, `${row} ${column}`)}</div>
			)}</div>)
		}</Placeable>;
	}

	/**
	 * Lays out a board giving every card back in the cell it is moved into.
	 */
	function Adopting() {

		const [items, setItems] = useState(issues);

		return <Grid items={items} onMove={({ card, to }) => setItems(items.map(item =>
			item.id === card ? { ...item, ...to } : item
		))}/>;

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

		return document.body.querySelector<HTMLElement>(":scope > tile-placeable")!; // test harness: rendered above

	}

	function contents(board: HTMLElement): string[][][] {
		return rows.map((_, y) => columns.map((_, x) =>
			[...board.querySelectorAll(`[data-x="${x}"][data-y="${y}"] li:not([data-dnd-placeholder])`)]
				.map(item => item.textContent ?? "") // test harness: skips the stand-in dnd-kit leaves while a card is carried
		));
	}

	function items(board: HTMLElement): HTMLElement[] {
		return [...board.querySelectorAll<HTMLElement>("li:not([data-dnd-placeholder])")];
	}

	function item(board: HTMLElement, title: string): null | HTMLElement {
		return items(board).find(item => item.textContent?.startsWith(title)) ?? null;
	}

	/**
	 * Retrieves the handle of a card, the grip beside its content or the card itself if dragged by its surface.
	 */
	function handle(board: HTMLElement, title: string): null | HTMLElement {

		const card = item(board, title);

		return card?.hasAttribute("data-surface") ? card : card?.querySelector(":scope > button") ?? null;

	}

	function content(board: HTMLElement, title: string): null | HTMLElement {
		return item(board, title)?.querySelector(":scope > div") ?? null;
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
	 * Picks a card up from the keyboard, carries it with the keys given and drops it; the handle takes the focus first,
	 * as it does under a reader's hands.
	 */
	async function carry(board: HTMLElement, title: string, ...keys: readonly string[]): Promise<void> {

		await focus(handle(board, title));

		await press(handle(board, title), "Space");

		await keys.reduce((previous, key) => previous.then(() => press(handle(board, title), key)), Promise.resolve());

		await press(handle(board, title), "Space");

	}

	function pointer(type: string, x: number, pointerType: string = "mouse"): PointerEvent {
		return new PointerEvent(type, {
			bubbles: true, isPrimary: true, button: 0, pointerType, pointerId: 1, clientX: x, clientY: 20
		});
	}

	/**
	 * Presses the pointer on an element and moves it well past the distance a drag starts after, releasing it once it
	 * is known whether the card under it was picked up.
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
	 * it is known whether the card under it was picked up.
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

	beforeAll(async () => { // test harness: happy-dom lays out nothing, so cells stand in a grid and cards in rows

		vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {

			const cell = this.closest<HTMLElement>("[data-x]");
			const x = Number(cell?.dataset.x ?? 0) * 200;
			const y = Number(cell?.dataset.y ?? 0) * 200;
			const card = this.closest("li");
			const row = card ? [...card.parentElement?.children ?? []].indexOf(card) : -1;

			return !cell ? new DOMRect(0, 0, 400, 400)
				: card ? new DOMRect(x + 10, y + 10 + row * 40, 160, 30)
					: new DOMRect(x, y, 180, 180);

		});

	});

	afterEach(async () => {
		act(() => render(null, document.body));
	});


	describe("rendering", () => {

		it("renders the cards of each cell, in order, through the content given", async () => {

			expect(contents(await mount(<Grid/>))).toEqual(initial);

		});

		it("renders the cells where the layout places them", async () => {

			const board = await mount(<Grid/>);

			expect(board.querySelectorAll("[data-x] > tile-placeable-cell")).toHaveLength(4);

		});

		it("names the board", async () => {

			const board = await mount(<Grid/>);

			expect([board.getAttribute("role"), board.getAttribute("aria-label")]).toEqual(["group", "Issues"]);

		});

		it("names each cell", async () => {

			const board = await mount(<Grid/>);

			const names = [...board.querySelectorAll("tile-placeable-cell > ul")].map(list => list.getAttribute("aria-label"));

			expect(names).toEqual(["bug todo", "bug done", "task todo", "task done"]);

		});

		it("follows the cards given", async () => {

			await mount(<Grid/>);

			const board = await mount(<Grid items={[{ id: "c", row: "bug", column: "done", title: "Gamma" }]}/>);

			expect(contents(board)).toEqual([[[], ["Gamma"]], [[], []]]);

		});

		it("rejects blank card, row or column keys", async () => {

			await expect(mount(<Grid items={[{ ...issues[0], id: " " }]}/>)).rejects.toThrow(TypeError);
			await expect(mount(<Grid items={[{ ...issues[0], row: "" }]}/>)).rejects.toThrow(TypeError);
			await expect(mount(<Grid items={[{ ...issues[0], column: "" }]}/>)).rejects.toThrow(TypeError);

		});

		it("rejects repeated card keys", async () => {

			await expect(mount(<Grid items={[issues[0], issues[0]]}/>)).rejects.toThrow(TypeError);

		});

	});

	describe("keyboard", () => {

		it("makes the board a single tab stop", async () => {

			const board = await mount(<Grid/>);

			expect(items(board).map(card => handle(board, card.textContent ?? "")?.getAttribute("tabindex")))
				.toEqual(["0", "-1", "-1"]);

		});

		it("keeps the tab stop on the card the keyboard last stood on", async () => {

			const board = await mount(<Grid/>);

			await focus(handle(board, "Alpha"));

			await press(handle(board, "Alpha"), "ArrowDown");

			expect(items(board).map(card => handle(board, card.textContent ?? "")?.getAttribute("tabindex")))
				.toEqual(["-1", "0", "-1"]);

		});

		it("moves the focus from card to card with the arrow keys", async () => {

			const board = await mount(<Grid/>);

			await focus(handle(board, "Alpha"));

			await press(handle(board, "Alpha"), "ArrowDown");

			const next = document.activeElement;

			await press(handle(board, "Beta"), "ArrowRight");

			const last = document.activeElement;

			await press(handle(board, "Gamma"), "ArrowUp");

			expect([next, last, document.activeElement]).toEqual([
				handle(board, "Beta"), handle(board, "Gamma"), handle(board, "Beta")
			]);

		});

		it("moves the focus to the first and the last card with Home and End", async () => {

			const board = await mount(<Grid/>);

			await focus(handle(board, "Beta"));

			await press(handle(board, "Beta"), "End");

			const last = document.activeElement;

			await press(handle(board, "Gamma"), "Home");

			expect([last, document.activeElement]).toEqual([handle(board, "Gamma"), handle(board, "Alpha")]);

		});

		it("names each grip after the card it moves, keeping the content out of it", async () => {

			const board = await mount(<Grid/>);

			const grips = [...board.querySelectorAll("li > button")];

			expect(grips.map(grip => document.getElementById(grip.getAttribute("aria-labelledby") ?? "")?.textContent))
				.toEqual(["Alpha", "Beta", "Gamma"]);

			expect(grips.map(grip => grip.textContent)).toEqual(["", "", ""]);

		});

		it("hands over a card dropped into another cell", async () => {

			const onMove = vi.fn();
			const board = await mount(<Grid onMove={onMove}/>);

			await carry(board, "Beta", "ArrowRight");

			expect(onMove).toHaveBeenCalledWith(move);

		});

		it("hands over nothing for a card dropped onto its own cell", async () => {

			const onMove = vi.fn();
			const board = await mount(<Grid onMove={onMove}/>);

			await carry(board, "Beta");

			expect(onMove).not.toHaveBeenCalled();
			expect(contents(board)).toEqual(initial);

		});

		it("sends a cancelled card back", async () => {

			const onMove = vi.fn();
			const board = await mount(<Grid onMove={onMove}/>);

			await focus(handle(board, "Beta"));

			await press(handle(board, "Beta"), "Space");
			await press(handle(board, "Beta"), "ArrowRight");
			await press(handle(board, "Beta"), "Escape");

			expect(onMove).not.toHaveBeenCalled();
			expect(contents(board)).toEqual(initial);

		});

		it("sends a moved card back unless it is given back in its new cell", async () => {

			const board = await mount(<Grid onMove={() => {}}/>);

			await carry(board, "Beta", "ArrowRight");

			expect(contents(board)).toEqual(initial);

		});

		it("keeps a moved card in the cell it is given back in", async () => {

			const board = await mount(<Adopting/>);

			await carry(board, "Beta", "ArrowRight");

			expect(contents(board)).toEqual(moved);

		});

	});

	describe("pointer", () => {

		it("drags a card by its grip", async () => {

			const board = await mount(<Grid/>);

			expect(await point(handle(board, "Alpha"))).toBe(true);

		});

		it("drags a card by touch after a brief hold", async () => {

			const board = await mount(<Grid/>);

			expect(await hold(handle(board, "Alpha"), "touch")).toBe(true);

		});

		it("leaves the content of a card to the pointer", async () => {

			const board = await mount(<Grid/>);

			expect(await point(content(board, "Alpha"))).toBe(false);

		});

	});

	describe("surface", () => {

		it("draws no grip on a card dragged by its whole surface", async () => {

			const board = await mount(<Grid surface/>);

			expect(board.querySelectorAll("li > button")).toHaveLength(0);

		});

		it("keeps the card a list item", async () => {

			const board = await mount(<Grid surface/>);

			expect(items(board).map(item => item.getAttribute("role"))).toEqual(["listitem", "listitem", "listitem"]);

		});

		it("makes the card itself the single tab stop of the board", async () => {

			const board = await mount(<Grid surface/>);

			expect(items(board).map(item => item.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);

		});

		it("describes the card with the instructions for moving it", async () => {

			const board = await mount(<Grid surface/>);

			const description = document.getElementById(item(board, "Alpha")?.getAttribute("aria-describedby") ?? "");

			expect(description?.textContent).toMatch(/space bar/);

		});

		it("moves the focus from card to card with the arrow keys", async () => {

			const board = await mount(<Grid surface/>);

			await focus(item(board, "Alpha"));

			await press(item(board, "Alpha"), "ArrowDown");

			expect(document.activeElement).toBe(item(board, "Beta"));

		});

		it("moves a card with the keyboard by the card itself", async () => {

			const onMove = vi.fn();
			const board = await mount(<Grid surface onMove={onMove}/>);

			await carry(board, "Beta", "ArrowRight");

			expect(onMove).toHaveBeenCalledWith(move);

		});

		it("drags a card by its whole surface", async () => {

			const board = await mount(<Grid surface/>);

			expect(await point(content(board, "Alpha"))).toBe(true);

		});

		it("drags a card by its whole surface once asked to after the first render", async () => {

			const board = await mount(<Grid/>);

			await mount(<Grid surface/>);

			expect(await point(content(board, "Alpha"))).toBe(true);

		});

		it("drags a card by the plain text in its content", async () => {

			const board = await mount(<Grid surface card={issue => <small>{issue.title}</small>}/>);

			expect(await point(content(board, "Alpha")?.querySelector("small") ?? null)).toBe(true);

		});

		it("drags a card by the buttons in its content", async () => {

			const board = await mount(<Grid surface card={issue => <>{issue.title}<button type="button" aria-label="Details"/></>}/>);

			expect(await point(content(board, "Alpha")?.querySelector("button") ?? null)).toBe(true);

		});

		it("drags a card by the links in its content", async () => {

			const board = await mount(<Grid surface card={issue => <a href="#details">{issue.title}</a>}/>);

			expect(await point(content(board, "Alpha")?.querySelector("a") ?? null)).toBe(true);

		});

		it("drags a card by the check boxes in its content", async () => {

			const board = await mount(<Grid surface card={issue => <>{issue.title}<input type="checkbox" aria-label="Done"/></>}/>);

			expect(await point(content(board, "Alpha")?.querySelector("input") ?? null)).toBe(true);

		});

		it("drags a card by the custom controls in its content", async () => {

			const board = await mount(<Grid surface card={issue => <>{issue.title}<span role="switch" tabIndex={0} aria-checked="false" aria-label="Flag"/></>}/>);

			expect(await point(content(board, "Alpha")?.querySelector("span") ?? null)).toBe(true);

		});

		it("keeps a card pressed still on a control in its content in place", async () => {

			const board = await mount(<Grid surface card={issue => <>{issue.title}<button type="button" aria-label="Details"/></>}/>);

			expect(await hold(content(board, "Alpha")?.querySelector("button") ?? null)).toBe(false);

		});

		it("leaves the keys pressed on the controls in a card to them", async () => {

			const board = await mount(<Grid surface card={issue => <>{issue.title}<button type="button" aria-label="Details"/></>}/>);

			const button = content(board, "Alpha")?.querySelector("button") ?? null;

			await focus(button);

			await press(button, "Space");
			await press(button, "ArrowDown");

			expect([item(board, "Alpha")?.dataset.state, document.activeElement]).toEqual([undefined, button]);

		});

		it("leaves the text fields in the content of a card to the pointer", async () => {

			const board = await mount(<Grid surface card={issue => <>{issue.title}<input type="text" aria-label="Note"/></>}/>);

			expect(await point(content(board, "Alpha")?.querySelector("input") ?? null)).toBe(false);

		});

		it("leaves the sliders in the content of a card to the pointer", async () => {

			const board = await mount(<Grid surface card={issue => <>{issue.title}<input type="range" aria-label="Effort"/></>}/>);

			expect(await point(content(board, "Alpha")?.querySelector("input") ?? null)).toBe(false);

		});

		it("leaves the menus in the content of a card to the pointer", async () => {

			const board = await mount(<Grid surface card={issue => <>{issue.title}<select aria-label="Owner"/></>}/>);

			expect(await point(content(board, "Alpha")?.querySelector("select") ?? null)).toBe(false);

		});

		it("leaves the editable regions in the content of a card to the pointer", async () => {

			const board = await mount(<Grid surface card={issue => <>{issue.title}<div contentEditable aria-label="Note"/></>}/>);

			expect(await point(content(board, "Alpha")?.querySelector("[contenteditable]") ?? null)).toBe(false);

		});

		it("leaves the custom fields in the content of a card to the pointer", async () => {

			const board = await mount(<Grid surface card={issue => <>{issue.title}<span role="slider" tabIndex={0} aria-valuenow={0} aria-label="Effort"/></>}/>);

			expect(await point(content(board, "Alpha")?.querySelector("span") ?? null)).toBe(false);

		});

		it("leaves the fields named by a fallback list of roles to the pointer", async () => {

			const board = await mount(<Grid surface card={issue => <>{issue.title}<span role="searchbox textbox" tabIndex={0} aria-label="Note"/></>}/>);

			expect(await point(content(board, "Alpha")?.querySelector("span") ?? null)).toBe(false);

		});

	});

	describe("pending moves", () => {

		it("keeps a moved card in its new cell while the move is waiting", async () => {

			const { promise } = deferred();
			const board = await mount(<Grid onMove={() => promise}/>);

			await carry(board, "Beta", "ArrowRight");

			expect(contents(board)).toEqual(moved);

		});

		it("leaves a card refused outright where it was, announcing the refusal", async () => {

			const onMove = vi.fn(() => false);
			const board = await mount(<Grid onMove={onMove}/>);

			await carry(board, "Beta", "ArrowRight");

			expect(onMove).toHaveBeenCalledOnce();
			expect(contents(board)).toEqual(initial);
			expect(board.hasAttribute("aria-busy")).toBe(false);
			expect(board.querySelector("[role='status']")?.textContent).toBe("The move was refused.");

		});

		it("marks the card and the board as waiting", async () => {

			const { promise } = deferred();
			const board = await mount(<Grid onMove={() => promise}/>);

			await carry(board, "Beta", "ArrowRight");

			expect(board.getAttribute("aria-busy")).toBe("true");
			expect(item(board, "Beta")?.dataset.state).toBe("pending");
			expect(item(board, "Beta")?.getAttribute("aria-busy")).toBe("true");

		});

		it("marks every grip as unavailable while a move is waiting", async () => {

			const { promise } = deferred();
			const board = await mount(<Grid onMove={() => promise}/>);

			await carry(board, "Beta", "ArrowRight");

			expect(items(board).map(card => handle(board, card.textContent ?? "")?.getAttribute("aria-disabled")))
				.toEqual(["true", "true", "true"]);

		});

		it("locks the board while a move is waiting", async () => {

			const { promise } = deferred();
			const onMove = vi.fn(() => promise);
			const board = await mount(<Grid onMove={onMove}/>);

			await carry(board, "Beta", "ArrowRight");
			await carry(board, "Alpha", "ArrowRight");

			expect(onMove).toHaveBeenCalledTimes(1);
			expect(contents(board)).toEqual(moved);

		});

		it("keeps the focus on a card the keyboard carries into another cell", async () => {

			const { promise } = deferred();
			const board = await mount(<Grid onMove={() => promise}/>);

			await carry(board, "Beta", "ArrowRight");

			expect(document.activeElement).toBe(handle(board, "Beta"));

		});

		it("sends the card back once a move not given back settles, unlocking the board", async () => {

			const { promise, resolve } = deferred();
			const onMove = vi.fn(() => promise);
			const board = await mount(<Grid onMove={onMove}/>);

			await carry(board, "Beta", "ArrowRight");
			await resolve();

			expect(contents(board)).toEqual(initial);
			expect(board.hasAttribute("aria-busy")).toBe(false);

			await carry(board, "Alpha", "ArrowRight");

			expect(onMove).toHaveBeenCalledTimes(2);

		});

		it("keeps the focus on a card sent back by the keyboard", async () => {

			const { promise, resolve } = deferred();
			const board = await mount(<Grid onMove={() => promise}/>);

			await carry(board, "Beta", "ArrowRight");
			await resolve();

			expect(document.activeElement).toBe(handle(board, "Beta"));

		});

		it("announces a move refused", async () => {

			const { promise, resolve } = deferred();
			const board = await mount(<Grid onMove={() => promise}/>);

			await carry(board, "Beta", "ArrowRight");
			await resolve();

			const status = board.querySelector("[role='status']");

			expect([status?.getAttribute("aria-live"), status?.textContent])
				.toEqual([null, "The move was refused."]);

		});

		it("announces nothing for a move given back", async () => {

			const board = await mount(<Adopting/>);

			await carry(board, "Beta", "ArrowRight");
			await settle();

			expect(board.querySelector("[role='status']")?.textContent).toBe("");

		});

	});

});
