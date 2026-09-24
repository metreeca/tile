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
 * Headless component state.
 *
 * Turns an immutable state object into the state of a component: {@link useModel} holds it for the lifetime of the
 * component and renders again after every transition that changes something, so behaviour defined once as a state
 * object drives any component that adopts it.
 *
 * **Usage**
 *
 * Declare what the component is responsible for as a state interface, with read-only data and transition methods:
 *
 * ```typescript
 * interface Counter {
 *
 *   readonly value: number;
 *
 *   up(): this;
 *   reset(): this;
 *
 * }
 * ```
 *
 * Give it a factory, which may carry the name of the interface it builds, types and values living in separate
 * namespaces:
 *
 * ```typescript
 * import { createState } from "@metreeca/core/state";
 *
 * function Counter() {
 *   return createState<Counter>({
 *
 *     value: 0,
 *
 *     up() { return { value: this.value + 1 }; },
 *     reset() { return { value: 0 }; }
 *
 *   });
 * }
 * ```
 *
 * A component exported under that same name claims it first, and a module importing both has room for only one: name
 * the factory `createCounter` wherever a component already answers to `Counter`.
 *
 * Then read data and transitions off the model: a transition is bound to the state it was read from, so a
 * zero-argument one goes straight to a handler, and any of them may be stored and passed on:
 *
 * ```tsx
 * export function CounterButton() {
 *
 *   const { value, up, reset } = useModel(Counter);
 *
 *   return <>
 *     <button onClick={up}>+</button>
 *     <button onClick={reset}>~</button>
 *     <output>{value}</output>
 *   </>;
 *
 * }
 * ```
 *
 * **Transitions do not accumulate**
 *
 * What a handler holds is the state of the render that read it, and a transition always starts from there, so taking
 * one twice lands where taking it once does:
 *
 * ```typescript
 * const twice = () => {
 *   up();   // value + 1
 *   up();   // value + 1 again, not value + 2
 * };
 * ```
 *
 * A transition also notifies asynchronously, so the data read alongside it keeps the earlier value for the rest of
 * the handler, and the new one arrives with the next render:
 *
 * ```typescript
 * const report = () => {
 *   up();
 *   console.log(value);   // still the value before the transition
 * };
 * ```
 *
 * **Unmounting**
 *
 * A model needs no cleanup when the component goes away, nothing outliving it to detach from: the model, its
 * observers and the setter they notify become unreachable together. This holds as long as models stay local to the
 * component, so a model is never parked in a module-level cache or handed to an external store. A transition taken
 * just before unmounting notifies after it, which the state module absorbs without effect.
 *
 * @module
 */

import { eager, type Lazy } from "@metreeca/core";
import { type Instance, manageState, type State } from "@metreeca/core/state";
import { useState } from "preact/hooks";


/**
 * Adopts a state object as the state of a component.
 *
 * Renders the component again after every transition that changes something; a transition that changes nothing
 * returns the same state and renders nothing.
 *
 * @typeParam T The state interface
 *
 * @param model The model, or a factory creating it; resolved once, when the component first renders, so a factory
 * may be written inline and close over props, at the cost of capturing them as they stood then: a prop changing
 * later never reaches the model
 *
 * @returns The model as it stands for this render, superseded by the next one after every transition that changes
 * something
 */
export function useModel<T extends State<T>>(model: Lazy<Instance<T>>): Instance<T> {

	const [current, setCurrent] = useState(() => manageState(eager(model)).attach(state => setCurrent(state)));

	return current;

}
