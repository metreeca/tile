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

import { some, type Some, unique } from "@metreeca/core/arrays";
import { createState } from "@metreeca/core/state";


export interface Selection<T> {

	readonly items: readonly T[];


	toggle(items: Some<T>, force?: boolean): this;

	clear(): this;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function Selection<T>({

	items

}: {

	items?: Some<T>

} = {}) {

	return createState<Selection<T>>({

		items: unique(some(items)),

		toggle(items: Some<T>, force?: boolean) {

			const delta = unique(some(items));

			if ( delta.length === 0 ) {

				return {};

			} else if ( force === false ) { // force exclude: ensure items are absent

				const retained = this.items.filter(item => !delta.includes(item));

				return retained.length === this.items.length ? {} : { items: retained };

			} else if ( force === true ) { // force include: ensure items are present

				const inserted = delta.filter(item => !this.items.includes(item));

				return inserted.length > 0 ? { items: [...this.items, ...inserted] } : {};

			} else { // toggle mode: add if absent, remove if present

				const retained = this.items.filter(item => !delta.includes(item));
				const inserted = delta.filter(item => !this.items.includes(item));

				return { items: [...retained, ...inserted] };
			}

		},

		clear() {

			return this.items.length > 0 ? { items: [] } : {};

		}

	});

}
