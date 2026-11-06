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
 * General-purpose helpers.
 *
 * @module
 */

import type { Optional } from "@metreeca/core";


/**
 * Runs a computation that may fail.
 *
 * @typeParam T The outcome of the computation
 *
 * @param computation The computation to run
 *
 * @returns The outcome of `computation`, or `undefined` if it throws
 */
export function attempt<T>(computation: () => T): Optional<T> {

	try {
		return computation();
	} catch {
		return undefined;
	}

}
