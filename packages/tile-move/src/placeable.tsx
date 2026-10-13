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

/**
 * Card boards.
 *
 * Presents cards in a grid of cells keyed by row and column, laid out by the consumer, whose cards a reader moves from
 * one cell into another by dragging them, with the pointer, by touch or with the keyboard alike, each move waiting for
 * the consumer to settle it.
 *
 * @module
 */

import { type DragEndEvent } from "@dnd-kit/dom";
import { isString, opt, type Optional } from "@metreeca/core";
import { useModel } from "@metreeca/tile-data/model";
import { type ComponentChildren, createElement } from "preact";
import { useId } from "preact/hooks";
import { DragDrop, useDroppable } from "./index.core.js";
import { entry, Movable, Status } from "./index.js";
import { arrange, type Card, createPlaceable, type Move, type Place, same } from "./placeable.core.js";
import "./placeable.css";


/**
 * Creates a card board.
 *
 * Draws the cells the layout given asks for wherever it places them, so headings, sticky panes, folding and scrolling
 * stay the consumer's own, and fills each with the cards standing in it, in the order they are given. A card is moved
 * by its handle: the grip beside its content or, with `surface` set, the card itself, dragged by its whole surface and
 * drawn without a grip. Either way the content is free to hold controls of its own, which keep the clicks and the keys
 * pressed on them. On a card dragged by its whole surface, a drag starting on a button or a link moves the card, while
 * fields taking text or a value keep the pointer to themselves. A card is dragged into another cell with the pointer,
 * by touch after a brief hold, so that the board can still be scrolled, or with the keyboard, <kbd>Space</kbd> or
 * <kbd>Enter</kbd> picking up the card whose handle has the focus, the arrow keys carrying it to the next cell in
 * their direction and the same keys dropping it, or <kbd>Escape</kbd> sending it back. Cards keep no order of their
 * own within a cell, so a card is dropped onto a cell rather than between two cards. A dropped card glides into the
 * cell it lands in.
 *
 * The board is a single stop for <kbd>Tab</kbd>, landing on the handle the keyboard last stood on, and the arrow keys
 * move from handle to handle in the order the cards are laid out, <kbd>Home</kbd> and <kbd>End</kbd> reaching the
 * first and the last.
 *
 * A card dropped into another cell is handed to `onMove`. A consumer refusing the move outright returns `false`, and
 * the card never leaves its cell. Otherwise the card stays where it was dropped, marked as waiting, until the promise
 * `onMove` returns settles, while no other card can be picked up. The board then shows the cards given again, so the
 * move stays on screen only once the consumer gives the card back in its new cell: a consumer refusing the move once
 * the store has answered, or failing to settle it, sees the card go back where it was picked up from. A card carried
 * from the keyboard keeps the focus wherever it goes, so a reader is told where it stands by the cell around it.
 *
 * ```tsx
 * <Placeable name="Issues" items={issues} card={issue => issue.title} onMove={move => store.update(move)}>{cell =>
 *
 *     <div class="grid">{types.flatMap(type => states.map(state =>
 *         <Fragment key={`${type} ${state}`}>{cell({ row: type, column: state }, `${type}, ${state}`)}</Fragment>
 *     ))}</div>
 *
 * }</Placeable>
 * ```
 *
 * @typeParam C The cards of the board
 *
 * @param options The widget configuration
 *
 * @returns The card board
 *
 * @throws {@link !TypeError TypeError} If `items` includes a blank card, row or column key, or a card key appearing
 *     more than once
 */
export function Placeable<C extends Card>({

	surface = false,

	name,

	card,
	items,

	onMove,

	children

}: {

	/**
	 * Whether a card is its own handle, dragged by its whole surface and drawn without a grip, rather than moved by the
	 * grip beside its content as it is if omitted. The controls in the content of a card still take the clicks and the
	 * keys pressed on them, and a drag starting on one moves the card, unless the control is a field taking text or a
	 * value.
	 */
	surface?: boolean

	/**
	 * The accessible name of the board, telling apart several on one screen; unnamed if omitted.
	 */
	name?: string

	/**
	 * Renders the content of a card, which also names the handle moving it.
	 */
	card: (card: C) => ComponentChildren

	/**
	 * The cards of the board, each in the cell it stands in, in display order.
	 */
	items: readonly C[]

	/**
	 * Notified whenever a card is dropped into a cell other than the one it was picked up from; returns `false` to
	 * refuse the move outright, leaving the card where it was. Otherwise the card waits in its new cell until the
	 * promise returned, if any, settles, and stays there once given back in it as part of `items`. A rejected promise
	 * ends the wait as a fulfilled one does, and is passed on unhandled, as if it had never been returned, so a
	 * consumer reporting failures catches them in the promise it returns.
	 */
	onMove?: (move: Move) => void | false | Promise<unknown>

	/**
	 * Lays out the board, given a function drawing the cell at a place under the accessible name given; the name is
	 * what a screen reader tells the cell by, both as a reader moves into it and as a card is dropped onto it, so every
	 * cell is expected to carry one.
	 */
	children: (cell: (place: Place, name?: string) => ComponentChildren) => ComponentChildren

}) {

	const {

		held,
		pending,
		settled,
		focus,
		active,

		activate,
		pick,
		drop,
		cancel

	} = useModel(createPlaceable);

	const cards = arrange(items, pending);
	const locked = pending !== undefined;
	const stop = entry(cards.map(({ id }) => id), active);

	/*
	 * A move settled is refused if the cards given leave the card anywhere but where it was dropped, whether outright
	 * or once the store answered; one the consumer gives back is said nothing of, the card standing where the reader
	 * already heard it was dropped.
	 */

	const refused = settled !== undefined && !items.some(item => item.id === settled.card && same(item, settled.to));

	return createElement("tile-placeable", { "role": "group", "aria-label": name, "aria-busy": locked || undefined },

		<DragDrop

			onDragStart={({ operation: { source, activatorEvent } }) => opt(source ?? undefined, ({ id }) =>
				pick(String(id), activatorEvent instanceof KeyboardEvent)
			)}

			onDragEnd={event => event.canceled ? cancel() : settle(event)}

		>{children((place, label) =>

			<Cell

				name={label}

				idle={held === undefined}
				locked={locked}
				surface={surface}

				card={card}
				focus={focus}
				items={cards.filter(item => same(item, place))}
				pending={pending?.card}
				place={place}
				stop={stop}

				onActivate={activate}

			/>
		)}</DragDrop>,

		<Status>{refused ? "The move was refused." : ""}</Status>
	);


	/*
	 * A card dropped onto a cell, or onto a card standing in one, lands in that cell. A move refused outright is
	 * settled at once, so the card never leaves its cell; any other waits until the promise handed back settles, and
	 * a rejected promise is left to the consumer that returned it, ending the wait all the same.
	 */

	function settle({ operation: { target } }: DragEndEvent) {

		const source = cards.find(({ id }) => id === held);
		const place = opt(target?.data, ({ row, column }) => isString(row) && isString(column) ? {
			row,
			column
		} : undefined);

		if ( source === undefined || place === undefined ) {

			return cancel();

		} else {

			const move = { card: source.id, from: { row: source.row, column: source.column }, to: place };
			const dropped = drop(move);

			return opt(dropped.pending, move => {

				const outcome = onMove?.(move);

				return outcome === false ? dropped.settle()
					: Promise.resolve(outcome).finally(() => dropped.settle());

			});

		}

	}

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Cell<C extends Card>({

	name,

	idle,
	locked,
	surface,

	card,
	focus,
	items,
	pending,
	place: { row, column },
	stop,

	onActivate

}: {

	name?: string

	idle: boolean
	locked: boolean
	surface: boolean

	card: (card: C) => ComponentChildren
	focus: Optional<string>
	items: readonly C[]
	pending: Optional<string>
	place: Place
	stop: Optional<string>

	onActivate: (card: string) => void

}) {

	const id = useId();
	const list = `${id}-list`;

	const { target } = useDroppable({ id: list, element: list, data: { row, column } });

	return createElement("tile-placeable-cell", {},

		<ul

			role="list" // stated, since some platforms drop the list semantics of a list drawn without markers

			aria-label={name}

			id={list}
			data-target={target || undefined}

		>{items.map((item, index) =>

			/*
			 * Cards are sortable items only so that the arrow keys carry them from cell to cell: they take no drops of
			 * their own, leaving every drop to the cell beneath.
			 */

			<Movable key={item.id}

				focus={item.id === focus}
				idle={idle}
				locked={locked}
				pending={item.id === pending}
				stop={item.id === stop}
				surface={surface}

				binding={{
					id: item.id,
					index,
					group: list,
					data: { row, column },
					disabled: { draggable: locked, droppable: true }
				}}

				onActivate={() => onActivate(item.id)}

			>{card(item)}</Movable>
		)}</ul>
	);

}
