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
 * Resource reference values.
 *
 * @module
 */

import { isObject, isString } from "@metreeca/core";
import { getIRILabel, isIRI } from "@metreeca/core/resource";
import { immutable } from "@metreeca/core/values";
import type { Reference, Resource } from "@metreeca/qest/state";
import type { Type } from "./index.js";
import { isDictionary, malformed, mismatched } from "./index.core.js";
import { text } from "./text.js";


/**
 * Resource reference type.
 *
 * Shows a reference by the label derived from its identifier, as `Fine Arts` for
 * `https://example.com/terms#FineArts`; a resource, or a reference retrieved along with some of its members, is shown
 * by its `label`, plain or localised, else by the label derived from its `id`, else as empty text.
 *
 * Inputs edit the identifier, and what they yield is read back as a reference, either absolute or root-relative.
 */
export const reference: Type<Reference | Resource> = immutable({

	label: "reference",

	format(value, options) {
		return isString(value) ? getIRILabel(value) ?? value
			: !isObject(value) ? mismatched("reference", value)
				: isString(value.label) ? value.label
					: isDictionary(value.label) ? text.format(value.label, options)
						: isString(value.id) ? getIRILabel(value.id) ?? value.id
							: "";
	},

	write(value) {
		return isString(value) ? value
			: isObject(value) && isString(value.id) ? value.id
				: mismatched("reference", value);
	},

	parse(text) {
		return isIRI(text, "internal") ? text : malformed("reference", text);
	}

});
