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
 * Drag and drop bindings.
 *
 * Lets the widgets of this package take part in drag and drop gestures driven by the pointer, by touch or by the
 * keyboard alike. An element is made a drop target, or an item of a sortable list that is both dragged and dropped
 * onto. Its component renders again whenever its part in the gesture under way changes, so dragging and hovering are
 * shown in markup and styling rather than tracked by hand. A dropped element glides into the place it lands in. None of
 * it is offered to consumers, so the package can retune the bindings without a release note; the widgets built on them
 * carry the documented behaviour.
 *
 * Gestures are performed by [dnd-kit](https://dndkit.com/), whose entity options and events are handed through
 * unchanged. The handlers of the enclosing {@link DragDrop} context are told what is dragged and where it lands, and
 * the widget decides what the drop means, for instance moving an item in a list it holds as state.
 *
 * Elements are reached by their DOM id rather than by a ref, so a component states the id it renders its element
 * under and hands the same id to the hook binding it:
 *
 * ```tsx
 * function Card({ id, index }: { id: string, index: number }) {
 *
 *   const element = useId();
 *   const { dragging } = useSortable({ id, index, element });
 *
 *   return <article id={element} class={dragging ? "dragging" : undefined}>{id}</article>;
 *
 * }
 * ```
 *
 * > [!NOTE]
 * >
 * > Screen reader instructions and announcements are given in English, in dnd-kit's own wording. They name the
 * > element dragged and the target it is dropped onto as assistive technology does, after their label or their text,
 * > so an element and a target are named by what a reader sees rather than by an id.
 *
 * @see [dnd-kit](https://dndkit.com/)
 *
 * @module
 */

import { type UniqueIdentifier } from "@dnd-kit/abstract";
import {
	Accessibility,
	DragDropManager,
	type DragEndEvent,
	type Draggable,
	type DragOverEvent,
	type DragStartEvent,
	type DropAnimationFunction,
	Droppable,
	type DroppableInput,
	Feedback
} from "@dnd-kit/dom";
import { Sortable, type SortableInput, SortableKeyboardPlugin } from "@dnd-kit/dom/sortable";
import { animateTransform, getComputedStyles, parseTranslate, prefersReducedMotion } from "@dnd-kit/dom/utilities";
import { effects } from "@dnd-kit/state";
import { opt, type Optional } from "@metreeca/core";
import { type ComponentChildren, createContext, createElement } from "preact";
import { useContext, useEffect, useLayoutEffect, useState } from "preact/hooks";

const Manager = createContext<Optional<DragDropManager>>(undefined);

/**
 * The dnd-kit accessibility plugin, speaking in English, in dnd-kit's own wording.
 *
 * Names the element dragged and the target it meets as assistive technology names them. A target where the element
 * already stands is never announced.
 */
const Announcer = Accessibility.configure({

	screenReaderInstructions: {
		draggable: "To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the"
			+" item in a given direction. Press space again to drop the item in its new position, or press escape to"
			+" cancel."
	},

	announcements: {

		dragstart: ({ operation: { source } }: DragStartEvent) => opt(source ?? undefined, source =>
			`Picked up ${dragged(source)}.`
		),

		/*
		 * A target already holding the element dragged is where it stands, met as soon as it is picked up, so telling
		 * it would only talk over the announcement of the pick, and an element dropped there has met no target at all.
		 */

		dragover: ({ operation: { source, target } }: DragOverEvent) => opt(source ?? undefined, source =>
			standing(source, target) ? undefined
				: target ? `${dragged(source)} was moved over ${targeted(target)}.`
					: `${dragged(source)} is no longer over a drop target.`
		),

		dragend: ({ operation: { source, target }, canceled }: DragEndEvent) => opt(source ?? undefined, source =>
			canceled ? `Dragging was cancelled. ${dragged(source)} was dropped.`
				: target && !standing(source, target) ? `${dragged(source)} was dropped over ${targeted(target)}.`
					: `${dragged(source)} was dropped.`
		)

	}

});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Bound element options.
 */
export interface ElementOptions {

	/**
	 * The DOM id of the element to bind; the element is looked up once the component has rendered, and the binding
	 * stays inert while no element carries the id.
	 */
	readonly element: string;

}

/**
 * Drag handle options.
 */
export interface HandleOptions {

	/**
	 * The DOM id of the part of the element a drag starts from, for instance a grip; the whole element if omitted.
	 */
	readonly handle?: string;

}


/**
 * Drop target options.
 *
 * The dnd-kit droppable options, with the element given by DOM id. The `id`, `data`, `disabled` and `accept` options
 * follow the props they are read from on every render; the others are taken as they stand on the first one.
 */
export type DroppableOptions = Readonly<Omit<DroppableInput, "element">> & ElementOptions;

/**
 * Sortable item options.
 *
 * The dnd-kit sortable options, with the element and its handle given by DOM id. The `id`, `data`, `disabled`,
 * `accept`, `index` and `group` options follow the props they are read from on every render; the others are taken as
 * they stand on the first one.
 */
export type SortableOptions =
	Readonly<Omit<SortableInput<Record<string, unknown>>, "element" | "handle" | "target" | "source">>
	& ElementOptions & HandleOptions;


/**
 * The dnd-kit feedback plugin, gliding a dropped element into place by {@link land}.
 */
const Landing = Feedback.configure({ dropAnimation: land });


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Offers drag and drop gestures to nested components.
 *
 * Bindings within the same context take part in the same gestures, so an element bound in one may be dropped onto a
 * target bound in another, while bindings in different contexts never meet. A binding outside any context stays
 * inert. Gestures start from the pointer, from touch, after a brief hold so that a list can still be scrolled, and from
 * the keyboard, the arrow keys carrying an element picked up with <kbd>Space</kbd> or <kbd>Enter</kbd> and the same
 * keys dropping it, or <kbd>Escape</kbd> cancelling the gesture.
 *
 * A dropped element glides into the place it lands in, over the design system's normal duration, or at once if the
 * reader prefers reduced motion.
 *
 * The handlers given on every render are the ones notified, so they may close over the state of the render.
 *
 * @param options The handlers notified of the gestures, and the components they are offered to
 *
 * @returns The nested components, with drag and drop gestures offered to them
 */
export function DragDrop({

	onDragStart,
	onDragOver,
	onDragEnd,

	children

}: {

	/**
	 * Notified when an element starts being dragged.
	 */
	onDragStart?: (event: DragStartEvent) => void

	/**
	 * Notified when the element dragged moves over a different drop target.
	 */
	onDragOver?: (event: DragOverEvent) => void

	/**
	 * Notified when the element dragged is dropped, or the gesture is cancelled, as `event.canceled` states.
	 */
	onDragEnd?: (event: DragEndEvent) => void

	/**
	 * The components the gestures are offered to.
	 */
	children?: ComponentChildren

}) {

	const [manager] = useState(() => new DragDropManager({
		plugins: defaults => defaults.map(plugin =>
			plugin === Accessibility ? Announcer
				: plugin === Feedback ? Landing
					: plugin
		)
	}));

	useEffect(() => () => manager.destroy(), [manager]); // the manager listens to the document until the context goes

	useEffect(() => { // handlers are swapped on every render, so they always close over the render that gave them

		const { monitor } = manager;

		const detach = [
			monitor.addEventListener("dragstart", event => onDragStart?.(event)),
			monitor.addEventListener("dragover", event => onDragOver?.(event)),
			monitor.addEventListener("dragend", event => onDragEnd?.(event))
		];

		return () => detach.forEach(listener => listener());

	}, [manager, onDragStart, onDragOver, onDragEnd]);

	return createElement(Manager.Provider, { value: manager, children });

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Makes an element a drop target.
 *
 * Renders the component again whenever a dragged element starts or stops hovering over it.
 *
 * @param options The element and its drop target options
 *
 * @returns Whether a dragged element accepted by the target is hovering over it
 */
export function useDroppable(options: DroppableOptions): {

	readonly target: boolean

} {

	const { id, data, disabled, accept, element, ...input } = options;

	return useEntity(
		manager => new Droppable({ ...input, id, data, disabled, accept, register: false }, manager),

		entity => {
			entity.id = id;
			entity.data = data ?? {};
			entity.disabled = disabled ?? false;
			entity.accept = accept;
		},

		entity => ({ target: entity.isDropTarget }),

		entity => {
			entity.element = lookup(element);
		},

		element
	);

}

/**
 * Makes an element an item of a sortable list.
 *
 * Items sharing a `group` within the same {@link DragDrop} context form one list, ordered by their `index`; items in
 * different groups may be dragged from one list into the other. The binding moves no element on its own. The
 * {@link DragDrop} handlers settle the new order, usually as the dragged item moves over another one. The items are
 * then rendered with their new `index` and `group`, and the binding animates each one into its new place. Stating
 * `plugins` replaces this behaviour with the one the given plugins implement.
 *
 * Renders the component again whenever the item starts or stops being dragged, or a dragged item starts or stops
 * hovering over it.
 *
 * @param options The element and its sortable options
 *
 * @returns Whether the item is being dragged, whether it is being dropped, settling into place after a drag, and
 *     whether a dragged item accepted by it is hovering over it
 */
export function useSortable(options: SortableOptions): {

	readonly dragging: boolean
	readonly dropping: boolean
	readonly target: boolean

} {

	const { id, data, disabled, accept, index, group, plugins, element, handle, ...input } = options;

	return useEntity(
		manager => new Sortable({

			...input, id, data, disabled, accept, index, group,

			plugins: plugins ?? [SortableKeyboardPlugin], // keyboard moves without the optimistic reordering of the DOM
			register: false

		}, manager),

		entity => {
			entity.id = id;
			entity.data = data ?? {};
			entity.disabled = disabled ?? false;
			entity.accept = accept;
			entity.index = index;
			entity.group = group;
		},

		entity => ({ dragging: entity.isDragging, dropping: entity.isDropping, target: entity.isDropTarget }),

		entity => {
			entity.element = lookup(element);
			entity.handle = opt(handle, lookup);
		},

		element, handle
	);

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Binds a dnd-kit entity to the lifetime of a component.
 *
 * @param create Creates the entity for the manager of the enclosing context
 * @param update Applies the options followed on every render
 * @param read Reads the state the component renders from the entity
 * @param bind Binds the entity to its elements, once they are rendered
 * @param element The DOM id of the element bound to the entity, rebinding it whenever it changes
 * @param handle The DOM id of the part of the element a drag starts from, rebinding it whenever it changes
 *
 * @returns The state read from the entity, as it stands for this render
 */
function useEntity<E extends Droppable | Sortable, S>(
	create: (manager: Optional<DragDropManager>) => E,
	update: (entity: E) => void,
	read: (entity: E) => S,
	bind: (entity: E) => void,
	element: string,
	handle?: string
): S {

	const manager = useContext(Manager);

	const [entity] = useState(() => create(manager));
	const [state, setState] = useState(() => read(entity));

	/*
	 * Options are applied before the browser paints, so a sortable item taking a new index measures itself where it
	 * stood and animates from there to where the render placed it.
	 */

	useLayoutEffect(() => update(entity));

	/*
	 * Elements exist only once the render is committed, and are bound only as their ids change: while an item is
	 * dragged, dnd-kit stands a placeholder carrying the same id in its place, which a lookup on every render would
	 * bind the item to.
	 */

	useEffect(() => bind(entity), [entity, element, handle]);

	useEffect(() => { // the entity is a foreign lifetime, observed through its signals until the component goes

		const unregister = entity.register();
		const unobserve = effects(() => setState(read(entity)));

		return () => {
			unobserve();
			unregister?.();
			entity.destroy();
		};

	}, [entity]);

	return state;

}

function lookup(id: string): Optional<HTMLElement> {
	return document.getElementById(id) ?? undefined;
}

/**
 * Glides a dropped element into place.
 *
 * The copy dragged glides to where the element stands once the drop is settled, usually the gap left for it where it
 * was dropped. If the drop drew the element afresh elsewhere, for instance back in another list, the copy glides to
 * the new element instead, which dnd-kit would not find on its own, and is removed once it lands.
 *
 * @param context The drop, as dnd-kit describes it
 *
 * @returns A promise settled once the element has landed
 */
function land({ source, element, feedbackElement, placeholder }: Parameters<DropAnimationFunction>[0]): Promise<void> {

	const landed = source.manager?.registry.draggables.get(source.id)?.element ?? element;
	const target = landed === element ? placeholder ?? element : landed;

	const from = feedbackElement.getBoundingClientRect();
	const to = target.getBoundingClientRect();
	const translate = parseTranslate(getComputedStyles(feedbackElement).translate) ?? { x: 0, y: 0 };

	/*
	 * The glide takes the design system's normal step, reading it off the copy as it stands in the page, and none at
	 * all where motion is turned down.
	 */

	const duration = prefersReducedMotion(window) ? 0
		: parseFloat(getComputedStyles(feedbackElement).getPropertyValue("--tile--duration-normal")) || 0;

	return animateTransform({

		element: feedbackElement,

		keyframes: {
			translate: [
				`${translate.x}px ${translate.y}px 0`,
				`${translate.x+to.left-from.left}px ${translate.y+to.top-from.top}px 0`
			]
		},

		options: { duration, easing: "ease" }

	}).then(() => landed === element ? undefined : feedbackElement.remove());

}

/**
 * Checks whether a target is where the element dragged already stands: the element itself, or a target holding it.
 */
function standing(source: Draggable, target: Optional<null | Droppable>): boolean {
	return source.id === target?.id || (target?.element?.contains(source.element ?? null) ?? false);
}

function dragged(source: Draggable): string {
	return name(source.handle ?? source.element, source.id);
}

function targeted(target: Droppable): string {
	return name(target.element, target.id);
}

/**
 * Names an entity for announcements after its element.
 *
 * Follows the order assistive technology names an element by, `aria-label`, then the text of the elements
 * `aria-labelledby` refers to, then the text the element holds, and falls back on the entity id where the element
 * carries no text at all; a local stand-in for accessible name computation, which the platform offers no API for.
 */
function name(element: Optional<Element>, id: UniqueIdentifier): string {

	const texts = [
		element?.getAttribute("aria-label"),
		element?.getAttribute("aria-labelledby")?.split(/\s+/).map(id => document.getElementById(id)?.textContent).join(" "),
		element?.textContent
	];

	return texts.map(text => text?.trim()).find(text => text !== undefined && text.length > 0) ?? String(id);

}
