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

import { isArray, isDefined, isEmpty, isObject } from "../type/src/index.js";
import { Frame } from "@metreeca/core/frame";
import { isNumber } from "@metreeca/core/number";
import { isString } from "@metreeca/core/string";
import { Value } from "@metreeca/core/value";
import { Setter } from "@metreeca/data/hooks";
import { focus, input } from "@metreeca/view/widgets/form";
import { ClearIcon, RemoveIcon } from "@metreeca/view/widgets/icon";
import * as React from "react";
import { Fragment, ReactNode, useState } from "react";


/**
 * Resource form fields.
 *
 * @module
 */

export type Field<V>=OptionalField<V> | RequiredField<V> | MultipleField<V> | RepeatableField<V>


export interface OptionalField<V> extends BaseField<V> {

	readonly required?: false;
	readonly multiple?: false;

	readonly children: [undefined | V, Setter<undefined | V>];

}

export interface RequiredField<V> extends BaseField<V> {

	readonly required: true;
	readonly multiple?: false;

	readonly children: [V, Setter<V>];

}

export interface MultipleField<V> extends BaseField<V> {

	readonly required?: false;
	readonly multiple: true;

	readonly children: [undefined | V[], Setter<undefined | V[]>];

}

export interface RepeatableField<V> extends BaseField<V> {

	readonly required: true;
	readonly multiple: true;

	readonly children: [V[], Setter<V[]>];

}


export interface BaseField<V> {

	readonly editable?: boolean;
	readonly disabled?: boolean;
	readonly readonly?: boolean;

	/**
	 * The input placeholder string.
	 */
	readonly placeholder?: string;

	readonly validity?: (value: V) => string;

}


export function isOptionalField<V>(field: Field<V>): field is OptionalField<V> {
	return !field.required && !field.multiple;
}

export function isRequiredField<V>(field: Field<V>): field is RequiredField<V> {
	return !!field.required && !field.multiple;
}

export function isMultipleField<V>(field: Field<V>): field is MultipleField<V> {
	return !field.required && !!field.multiple;
}

export function isRepeatableField<V>(field: Field<V>): field is RepeatableField<V> {
	return !!field.required && !!field.multiple;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function createField<V>({

	field,

	reader,
	editor

}: {

	field: Field<V>

	reader: (props: { value: V }) => ReactNode,
	editor: (props: { required: boolean; state: [undefined | V, Setter<undefined | V>] }) => ReactNode

}) {

	return isOptionalField<V>(field) ? optional(field)
		: isRequiredField<V>(field) ? required(field)
			: isMultipleField<V>(field) ? multiple(field)
				: isRepeatableField<V>(field) ? repeatable(field)
					: null;


	function optional({ editable, children: [value, setValue] }: OptionalField<V>) {

		return editable ? edit() : read();


		function read() {
			return value ? reader({ value }) : createPlaceholder();
		}

		function edit() {
			return <header>{editor({
				required: false,
				state: [value, setValue]
			})}</header>;
		}

	}

	function required({ editable, children: [value, setValue] }: RequiredField<V>) {

		return editable ? edit() : read();


		function read() {
			return reader({ value });
		}

		function edit() {

			function set(value: undefined | V) {
				setValue(value as any); // ;( force undefined values during editing
			}

			return <header>{editor({
				required: true,
				state: [value || undefined, value => set(value)]
			})}</header>;
		}

	}

	function multiple({ editable, children: [values, setValues] }: MultipleField<V>) {

		return editable ? edit() : read();


		function read() {
			return values?.length

				? <>{[...new Set(values)].sort().map((value, index) =>
					<Fragment key={index}>{reader({ value })}</Fragment>
				)}</>

				: createPlaceholder();
		}

		function edit() {

			const items=[...new Set(values)].sort();


			function insert(value: undefined | V) {
				if ( value !== undefined ) { setValues([...new Set(items).add(value)].sort()); }
			}

			function remove(value: V) {

				const filtered=items.filter(item => item !== value);

				setValues(filtered.length ? filtered : undefined);
			}


			return <>

				<header>{editor({
					required: false,
					state: [undefined, insert]
				})}</header>

				{values?.map((value, index) => <section key={index}>

					{reader({ value })}

					<button title={"Remove"}

						onClick={e => {

							try {

								remove(value);

							} finally {

								input(e.currentTarget);

							}

						}}

					><RemoveIcon/></button>

				</section>)}

			</>;
		}

	}

	function repeatable({ editable, children: [values, setValues] }: RepeatableField<V>) {

		return editable ? edit() : read();


		function read() {
			return values?.length

				? <>{[...new Set(values)].sort().map((value, index) =>
					<Fragment key={index}>{reader({ value })}</Fragment>
				)}</>

				: createPlaceholder();
		}

		function edit() {

			const items=[...new Set(values)].sort();


			function insert(value: undefined | V) {
				if ( value !== undefined ) { setValues([...new Set(items).add(value)].sort()); }
			}

			function remove(value: V) {
				setValues(items.filter(item => item !== value));
			}


			return <>

				<header>{
					<header>{editor({
						required: !values?.length,
						state: [undefined, insert]
					})}</header>
				}</header>

				{items.map((value, index) => <section key={index}>
					{reader({ value })}
					<button title={"Remove"} onClick={() => remove(value)}><RemoveIcon/></button>
				</section>)}

			</>;
		}

	}

}

export function createPlaceholder(label?: string) {
	return <small>{label || "No Value"}</small>;
}

export function TileFieldClear({

	children: [value, setValue]

}: {

	children: [undefined | string, Setter<undefined | string>],

}) {

	const [initial]=useState(value);


	function clear() {
		setValue(undefined);
	}


	return !(initial && initial === value) ? null : <button title={"Clear"}

		onClick={e => {

			try { clear(); } finally {

				input(e.currentTarget);
				focus(e.currentTarget.previousSibling);

			}

		}}

	><ClearIcon/></button>;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function useModel<F extends Frame>(frame: F): [F, (frame: F) => void];
export function useModel<F extends Frame>(frame: undefined | F): [undefined | F, (frame: F) => void];

export function useModel<F extends Frame>(frame: undefined | F): [undefined | F, (frame: F) => void] {

	return useState(prune(frame));

}


export type Fields<E extends Frame>={ [K in keyof E]: [E[K], Setter<E[K]>] }


export function fields<F extends Frame>([value, setValue]: [F, Setter<F>]): Fields<F> {
	return Object.entries(value).reduce((fields, [k, v]) => ({

		...fields,

		[k]: [v, (u: typeof v) => setValue({ ...value, [k]: u })]

	}), {} as Fields<typeof value>);
}

export function _fields<F extends Frame, R>(
	[value, setValue]: [undefined | F, Setter<F>],
	mapper: ((fields: Fields<F>) => R)
): undefined | R {

	return isDefined(value)

		? mapper(fields<F>([value, setValue]))

		: undefined;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Prune model frames, recursively removing default values.
 *
 * @param model
 */
function prune<F extends Frame>(model: undefined | F): typeof model {

	return model === undefined ? undefined : Object.entries(model).reduce((pruned, [label, value]) => {

		return { ...pruned, [label]: prune(value) };

	}, {} as F);


	function prune<V extends Value>(value: Frame[string]): typeof value {

		if ( isNumber(value) ) {

			return value === 0 || isNaN(value) ? undefined : value;

		} else if ( isString(value) ) {

			return value || undefined;

		} else if ( isArray<Value>(value) ) {

			const pruned=value.map(prune).filter(v => v !== undefined);

			return isEmpty(pruned) ? undefined : pruned as typeof value;

		} else if ( isObject(value) ) {

			const pruned=Object.entries(value).reduce((accumulator, [label, value]) => {

				const pruned=prune(value);

				return pruned === undefined ? accumulator : { ...accumulator, [label]: pruned };

			}, {});

			return isEmpty(pruned) ? undefined : pruned as typeof value;

		} else {

			return undefined;

		}

	}

}
