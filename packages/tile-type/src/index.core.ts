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
 * Value type failures.
 *
 * The uniform errors every value type raises for values, text and conversions that don't fit it.
 *
 * @module
 */

import { error } from "@metreeca/core";


/**
 * Rejects a value that doesn't fit a type.
 *
 * @throws {@link !TypeError TypeError} Always
 */
export function mismatched(label: string, value: unknown): never {
	return error(new TypeError(`mismatched ${label} value <${JSON.stringify(value)}>`));
}

/**
 * Rejects text that is not well-formed for a type.
 *
 * @throws {@link !SyntaxError SyntaxError} Always
 */
export function malformed(label: string, text: string): never {
	return error(new SyntaxError(`malformed ${label} <${text}>`));
}

/**
 * Rejects showing the values of a type as another type.
 *
 * @throws {@link !TypeError TypeError} Always
 */
export function inconvertible(label: string, type: { readonly label: string }): never {
	return error(new TypeError(`inconvertible ${label} values as <${type.label}>`));
}
