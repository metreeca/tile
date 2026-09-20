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
 * Preact widgets and controls.
 *
 * Supplies the pieces a widget declares its props out of, so a control offers the surface the platform already
 * carries without restating it. The widgets themselves come from their own modules, leaving a screen with the ones it
 * renders and nothing else.
 *
 * @module index
 */

import { type JSX } from "preact";


/**
 * Native event handlers.
 *
 * Collects every event handler prop an element accepts, so a gesture a widget doesn't itself interpret is wired
 * straight on the control it renders rather than around the widget.
 *
 * @typeParam T The tag of the element whose handlers are taken
 */
export type Handlers<T extends keyof JSX.IntrinsicElements> =
	Pick<JSX.IntrinsicElements[T],
		Extract<keyof JSX.IntrinsicElements[T], `on${string}`>
	>;
