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
 * Collection range facet.
 *
 * Offers a facet that narrows a collection to the items whose values fall between two bounds. The facet suggests the
 * lowest and highest values on offer, and every lens over the same collection follows the bounds the reader sets.
 *
 * @module
 */

import { useModel } from "@metreeca/clay/model";
import { opt, type Optional } from "@metreeca/core";
import type { Relay } from "@metreeca/core/relay";
import { createState } from "@metreeca/core/state";
import { isLiteral, type Literal } from "@metreeca/qest/state";
import type { RangeCases } from "@metreeca/tile/range";
import type { Type } from "@metreeca/tile/types";
import { CalendarIcon, ClockIcon, HashIcon, TypeIcon, XCircleIcon } from "lucide-preact";
import { type ComponentType, createElement } from "preact";
import { useEffect, useId } from "preact/hooks";
import { createFold } from "../index.core.js";
import { AutoDelay, cancel, Disclosure, Failure, keys, leave } from "../index.js";
import "./range.css";


/**
 * Creates a collection range facet.
 *
 * Shows a `From` and a `To` field on the native input suited to the value type: a `number` input for numbers and years,
 * a `date`, `time` or `datetime-local` input for temporal values, and a `text` input otherwise. Each field holds its
 * bound, if one is set. While empty, it suggests the lowest or highest value on offer, formatted as the type shows it.
 * An empty temporal field shows its suggestion as text, because the native input would draw its own entry mask in its
 * place, and turns into the native input as it takes focus. A field taking focus selects its text, so whatever the
 * reader types replaces it rather than adding to it.
 *
 * A bound is applied once the reader pauses typing or stepping through values, or at once on `Enter` or on leaving the
 * field, so a run of steps narrows the collection only once. A temporal field waits for `Enter` or for the reader to
 * leave it, because its entry mask signals every segment change as a new value. Text the field rejects waits as well,
 * such as a year typed partway that falls short of the lowest one on offer. An emptied field removes its bound, and
 * text the type cannot read leaves the bound unchanged. Where the input orders its values natively, each field is
 * constrained by the other, and an empty one by the lowest or highest value on offer. The two bounds never cross, and
 * stepping through values starts from a value the items hold.
 *
 * A button marked by the reset glyph, shown while a bound is set, removes both bounds at once and leaves the facet
 * suggesting the values on offer again, as it did before the reader set either.
 *
 * A collapsible facet, one stating whether it is `compact`, folds down to its fields only while a bound is set.
 * Clicking its header opens it while the reader works on it, and focus leaving the facet closes it again; a disclosure
 * marked by the expand glyph opens it to stay open, until the reader closes it by the same disclosure. A compact facet
 * starts closed, any other starts open, as if opened by its disclosure when first rendered.
 *
 * The facet is a group named by `name`, shown in its header beside a glyph marking the value type, and marked busy
 * while the values are retrieved for the first time; a failed retrieval is shown as a critical note in place of the
 * fields, which the reader cannot work on until a later retrieval brings the values back.
 *
 * ```tsx
 * const collection = useCollection({ entry: "/courses/", shape: Course });
 *
 * <Range name="Year" type={year} range={useRange(collection, "year")}/>
 * ```
 *
 * @param options The widget configuration
 *
 * @returns The facet
 */
export function Range({

	name,

	compact,

	type,

	range

}: {

	/**
	 * The name of the facet, stating what its bounds apply to, as in `Year`.
	 *
	 * The name is shown in the header of the facet, and labels the group for assistive technology.
	 */
	name: string

	/**
	 * Whether the facet starts closed, showing its fields only while a bound is set; open from the start if omitted.
	 *
	 * Either way, the reader opens and closes the facet by its disclosure or by clicking its header.
	 */
	compact?: boolean

	/**
	 * The type of the bounded values, choosing the native input the fields work on and how values are shown and read.
	 *
	 * The default type for a shape is picked by {@link @metreeca/tile!types.toType toType}. A type shown as another
	 * offers a different input over the same values, as `instant.as(date)` bounds instants by day. The `To` field reads
	 * its text as an upper bound, so a day or a year typed there takes in all of it.
	 */
	type: Type

	/**
	 * The range offered, as handed by {@link @metreeca/tile!range.useRange useRange}.
	 */
	range: Relay<RangeCases>

}) {

	const id = useId();

	const collapsible = compact !== undefined;

	// a facet starting open is opened as by its disclosure, so it stays open until the reader closes it

	const { open: unfolded, expand, collapse, toggle } = useModel(() => compact === false
		? createFold().toggle()
		: createFold()
	);

	const { field: focused, enter, leave: quit } = useModel(() => createFocus());
	const { edit, change, settle } = useModel(() => createPending());

	const input = Inputs[type.label] ?? "text";

	/*
	 * A pending edit is applied once the reader pauses, a timer the browser alone keeps, released by the next edit. A
	 * masked input reports each segment the reader changes as a complete value, so a pause between segments would
	 * apply a value the reader is still composing: its edits wait for the reader to commit the field instead. Text the
	 * field rejects may be a value typed partway, `19` on the way to `1995`, so a pause leaves it pending as well.
	 */

	useEffect(() => edit === undefined || !edit.valid || Masked.has(input)
		? undefined
		: cancel(setTimeout(apply, AutoDelay)), [edit]);
	const Glyph = Glyphs[type.label] ?? TypeIcon;

	const bounded = range({ ready: ({ lower, upper }) => lower !== undefined || upper !== undefined }) ?? false;
	const failed = range({ error: () => true }) ?? false;
	const ready = range({ ready: () => true }) ?? false;

	const open = !collapsible || unfolded;

	// the fields wait for the values on offer, so the facet never shows a strip it is about to fill

	const shown = failed || ready && (open || bounded);

	return createElement("tile-range", {

		"role": "group",
		"aria-labelledby": `${id}-name`,
		"aria-busy": range({ blank: () => true }),

		"wide": input === "date" || input === "datetime-local" || undefined,

		"onFocusOut": collapsible ? (event: FocusEvent) => leave(event, collapse) : undefined

	}, <>

		{/* a collapsible header takes focus as clicked, opening the facet only as it takes focus itself, not its buttons */}

		<header tabIndex={collapsible ? -1 : undefined} onFocusIn={collapsible ? (event: FocusEvent) => {
			if ( event.target === event.currentTarget ) { expand(); }
		} : undefined}>

			<Glyph/>

			<span id={`${id}-name`}>{name}</span>

			<span>

				{bounded && <button type="button"

					title={"Reset"}

					onClick={() => {
						settle();
						range({ ready: ({ clear }) => clear() });
					}}

				><XCircleIcon/></button>}

				{collapsible && <Disclosure open={open} controls={`${id}-fields`} onToggle={toggle}/>}

			</span>

		</header>

		<section id={`${id}-fields`} hidden={!shown}>{shown && range({

			/*
			 * The values on offer are narrowed by the bounds themselves, so they hold a field to its own side only
			 * while it is empty: a bound set would otherwise stand outside the very limits it narrowed.
			 */

			ready: ({ state: { min, max }, lower, upper }) => <>

				{field({
					id: "lower", focused: focused === "lower",
					min: lower === undefined ? min : undefined, max: upper ?? max, placeholder: min, value: lower
				})}

				{field({
					id: "upper", focused: focused === "upper",
					min: lower ?? min, max: upper === undefined ? max : undefined, placeholder: max, value: upper
				})}

			</>,

			error: () => <Failure/>

		})}</section>

	</>);


	/**
	 * Renders a bound field. It is called as a function rather than mounted as a component, so the input keeps its
	 * identity across renders, along with the focus it holds while turning from a text field into a native one.
	 */
	function field({

		id,
		focused,

		min,
		max,
		placeholder,
		value

	}: {

		id: "lower" | "upper"
		focused: boolean

		min: Optional<Literal>
		max: Optional<Literal>
		placeholder: Optional<Literal>
		value: Optional<Literal>

	}) {

		/*
		 * The field shows the edit pending on it for as long as the bound it was made over stands, so a bound changed
		 * elsewhere takes its place. An empty field the reader turns to starts from the value it suggests, so typing
		 * over it or stepping from it begins where the items begin, rather than where the native input would.
		 */

		const bound = write(value) ?? "";
		const hint = write(placeholder) ?? "";

		const pending = edit !== undefined && edit.field === id && edit.from === bound ? edit.text : undefined;
		const text = pending ?? (bound === "" && focused && input !== "text" ? hint : bound);

		/*
		 * A native temporal input ignores its placeholder, so an empty field the reader is not working on is shown as
		 * a text field carrying the suggestion, and turns into the native input as it takes focus.
		 */

		const shown = text === "" && !focused && Masked.has(input) ? "text" : input;
		const ordered = shown !== "text";

		return <input type={shown} value={text} placeholder={format(placeholder)}

			aria-label={id === "lower" ? "From" : "To"}

			min={ordered ? write(min) : undefined}
			max={ordered ? write(max) : undefined}

			// an ordered field takes any value, rather than only the ones a whole step away from its lower limit

			step={ordered ? "any" : undefined}

			onFocusIn={event => {
				enter(id);
				select(event.currentTarget);
			}}
			onFocusOut={event => {
				quit();
				apply(read(event.currentTarget));
			}}
			onInput={event => change(read(event.currentTarget))}
			onKeyDown={event => keys({ Enter: () => apply(read(event.currentTarget)) })(event)}

			// the click focusing the field would otherwise drop the selection as the button is released

			onMouseUp={event => event.preventDefault()}

		/>;


		/**
		 * Selects the text a field taking focus shows, so typing replaces it at once. The selection waits for the
		 * render, which drops any selection made before it as it writes the suggestion an empty field starts from.
		 */
		function select(element: HTMLInputElement): void {
			setTimeout(() => element.select());
		}


		/**
		 * Reads the edit a field holds straight off the field, so a commit following an edit before any render applies
		 * what the reader typed rather than the edit the last render saw, which may lag a keystroke behind.
		 */
		function read(element: HTMLInputElement): Edit {
			return { field: id, text: element.value, valid: element.checkValidity(), from: bound, hint };
		}

	}


	function write(value: Optional<Literal>): Optional<string> {
		return opt(value, value => type.write(value));
	}

	function format(value: Optional<Literal>): Optional<string> {
		return opt(value, value => type.format(value));
	}

	/**
	 * Applies an edit and lets it go: an emptied field removes its bound, and text the field rejects or the type cannot
	 * read leaves the bound as it was, as do text restating the bound and a suggestion taken over unchanged.
	 *
	 * @param latest The edit to apply; the pending one, if omitted
	 */
	function apply(latest: Optional<Edit> = edit): void {
		opt(latest, ({ field, text, valid, from, hint }) => {

			const trimmed = text.trim();
			const kept = trimmed === from || from === "" && trimmed === hint;
			const bound = !valid || kept ? undefined : trimmed === "" ? null : parse(trimmed, field === "upper");

			opt(bound, bound => range({
				ready: ({ narrow }) => narrow(field === "lower" ? { lower: bound } : { upper: bound })
			}));

			settle();

		});
	}

	function parse(text: string, upper: boolean): Optional<Literal> {
		try {
			return opt(type.parse(text, { upper }), value => isLiteral(value) ? value : undefined);
		} catch {
			return undefined;
		}
	}

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * The native input each value type works on, by type label; any other type works on a `text` input.
 */
const Inputs: Readonly<Record<string, Optional<string>>> = {

	integer: "number",
	decimal: "number",
	year: "number",
	date: "date",
	time: "time",
	instant: "datetime-local"

};

/**
 * The native inputs drawing an entry mask of their own in place of the placeholder.
 */
const Masked: ReadonlySet<string> = new Set(["date", "time", "datetime-local"]);

/**
 * The glyph marking the facet for each value type, by type label; any other type is marked by the text glyph.
 */
const Glyphs: Readonly<Record<string, Optional<ComponentType>>> = {

	integer: HashIcon,
	decimal: HashIcon,
	year: CalendarIcon,
	date: CalendarIcon,
	time: ClockIcon,
	instant: CalendarIcon

};


/**
 * The field holding focus, so an empty temporal field shows its suggestion while the reader works elsewhere.
 *
 * Focus moving between the fields leaves one and enters the other before any render, and transitions read the state
 * the render left: each sets the field outright rather than amending it, so the one fired last is the one that holds.
 */
interface Focus {

	readonly field: Optional<"lower" | "upper">;

	enter(field: "lower" | "upper"): this;

	leave(): this;

}

/**
 * An edit made on a field and not yet applied to the bound it states.
 */
interface Edit {

	/**
	 * The field edited.
	 */
	readonly field: "lower" | "upper";

	/**
	 * The text the field holds.
	 */
	readonly text: string;

	/**
	 * Whether the field accepted the text, under its native type and constraints.
	 */
	readonly valid: boolean;

	/**
	 * The bound the edit was made over, as the field showed it.
	 */
	readonly from: string;

	/**
	 * The value the field suggested, as the field showed it.
	 */
	readonly hint: string;

}

/**
 * The edit pending on the fields, so a run of keystrokes or steps narrows the collection once rather than at each.
 * An edit is let go once applied, so it never stands in for a bound that later returns to the value it was made over.
 */
interface Pending {

	readonly edit: Optional<Edit>;

	change(edit: Edit): this;

	settle(): this;

}

function createPending(): Pending {
	return createState<Pending>({

		edit: undefined,

		change(edit) {
			return { edit };
		},

		settle() {
			return { edit: undefined };
		}

	});
}

function createFocus(): Focus {
	return createState<Focus>({

		field: undefined,

		enter(field) {
			return { field };
		},

		leave() {
			return { field: undefined };
		}

	});
}
