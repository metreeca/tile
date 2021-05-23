/*
 * Copyright © 2020-2021 Metreeca srl
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


import { StateUpdater, useEffect, useState } from "preact/hooks";

export function useValue<V>(value: V): [V, StateUpdater<V>] {

	const init=value instanceof Function ? () => value : value;

	const [state, setState]=useState<V>(init);

	useEffect(() => setState(init), [value]);

	return [state, setState];

}
