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
 * Boolean values.
 *
 * @module
 */

import { isBoolean } from "@metreeca/core";
import { immutable } from "@metreeca/core/values";
import type { Type } from "./index.js";
import { malformed, mismatched } from "./index.core.js";


/**
 * Boolean type.
 *
 * Shows truth values as `true` or `false`, and moves them to and from the same text, leaving their presentation as a
 * checkbox, a switch or a pair of labels to the view, which knows what each value means to its readers.
 */
export const boolean: Type<boolean> = immutable({

	label: "boolean",

	format(value) {
		return boolean.write(value);
	},

	write(value) {
		return isBoolean(value) ? String(value) : mismatched(boolean.label, value);
	},

	parse(text) {
		return text === "true" ? true
			: text === "false" ? false
				: malformed(boolean.label, text);
	}

});
