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
 * Sortable lists.
 *
 * Presents a set of labelled lists whose items a reader reorders by dragging them, within a list or from one list into
 * another, with the pointer, by touch or with the keyboard alike.
 *
 * @module
 */

import { CollisionPriority } from "@dnd-kit/abstract";
import { pointerIntersection } from "@dnd-kit/collision";
import { isSortable } from "@dnd-kit/dom/sortable";
import { isString, opt, type Optional } from "@metreeca/core";
import { equals } from "@metreeca/core/values";
import { useModel } from "@metreeca/tile-data/model";
import { type ComponentChildren, createElement } from "preact";
import { useId } from "preact/hooks";
import { DragDrop, useDroppable } from "./index.core.js";
import { entry, Movable, Status } from "./index.js";
import { createSortable, locate, type Move } from "./sortable.core.js";
import "./sortable.css";


/**
 * Creates a set of sortable lists.
 *
 * Presents the lists given side by side, each under its label, with their items in order. An item is moved by its
 * handle: the grip beside its content or, with `surface` set, the item itself, dragged by its whole surface and drawn
 * without a grip. Either way the content is free to hold controls of its own, which keep the clicks and the keys
 * pressed on them. On an item dragged by its whole surface, a drag starting on a button or a link moves the item,
 * while fields taking text or a value keep the pointer to themselves. An item is dragged to a new place with the
 * pointer, by touch after a brief hold, so that the lists can still be scrolled, or with the keyboard,
 * <kbd>Space</kbd> or <kbd>Enter</kbd> picking up the item whose handle has the focus, the arrow keys carrying it and
 * the same keys dropping it, or <kbd>Escape</kbd> sending it back. The items make room for the one dragged as it
 * moves, so the order it would land in is shown before it is dropped, and the list it would land in is highlighted; an
 * empty list takes an item dropped anywhere over it. A dropped item glides into its place.
 *
 * The lists are a single stop for <kbd>Tab</kbd>, landing on the handle the keyboard last stood on, and the arrow keys
 * move from handle to handle in display order, list after list, <kbd>Home</kbd> and <kbd>End</kbd> reaching the first
 * and the last.
 *
 * An item dropped at a position other than the one it was picked up from is handed to `onMove`, as a move from the
 * one to the other. A consumer refusing the move outright returns `false`, and the item goes back where it was picked
 * up at once. Otherwise the order the move leads to stays on screen, the item marked as waiting, until the promise
 * `onMove` returns settles, while no other item can be picked up. The lists then show the items given again, so the
 * order stays on screen only once the consumer gives it back as `items`: a consumer refusing a move once the store
 * has answered, or failing to settle it, sees the item go back where it was picked up from.
 *
 * @param options The widget configuration
 *
 * @returns The sortable lists
 *
 * @throws {@link !TypeError TypeError} If `items` includes a blank label, or if an item key is blank or appears more
 *     than once across all lists
 */
export function Sortable({

	surface = false,

	name,

	items,

	onMove,

	children

}: {

	/**
	 * Whether an item is its own handle, dragged by its whole surface and drawn without a grip, rather than moved by
	 * the grip beside its content as it is if omitted. The controls in the content of an item still take the clicks
	 * and the keys pressed on them, and a drag starting on one moves the item, unless the control is a field taking
	 * text or a value.
	 */
	surface?: boolean

	/**
	 * The accessible name of the set of lists, telling apart several on one screen; unnamed if omitted.
	 */
	name?: string

	/**
	 * The keys of the items in each list, in display order, keyed by the list label, in display order; a key
	 * identifies its item across all lists, so it is unique among them.
	 */
	items: Readonly<Record<string, readonly string[]>>

	/**
	 * Notified whenever an item is dropped at a position other than the one it was picked up from; returns `false` to
	 * refuse the move outright, sending the item back at once. Otherwise the order the move leads to waits on screen
	 * until the promise returned, if any, settles, and stays there once given back as `items`. A rejected promise ends
	 * the wait as a fulfilled one does, and is passed on unhandled, as if it had never been returned, so a consumer
	 * reporting failures catches them in the promise it returns.
	 */
	onMove?: (move: Move) => void | false | Promise<unknown>

	/**
	 * Renders the content of an item, given its key; the content also names the handle moving the item.
	 */
	children: (item: string) => ComponentChildren

}) {

	const {

		lists,
		held,
		pending,
		settled,
		focus,
		active,

		activate,
		pick,
		move,
		drop,
		cancel

	} = useModel(() => createSortable({ lists: items }), [items]);

	const stop = entry(Object.values(lists).flat(), active);

	return createElement("tile-sortable", {
			"role": "group",
			"aria-label": name,
			"aria-busy": pending !== undefined || undefined
		},

		<DragDrop

			onDragStart={({ operation: { source, activatorEvent } }) => opt(source ?? undefined, ({ id }) =>
				pick(String(id), activatorEvent instanceof KeyboardEvent)
			)}

			/*
			 * An item carried over another one takes its place, pushing it along. One carried over another list rather
			 * than over an item of it is appended, which is what lets an empty list take one; over its own list, as in
			 * the gap between two items, it stays where it stands.
			 */

			onDragOver={({ operation: { target } }) => isSortable(target)
				? move(String(target.group), target.index)
				: opt(target?.data.list, list => isString(list) && !lists[list]?.some(key => key === held)
					? move(list, Infinity)
					: undefined
				)
			}

			onDragEnd={({ canceled }) => canceled ? cancel() : settle()}

		>{Object.entries(lists).map(([label, entries]) =>

			<List key={label} label={label} idle={held === undefined} surface={surface}
				target={held !== undefined && entries.includes(held)}
				focus={focus} items={entries} order={items[label] ?? []} pending={pending} stop={stop}
				onActivate={activate}
			>{children}</List>
		)}</DragDrop>,

		/*
		 * Lists still standing once a wait ends were not given the order back, since the order taken creates them
		 * afresh, so an item settled in them is one refused.
		 */

		<Status>{settled !== undefined ? "The move was refused." : ""}</Status>
	);


	/*
	 * An item dropped where it was picked up from is sent back, there being no move to hand over. One dropped anywhere
	 * else is settled at once if the move is refused outright, and otherwise waits until the promise handed back
	 * settles, and is then sent back as well, so the lists follow the items given whatever the consumer makes of the
	 * move: taking it creates the lists afresh. A rejected promise is left to the consumer that returned it, ending
	 * the wait all the same.
	 */

	function settle() {

		const from = opt(held, item => locate(items, item));
		const to = opt(held, item => locate(lists, item));

		if ( held === undefined || from === undefined || to === undefined || equals(from, to) ) {

			return cancel();

		} else {

			const dropped = drop();
			const outcome = onMove?.({ item: held, from, to });

			return outcome === false ? dropped.settle() : Promise.resolve(outcome).finally(() => dropped.settle());

		}

	}

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function List({

	label,

	idle,
	surface,
	target,

	focus,
	items,
	order,
	pending,
	stop,

	onActivate,

	children

}: {

	label: string

	idle: boolean
	surface: boolean
	target: boolean

	focus: Optional<string>
	items: readonly string[]
	order: readonly string[]
	pending: Optional<string>
	stop: Optional<string>

	onActivate: (item: string) => void

	children: (item: string) => ComponentChildren

}) {

	const id = useId();
	const heading = `${id}-heading`;
	const list = `${id}-list`;

	/*
	 * While an item is carried, the items are rendered in the order they were given, one carried in from another list
	 * last, and shown in the order under way through their flex order: an item making room for the one dragged then
	 * moves no element in the DOM, which dnd-kit would answer by rebuilding the drag feedback, a flash on every
	 * crossing. Once it is dropped, the DOM follows the order shown, so the keyboard and a screen reader walk the
	 * items as a reader sees them, a dropped item waiting among them included.
	 */

	const rank = (item: string) => order.includes(item) ? order.indexOf(item) : order.length;
	const rendered = idle ? items : [...items].sort((x, y) => rank(x) - rank(y));

	/*
	 * The list stands behind its items as a drop target of its own, met only while the pointer is over it. An item
	 * under the pointer outranks it, while the list outranks items of a neighbouring list that the item dragged merely
	 * overlaps, so a list next to a wider one still takes what is dropped over it. The list is lit as the one holding
	 * the item dragged, where it would land, rather than as the target met: the target flips between the list and the
	 * items in it as the pointer crosses them, which would make the light flicker.
	 */

	useDroppable({

		id: list,
		element: list,
		data: { list: label },
		collisionDetector: pointerIntersection,
		collisionPriority: CollisionPriority.Normal

	});

	return <section>

		<header id={heading}>{label}</header>

		<ul

			role="list" // stated, since some platforms drop the list semantics of a list drawn without markers

			aria-labelledby={heading}

			id={list}
			data-target={target || undefined}

		>{rendered.map(item =>

			<Movable key={item}

				focus={item === focus}
				idle={idle}
				locked={pending !== undefined}
				pending={item === pending}
				stop={item === stop}
				surface={surface}

				binding={{ id: item, index: items.indexOf(item), group: label, disabled: pending !== undefined }}
				order={items.indexOf(item)}

				onActivate={() => onActivate(item)}

			>{children(item)}</Movable>
		)}</ul>

	</section>;

}
