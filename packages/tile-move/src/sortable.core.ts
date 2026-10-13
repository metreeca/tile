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
 * Headless sortable lists.
 *
 * Offers what a set of reorderable lists does without drawing one: the items each list holds, the item a reader is
 * moving, and the gestures that pick it up, carry it to a new place, within its list or into another one, and either
 * settle it there or send it back where it came from. Moves are described by the positions an item leaves and takes,
 * so an application can apply them to the order it keeps. A rendering layer adopts them and supplies the markup, the
 * styling and the input devices, so the same behaviour serves pointer, touch and keyboard alike.
 *
 * @module
 */

import { assert, type Optional } from "@metreeca/core";
import { createState } from "@metreeca/core/state";


/**
 * Headless sortable lists.
 *
 * Holds a fixed set of labelled lists and the items each holds, offering the moves a reader performs on them: an item
 * is picked up, carried to any position in any list, and finally either dropped, leaving it where it stands while the
 * new order waits to be settled, or cancelled, restoring the order it was picked up from. No item is picked up while a
 * dropped one is waiting, so moves are settled one at a time. Items are identified by keys unique across all lists, so
 * an item keeps its identity wherever it is carried.
 *
 * The lists stand for the gesture under way, not for the order an application keeps: once settled, a move restores
 * the order it started from, and the order the application adopts arrives as new lists created from it.
 *
 * A move yields new lists and leaves these as they stand, so lists read earlier keep their items and their order. One
 * that changes nothing yields these lists themselves, which a rendering layer takes as nothing to redraw.
 */
export interface Sortable {

	/**
	 * The keys of the items in each list, in display order, keyed by the list label, in display order.
	 */
	readonly lists: Readonly<Record<string, readonly string[]>>;

	/**
	 * The key of the item being moved, or `undefined` if none is picked up.
	 */
	readonly held: Optional<string>;

	/**
	 * The key of the item dropped and waiting for its new order to be settled, or `undefined` if none is waiting.
	 */
	readonly pending: Optional<string>;

	/**
	 * The key of the item whose wait ended last, or `undefined` if none ended since an item was last picked up.
	 */
	readonly settled: Optional<string>;

	/**
	 * The key of the item owing the focus, or `undefined` if none does: the item last picked up from the keyboard takes
	 * the focus back whenever it is drawn afresh, in the list it is carried into or the one it is sent back to, until
	 * another item is picked up.
	 */
	readonly focus: Optional<string>;

	/**
	 * The key of the item the keyboard last stood on, or `undefined` if none: the one item of the lists reached with
	 * <kbd>Tab</kbd>, the others being reached from it with the arrow keys.
	 */
	readonly active: Optional<string>;


	/**
	 * Marks the item the keyboard stands on.
	 *
	 * @param item The key of the item reached
	 *
	 * @returns Lists with `item` active
	 */
	activate(item: string): this;

	/**
	 * Picks up an item.
	 *
	 * @param item The key of the item to move
	 * @param focus Whether the item is picked up from the keyboard, so that it owes the focus
	 *
	 * @returns Lists holding `item`, owing the focus to it if picked up from the keyboard and to no item otherwise,
	 *     with no item settled, or these lists if `item` is unknown, an item is already held, or a dropped one is
	 *     waiting
	 */
	pick(item: string, focus?: boolean): this;

	/**
	 * Carries the held item to a new position.
	 *
	 * @param list The label of the list to carry the held item into
	 * @param index The position the held item is to take in `list`, counted once the held item is taken out of its
	 *     current place; clamped to the positions available in `list`
	 *
	 * @returns Lists with the held item at `index` in `list`, or these lists if no item is held, `list` is unknown or
	 *     the held item already stands there
	 */
	move(list: string, index: number): this;

	/**
	 * Drops the held item where it stands, leaving it waiting for the new order to be settled.
	 *
	 * @returns Lists holding no item, keeping the current order, with the item dropped waiting, or these lists if no
	 *     item is held
	 */
	drop(): this;

	/**
	 * Ends the wait for the dropped item.
	 *
	 * @returns Lists with no item waiting and the item dropped settled, in the order they had when the item was picked
	 *     up, or these lists if no item is waiting
	 */
	settle(): this;

	/**
	 * Sends the held item back to where it was picked up from.
	 *
	 * @returns Lists holding no item, in the order they had when the item was picked up, or these lists if no item is
	 *     held
	 */
	cancel(): this;

}

/**
 * Item move.
 *
 * Describes an item carried from one position into another, within a list or across lists.
 */
export interface Move {

	/**
	 * The key of the item moved.
	 */
	readonly item: string;

	/**
	 * The position the item was picked up from.
	 */
	readonly from: Position;

	/**
	 * The position the item was dropped at, counted once the item is taken out of the position it was carried from.
	 */
	readonly to: Position;

}

/**
 * List position.
 *
 * Identifies a position in a set of lists by the label of the list and the index in it.
 */
export interface Position {

	/**
	 * The label of the list.
	 */
	readonly list: string;

	/**
	 * The index in the list, counting from `0`.
	 */
	readonly index: number;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates headless sortable lists.
 *
 * @param options The lists configuration
 *
 * @returns Immutable {@link Sortable} lists holding `lists`, with no item picked up
 *
 * @throws {@link !TypeError TypeError} If `lists` includes a blank label, or if an item key is blank or appears more
 *     than once across all lists
 */
export function createSortable({

	lists

}: {

	/**
	 * The keys of the items in each list, in display order, keyed by the list label, in display order; no list if
	 * omitted.
	 */
	lists?: Readonly<Record<string, readonly string[]>>

} = {}): Sortable {

	const $lists = assert(lists ?? {}, lists => {

		const keys = Object.values(lists).flat();

		return Object.keys(lists).every(label => label.trim().length > 0)
			&& keys.every(key => key.trim().length > 0)
			&& new Set(keys).size === keys.length;

	}, "unexpected blank labels, blank item keys or repeated item keys");

	/*
	 * The order an item was picked up from is held alongside the public state rather than in a closure, since every
	 * pick starts from the order the previous drop settled, which the factory never sees.
	 */

	return createState<Sortable & { readonly origin: Readonly<Record<string, readonly string[]>> }>({

		lists: $lists,
		held: undefined,
		pending: undefined,
		settled: undefined,
		focus: undefined,
		active: undefined,
		origin: $lists,


		activate(item: string) {

			return { active: item };

		},


		pick(item: string, focus: boolean = false) {

			return this.held === undefined && this.pending === undefined
			&& Object.values(this.lists).some(keys => keys.includes(item))
				? { held: item, settled: undefined, focus: focus ? item : undefined, origin: this.lists }
				: {};

		},

		move(list: string, index: number) {

			return this.held === undefined || !(list in this.lists) ? {} : carry(this.lists, this.held, list, index);

		},

		drop() {

			return this.held === undefined ? {} : { held: undefined, pending: this.held };

		},

		settle() {

			return this.pending === undefined ? {} : { pending: undefined, settled: this.pending, lists: this.origin };

		},

		cancel() {

			return this.held === undefined ? {} : { held: undefined, lists: this.origin };

		}

	});


	function carry(lists: Readonly<Record<string, readonly string[]>>, item: string, list: string, index: number) {

		const stripped = Object.fromEntries(Object.entries(lists)
			.map(([label, keys]): [string, readonly string[]] => [label, keys.filter(key => key !== item)])
		);

		const target = stripped[list];
		const position = Math.min(Math.max(index, 0), target.length);

		return lists[list][position] === item ? {} : {
			lists: { ...stripped, [list]: [...target.slice(0, position), item, ...target.slice(position)] }
		};

	}

}

/**
 * Locates an item in a set of lists.
 *
 * @param lists The keys of the items in each list, in display order, keyed by the list label
 * @param item The key of the item to locate
 *
 * @returns The position of `item` in `lists`, or `undefined` if no list holds it
 */
export function locate(lists: Readonly<Record<string, readonly string[]>>, item: string): Optional<Position> {
	return Object.entries(lists)
		.filter(([, keys]) => keys.includes(item))
		.map(([list, keys]) => ({ list, index: keys.indexOf(item) }))[0];
}
