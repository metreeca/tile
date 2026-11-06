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
 * Localised text values.
 *
 * @module
 */

import { isString } from "@metreeca/core";
import { isTag, matchTag } from "@metreeca/core/language";
import { immutable } from "@metreeca/core/values";
import { type Dictionary, isDictionary } from "@metreeca/qest/state";
import { inconvertible, mismatched } from "./index.core.js";
import type { Type } from "./index.js";


/**
 * Localised text type.
 *
 * Shows language-tagged text as the text tagged with the best match for the reader locales, else the English text,
 * else the first text found; several texts for the chosen language are joined into one localised list.
 *
 * A text input edits the text shown, and what it yields is read back as text in the language of the first reader
 * locale, so a dictionary holding several languages is edited one language at a time.
 */
export const text: Type<Dictionary> = immutable({

	label: "text",


	format(value, options) {

		return text.write(value, options);

	},

	write(value, { locales } = {}) {

		const entries = Object.entries(isDictionary(value) ? value : mismatched("text", value));

		const preferred = locales === undefined
			? [new Intl.NumberFormat().resolvedOptions().locale]
			: [locales].flat().map(String);

		const matched = preferred
			.filter(isTag)
			.map(locale => entries.find(([tag]) => matchTag(locale, tag)))
			.find(entry => entry !== undefined);

		const [, chosen] = matched ?? entries.find(([tag]) => tag === "en") ?? entries[0] ?? ["", ""];

		return isString(chosen) ? chosen : new Intl.ListFormat(locales, {
			type: "unit",
			style: "short"
		}).format(chosen);

	},

	parse(text, { locales } = {}) {

		const [preferred = "en"] = locales === undefined
			? [new Intl.NumberFormat().resolvedOptions().locale]
			: [locales].flat().map(String);

		return { [new Intl.Locale(preferred).language]: text };

	},


	as(type) {

		return type === text ? type
			: inconvertible("text", type);

	}

});
