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
 * Movable item parts.
 *
 * Collects what the widgets of this package draw alike: the item a reader moves by its grip or by its whole surface,
 * the single <kbd>Tab</kbd> stop of a group of items, and the status announcing a move refused. None of it is offered
 * to consumers, so the package can retune it without a release note; the widgets built on it carry the documented
 * behaviour.
 *
 * @module
 */

import { type Draggable, KeyboardSensor, PointerActivationConstraints, PointerSensor } from "@dnd-kit/dom";
import { opt, type Optional } from "@metreeca/core";
import { keys } from "@metreeca/tile-cell";
import { Icon } from "@metreeca/tile-cell/icon";
import { type ComponentChildren } from "preact";
import { useEffect, useId } from "preact/hooks";
import { type SortableOptions, useSortable } from "./index.core.js";
import "./index.css";


/**
 * The controls a click is left to, a drag starting on them only once the pointer moves.
 *
 * Takes in whatever a reader acts on: native controls and links, editable regions, elements made focusable, and those
 * carrying an interactive role anywhere in their list of roles, fallbacks included. A focusable separator, the one
 * role acted on only once focusable, is taken in as an element made focusable.
 */
const Controls = [
	"input:not([disabled])",
	"select:not([disabled])",
	"textarea:not([disabled])",
	"button:not([disabled])",
	"a[href]",
	"summary",
	"[contenteditable]:not([contenteditable='false'])",
	"[tabindex]",
	...[
		"button", "checkbox", "combobox", "gridcell", "link", "menuitem", "menuitemcheckbox", "menuitemradio", "option",
		"radio", "scrollbar", "searchbox", "slider", "spinbutton", "switch", "tab", "textbox", "treeitem"
	].map(role => `[role~='${role}']`)
].join(", ");

/**
 * The controls a press is left to, rather than starting a drag.
 *
 * Takes in the {@link Controls} a pointer drag already acts on: fields taking text, editable regions, menus opening on
 * a press, and the controls set by dragging, such as sliders and scroll bars, native or carrying the matching role.
 * The item stylesheet restates the list for the cursor shown over them, and the two are kept alike.
 */
const Fields = [
	"input:not([disabled]):not([type='button']):not([type='checkbox']):not([type='color']):not([type='file'])"
	+":not([type='image']):not([type='radio']):not([type='reset']):not([type='submit'])",
	"select:not([disabled])",
	"textarea:not([disabled])",
	"[contenteditable]:not([contenteditable='false'])",
	...[
		"combobox", "scrollbar", "searchbox", "slider", "spinbutton", "textbox"
	].map(role => `[role~='${role}']`)
].join(", ");

/**
 * The sensors of a movable item.
 *
 * The pointer is followed over the whole item, starting a drag from the grip or, on an item drawn as dragged by its
 * surface, from anywhere outside the {@link Fields} in its content. A drag starting on one of the other
 * {@link Controls} waits for the pointer to move, so a click held long still reaches the control. The choice is read
 * off the item as it stands when the pointer is pressed, since dnd-kit binds the sensors of an item once and never
 * again.
 */
const Sensors = [PointerSensor.configure({

	activatorElements: source => [source.element],

	activationConstraints: (event, source) => event.pointerType !== "touch"
	&& event.target instanceof Element && controlled(event.target, source.element, Controls)
		? [new PointerActivationConstraints.Distance({ value: 5 })]
		: fallback(event, source),

	preventActivation: ({ target }, { element, handle }) => target instanceof Element && (handle
			? !handle.contains(target)
			: !element?.hasAttribute("data-surface") || controlled(target, element, Fields)
	)

}), KeyboardSensor];


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a movable item.
 *
 * Draws a list item holding the content it moves and its handle, the part the keyboard, the focus and the screen
 * reader work with. The handle is either the grip beside the content, a native button the pointer drags the item by,
 * or, with `surface` set, the item itself, dragged by its whole surface and drawn without a grip. Either way the
 * handle is named after the content and never holds it as a control would, so the content may hold controls of its
 * own, which keep the clicks and the keys pressed on them. On an item dragged by its surface, a drag starting on a
 * control moves the item, unless the control is a field taking text or a value. The handle is the single tab stop of
 * the group around it when `stop` is set, and while `idle` hands the arrow keys on to the handle they lead to, in
 * document order, leaving them to the drag binding once an item is carried. An item owing the `focus` takes it back
 * when drawn afresh, when its drag ends and when its move starts or stops waiting. It does so only once the focus has
 * fallen to the page, and never takes it from wherever else the reader has since put it.
 *
 * @param options The item configuration
 *
 * @returns The movable item
 */
export function Movable({

	focus,
	idle,
	locked,
	pending,
	stop,
	surface,

	binding,
	order,

	onActivate,

	children

}: {

	/**
	 * Whether the item owes the focus, taking it back once the focus has fallen to the page.
	 */
	focus: boolean

	/**
	 * Whether no item is carried, so that the arrow keys move from handle to handle.
	 */
	idle: boolean

	/**
	 * Whether a move is waiting, so that the handle is unavailable.
	 */
	locked: boolean

	/**
	 * Whether the item is the one waiting for its move to be settled.
	 */
	pending: boolean

	/**
	 * Whether the handle is the one tab stop of the group around it.
	 */
	stop: boolean

	/**
	 * Whether the item is its own handle, dragged by its whole surface and drawn without a grip; the controls in its
	 * content still take the clicks and the keys pressed on them.
	 */
	surface: boolean

	/**
	 * The drag binding options, except for the element, its handle and its sensors, which the item provides.
	 */
	binding: Omit<SortableOptions, "element" | "handle" | "sensors">

	/**
	 * The place the item is shown at among its siblings, as a flex order, where it differs from its place in the DOM;
	 * where the two agree if omitted.
	 */
	order?: number

	/**
	 * Notified when the handle takes the focus.
	 */
	onActivate: () => void

	/**
	 * The content the item moves.
	 */
	children: ComponentChildren

}) {

	const id = useId();
	const element = `${id}-item`;
	const handle = `${id}-handle`;
	const content = `${id}-content`;

	const { dragging, dropping } = useSortable({
		...binding, element, handle: surface ? undefined : handle, sensors: Sensors
	});

	/*
	 * The focus is a DOM concern no rendered state answers: an item owing it takes it back on mounting, as its drop is
	 * held open and as its drag ends, since dnd-kit lets the focus fall off the element at both turns, but only once
	 * the focus has fallen to the page, and never from wherever else the reader has since put it.
	 */

	useEffect(() => {

		const orphaned = document.activeElement === null || document.activeElement === document.body;

		return focus && orphaned ? document.getElementById(surface ? element : handle)?.focus() : undefined;

	}, [dragging, pending]);

	const control = {

		"tabIndex": stop ? 0 : -1,

		"aria-labelledby": content,
		"aria-disabled": locked || undefined,

		"onFocus": onActivate,
		"onKeyDown": idle ? direct(keys({

			ArrowDown: ({ currentTarget }) => step(currentTarget, 1),
			ArrowRight: ({ currentTarget }) => step(currentTarget, 1),
			ArrowUp: ({ currentTarget }) => step(currentTarget, -1),
			ArrowLeft: ({ currentTarget }) => step(currentTarget, -1),
			Home: ({ currentTarget }) => step(currentTarget, -Infinity),
			End: ({ currentTarget }) => step(currentTarget, Infinity)

		})) : undefined

	};

	/*
	 * An item that is its own handle states its list item role, or dnd-kit makes the handle a button, holding the
	 * controls in the content.
	 */

	return <li class="tile-movable" id={element}

		role={surface ? "listitem" : undefined}

		{...surface ? control : {}}

		aria-busy={pending || undefined}

		style={opt(order, order => ({ order }))}

		data-surface={surface || undefined}
		data-state={pending ? "pending" : dragging ? "dragging" : dropping ? "dropping" : undefined}

	>

		{surface ? undefined : <button id={handle} type="button" {...control}><Icon.GripVertical/></button>}

		<div id={content}>{children}</div>

	</li>;

}

/**
 * Creates a status announcement.
 *
 * Draws a polite status region read out but never shown, its text announced whenever it changes.
 *
 * @param options The status configuration
 *
 * @returns The status announcement
 */
export function Status({

	children

}: {

	/**
	 * The text announced, or an empty string for none.
	 */
	children: string

}) {

	return <p class="tile-status" role="status">{children}</p>;

}

/**
 * Picks the item <kbd>Tab</kbd> lands on among a group of movable items.
 *
 * @param order The keys of the items of the group, in display order
 * @param active The key of the item the keyboard last stood on, if any
 *
 * @returns `active` if it still stands among `order`, or the first key of `order` otherwise; `undefined` if `order` is
 *     empty
 */
export function entry(order: readonly string[], active: Optional<string>): Optional<string> {
	return active !== undefined && order.includes(active) ? active : order[0];
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Checks whether a press falls on a control in the content of an item.
 *
 * @param target The element pressed
 * @param item The item the press falls on
 * @param controls The selector matching the controls of interest, {@link Controls} or {@link Fields}
 *
 * @returns `true` if `target` stands in one of the `controls` inside `item`, other than `item` itself
 */
function controlled(target: Element, item: Optional<Element>, controls: string): boolean {

	const control = target.closest(controls);

	return control !== null && control !== item && (item?.contains(control) ?? false);

}

/**
 * Retrieves the conditions dnd-kit sets by default before a press turns into a drag.
 *
 * @param event The press
 * @param source The item pressed
 *
 * @returns The default activation constraints for `event` on `source`
 */
function fallback(event: PointerEvent, source: Draggable) {

	const { activationConstraints } = PointerSensor.defaults;

	return typeof activationConstraints === "function" ? activationConstraints(event, source) : activationConstraints;

}

/**
 * Restricts a keyboard handler to the keys pressed on the element it is attached to.
 *
 * Leaves the keys pressed on the controls in the content of an item to them, as they bubble up to an item that is its
 * own handle.
 *
 * @param handler The handler taking the keys pressed on the element itself
 *
 * @returns A handler passing on to `handler` only the keys pressed on the element it is attached to
 */
function direct(handler: (event: KeyboardEvent) => void): (event: KeyboardEvent) => void {
	return event => event.target === event.currentTarget ? handler(event) : undefined;
}

/**
 * Moves the focus from a handle to another of the same group.
 *
 * Walks the handles in document order, which is the only place the order of the items is known once a layout belongs
 * to the consumer, as the cells of a board do.
 *
 * @param handle The handle the focus stands on
 * @param offset How many handles to move by, forwards if positive, clamped to the first and the last
 */
function step(handle: EventTarget | null, offset: number): void {

	const group = handle instanceof Element ? handle.closest("[role='group']") : null;
	const handles = [...group?.querySelectorAll<HTMLElement>("li.tile-movable[data-surface], li.tile-movable > button") ?? []];

	const index = handles.findIndex(element => element === handle);

	return handles[Math.min(Math.max(index+offset, 0), handles.length-1)]?.focus();

}
