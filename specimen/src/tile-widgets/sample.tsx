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
 * Widget samples.
 *
 * Presents a widget in an outline of its own, so the area it takes is read off the outline rather than off the prose
 * around it.
 *
 * @module
 */

import { type ComponentChildren } from "preact";
import "./index.css";


/**
 * Creates an outlined sample.
 *
 * Sets a widget in a dashed outline, as large as what it holds or as the set around it stretches it to, and names
 * what the sample shows beneath it, where a label is given.
 *
 * @param options The widget configuration
 *
 * @returns The outlined sample
 */
export function Sample({ label, children }: {

	/**
	 * What the sample shows; no caption is set beneath the outline if omitted.
	 */
	label?: ComponentChildren

	/**
	 * The widget the outline holds.
	 */
	children: ComponentChildren

}) {
	return <figure class="sample">
		<div>{children}</div>
		{label && <figcaption>{label}</figcaption>}
	</figure>;
}
