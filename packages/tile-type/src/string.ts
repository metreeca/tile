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
 * String values.
 *
 * @module
 */

import { isString } from "@metreeca/core";
import { immutable } from "@metreeca/core/values";
import type { Type } from "./index.js";
import { mismatched, inconvertible } from "./index.core.js";


/**
 * String type.
 *
 * Shows and edits strings as stored, whatever their language: localised text belongs to {@link "text"!text text}.
 */
export const string: Type<string> = immutable({

	label: "string",


	format(value) {

		return string.write(value);

	},

	write(value) {

		return isString(value) ? value : mismatched("string", value);

	},

	parse(text) {

		return text;

	},


	as(type) {

		return type === string ? type
			: inconvertible("string", type);

	}

});
