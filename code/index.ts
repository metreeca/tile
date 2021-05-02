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

import { createContext } from "preact";
import { LinkGraph } from "./graphs/link";

//// Contexts //////////////////////////////////////////////////////////////////////////////////////////////////////////

export const Graph=createContext(LinkGraph());


//// Events ////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a trapping event listener.
 *
 * @param handler the delegate event handler
 *
 * @returns a listener delegating to [[handler]] all events whose default action was not prevented by a previous handler;
 * the default action of delegated events is prevented and their propagation stopped
 */
export function trapping(handler: EventListener | EventListenerObject): EventListener {

	const delegate=listener(handler);

	return function (this: any, e: Event) {
		if ( !e.defaultPrevented ) {

			e.preventDefault();
			e.stopPropagation();

			delegate(e);

		}
	};
}

/**
 * Creates a leading event listener.
 *
 * @param period the length of the observation period in ms; ignored if equal to `0`
 * @param handler the delegate event handler
 *
 * @returns a handler delegating to [[`handler`]] only those events that were not preceded by other events
 * within [[`period`]]

 * @throws [[`RangeError`]] if [[`period`]] is less than 0
 */
export function leading(period: number, handler: EventListener | EventListenerObject): EventListener {

	if ( period < 0 ) {
		throw new RangeError(`negative period {${period}}`);
	}

	if ( period === 0 ) { return listener(handler); } else {

		let last: number;

		const delegate=listener(handler);

		return (function (this: any, e: Event) {

			if ( !last || last+period <= e.timeStamp ) { delegate(e); }

			last=e.timeStamp;

		});
	}
}

/**
 * Creates a trailing event listener.
 *
 * @param period the length of the observation period in ms; ignored if equal to `0`
 * @param handler the delegate event handler
 *
 * @returns a listener delegating to [[handler]] only those events that were not followed by other events
 * within [[`period`]]
 *
 * @throws [[`RangeError`]] if [[`period`]] is less than 0
 */
export function trailing(period: number, handler: EventListener | EventListenerObject): EventListener {

	if ( period < 0 ) {
		throw new RangeError(`negative period {${period}}`);
	}

	if ( period === 0 ) { return listener(handler); } else {

		let last: number;

		const delegate=listener(handler);

		return function (this: any, e: Event) {

			const memo: any={};

			for (let p in e) { memo[p]=(<any>e)[p]; } // memoize event with non-enumerable properties

			last=e.timeStamp;

			setTimeout((function (this: any, e: Event) {

				if ( last === memo.timeStamp ) { delegate(e); }

			}).bind(this), period, memo);

		};
	}
}

/**
 * Creates a throttling event listener.
 *
 * @param period the length of the observation period in ms; ignored if equal to `0`
 * @param handler the delegate event handler
 *
 * @returns a listener delegating to [[`handler`]] only the first event within each [[`period`]]
 *
 * @throws [[`RangeError`]] if [[`period`]] is less than 0
 */
export function throttling(period: number, handler: EventListener | EventListenerObject): EventListener {

	if ( period < 0 ) {
		throw new RangeError(`negative period {${period}}`);
	}

	if ( period === 0 ) { return listener(handler); } else {

		let last: number;

		const delegate=listener(handler);

		return function (this: any, e: Event) {

			if ( !last || last+period <= e.timeStamp ) {

				delegate(e);

				last=e.timeStamp;

			}

		};

	}
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function listener(handler: EventListener | EventListenerObject) {
	return (e: Event) => {

		if ( object(handler) ) {
			handler.handleEvent(e);
		} else {
			handler(e);

		}

	};
}

function object(listener: EventListener | EventListenerObject): listener is EventListenerObject {
	return listener.hasOwnProperty("handleEvent");
}
