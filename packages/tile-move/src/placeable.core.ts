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
 * Headless boards.
 *
 * Offers what a board of cards does without drawing one: the card a reader is carrying from one cell of a grid of rows
 * and columns into another, the move waiting for an application to settle it, and where every card stands meanwhile.
 * A rendering layer adopts them and supplies the markup, the styling and the input devices, so the same behaviour
 * serves pointer, touch and keyboard alike.
 *
 * @module
 */

import { assert, type Optional } from "@metreeca/core";
import { createState } from "@metreeca/core/state";


/**
 * Headless board.
 *
 * Tracks the gesture under way on a board, leaving where the cards stand to the application: a card is picked up and
 * either dropped onto a cell, the move waiting there until the application settles it, or cancelled, the card going
 * back where it was. No card is picked up while a move is waiting, so moves are settled one at a time.
 *
 * A gesture yields a new board and leaves this one as it stands. One that changes nothing yields this board itself,
 * which a rendering layer takes as nothing to redraw.
 */
export interface Placeable {

	/**
	 * The key of the card being carried, or `undefined` if none is picked up.
	 */
	readonly held: Optional<string>;

	/**
	 * The move waiting to be settled, or `undefined` if none is waiting.
	 */
	readonly pending: Optional<Move>;

	/**
	 * The move settled last, or `undefined` if none was settled since a card was last picked up: the application took
	 * it if the card now stands where the move left it, and refused it otherwise.
	 */
	readonly settled: Optional<Move>;

	/**
	 * The key of the card owing the focus, or `undefined` if none does: the card last picked up from the keyboard takes
	 * the focus back whenever it is drawn afresh, in the cell it moved into or the one it is sent back to, until
	 * another card is picked up.
	 */
	readonly focus: Optional<string>;

	/**
	 * The key of the card the keyboard last stood on, or `undefined` if none: the one card of the board reached with
	 * <kbd>Tab</kbd>, the others being reached from it with the arrow keys.
	 */
	readonly active: Optional<string>;


	/**
	 * Marks the card the keyboard stands on.
	 *
	 * @param card The key of the card reached
	 *
	 * @returns A board with `card` active
	 */
	activate(card: string): this;

	/**
	 * Picks up a card.
	 *
	 * @param card The key of the card to carry
	 * @param focus Whether the card is picked up from the keyboard, so that it owes the focus
	 *
	 * @returns A board holding `card`, owing the focus to it if picked up from the keyboard and to no card otherwise,
	 *     with no move settled, or this board if a card is already held or a move is waiting
	 */
	pick(card: string, focus?: boolean): this;

	/**
	 * Drops the held card onto a cell.
	 *
	 * @param move The move performed, from the cell the held card stands in to the one it is dropped onto
	 *
	 * @returns A board holding no card, with `move` waiting if it carries the card into a different cell, or this
	 *     board if `move` is not about the held card
	 */
	drop(move: Move): this;

	/**
	 * Sends the held card back where it was picked up from.
	 *
	 * @returns A board holding no card, or this board if no card is held
	 */
	cancel(): this;

	/**
	 * Ends the wait for the pending move.
	 *
	 * @returns A board with no move waiting and the pending move settled, or this board if none is waiting
	 */
	settle(): this;

}

/**
 * Card move.
 *
 * Describes a card carried from one cell into another.
 */
export interface Move {

	/**
	 * The key of the card moved.
	 */
	readonly card: string;

	/**
	 * The cell the card was carried from.
	 */
	readonly from: Place;

	/**
	 * The cell the card was dropped onto.
	 */
	readonly to: Place;

}

/**
 * Board card.
 *
 * Identifies a card and the cell it stands in.
 */
export interface Card extends Place {

	/**
	 * The key of the card, unique across the board.
	 */
	readonly id: string;

}

/**
 * Board cell.
 *
 * Identifies a cell of a board by the row and the column it stands at.
 */
export interface Place {

	/**
	 * The key of the row the cell stands in.
	 */
	readonly row: string;

	/**
	 * The key of the column the cell stands in.
	 */
	readonly column: string;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a headless board.
 *
 * @returns An immutable {@link Placeable} holding no card, with no move waiting
 */
export function createPlaceable(): Placeable {

	return createState<Placeable>({

		held: undefined,
		pending: undefined,
		settled: undefined,
		focus: undefined,
		active: undefined,


		activate(card: string) {

			return { active: card };

		},


		pick(card: string, focus: boolean = false) {

			return this.held === undefined && this.pending === undefined
				? { held: card, settled: undefined, focus: focus ? card : undefined }
				: {};

		},

		drop(move: Move) {

			return this.held !== move.card ? {} : {
				held: undefined,
				pending: same(move.from, move.to) ? undefined : move
			};

		},

		cancel() {

			return this.held === undefined ? {} : { held: undefined };

		},

		settle() {

			return this.pending === undefined ? {} : { pending: undefined, settled: this.pending };

		}

	});

}

/**
 * Places the cards of a board.
 *
 * @param cards The cards of the board, each in the cell the application places it in, in display order
 * @param pending The move waiting to be settled, if any
 *
 * @returns `cards`, in the same order, with the card moved by `pending` standing in the cell it was dropped onto
 *
 * @throws {@link !TypeError TypeError} If a card key, row key or column key is blank, or a card key appears more than
 *     once
 */
export function arrange<C extends Card>(cards: readonly C[], pending?: Move): readonly C[] {

	const $cards = assert(cards, cards => {

		const keys = cards.map(({ id }) => id);

		return cards.every(({ id, row, column }) => [id, row, column].every(key => key.trim().length > 0))
			&& new Set(keys).size === keys.length;

	}, "unexpected blank card, row or column keys or repeated card keys");

	return pending === undefined ? $cards : $cards.map(card => card.id === pending.card
		? { ...card, row: pending.to.row, column: pending.to.column }
		: card
	);

}

/**
 * Checks whether two places identify the same cell.
 */
export function same(x: Place, y: Place): boolean {
	return x.row === y.row && x.column === y.column;
}
