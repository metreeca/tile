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


//// Helpers ///////////////////////////////////////////////////////////////////////////////////////////////////////////

export function classes(classes: { [name: string]: boolean }) {
	return Object.entries(classes)
		.filter(entry => entry[1])
		.map(entry => entry[0])
		.join(" ");
}

export function active(link: string) {

	const hash=link.startsWith("#");
	const tail=link.endsWith("/*");

	const href=tail ? link.substr(0, link.length-1) : link;

	function matches(target: string, current: string) {
		return tail ? current.startsWith(target) : current === target;
	}

	return {
		href: href,
		active: matches(href, hash ? location.hash : location.href)
	};
}


export function normalize(text: string) {
	return text.trim().replace(/\s+/g, " ");
}


//// Events ////////////////////////////////////////////////////////////////////////////////////////////////////////////

export type TargetedHandler<E extends TargetedEvent>={
	(this: E["currentTarget"], event: E): void
}

export type TargetedEvent<T extends EventTarget=EventTarget, E extends Event=Event>=Omit<E, "currentTarget"> & {
	readonly currentTarget: T;
};


/**
 * Creates a trapping event listener.
 *
 * @param handler the delegate event handler
 *
 * @returns a listener delegating to [[handler]] all events whose default action was not prevented by a previous handler;
 * the default action of delegated events is prevented and their propagation stopped
 */
export function trapping<E extends TargetedEvent>(handler: TargetedHandler<E>): TargetedHandler<E> {
	return function (this: E["currentTarget"], event: E) {
		if ( !event.defaultPrevented ) {

			event.preventDefault();
			event.stopPropagation();

			handler.call(this, event);

		}
	};
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
export function trailing<E extends TargetedEvent>(period: number, handler: TargetedHandler<E>): TargetedHandler<E> {

	if ( period < 0 ) {
		throw new RangeError(`negative period {${period}}`);
	}

	if ( period === 0 ) { return handler; } else {

		let last: number;

		return function (this: any, e: E) {

			const memo: any={};

			for (let p in e) { memo[p]=(<any>e)[p]; } // memoize event with non-enumerable properties

			last=e.timeStamp;

			setTimeout((function (this: E["currentTarget"], event: E) {

				if ( last === memo.timeStamp ) { handler.call(this, event); }

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
export function throttling<E extends TargetedEvent>(period: number, handler: TargetedHandler<E>): TargetedHandler<E> {

	if ( period < 0 ) {
		throw new RangeError(`negative period {${period}}`);
	}

	if ( period === 0 ) { return (handler); } else {

		let last: number;


		return function (this: E["currentTarget"], event: E) {

			if ( !last || last+period <= event.timeStamp ) {

				handler.call(this, event);

				last=event.timeStamp;

			}

		};

	}
}
