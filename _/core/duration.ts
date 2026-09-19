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

import { error, immutable, inconvertible, isObject, Type } from "../Core/src/index.js";
import { toIntegerString } from "@metreeca/core/integer";
import { isString } from "@metreeca/core/string";
import { toTextString } from "@metreeca/core/text";


export interface Duration {

	minus?: boolean;

	// ;( no years/months for compatibility with Java Duration class on the backend

	days?: number;

	hours?: number;
	minutes?: number;
	seconds?: number;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * https://www.w3.org/TR/xmlschema-2/#duration
 */
export const duration: Type<string, Duration>=immutable({

	label: "duration",
	model: "PT0S",


	encode({

		minus,

		days,

		hours,
		minutes,
		seconds

	}): string {

		return `${
			minus ? "-" : ""
		}P${
			days ? `${days}D` : ""
		}${
			hours || minutes || seconds ? "T" : ""
		}${
			hours ? `${hours}H` : ""
		}${
			minutes ? `${minutes}M` : ""
		}${
			seconds ? `${seconds}S` : ""
		}`;

	},

	decode(value): Duration {
		if ( isString(value) ) {

			const groups=value.match(Duration)?.groups;

			if ( groups ) {

				return {

					minus: !!groups.minus,

					days: parse(groups.days),

					hours: parse(groups.hours),
					minutes: parse(groups.minutes),
					seconds: parse(groups.seconds)

				};

			} else {

				return error(new TypeError(`malformed <${duration.label}> value <${value}}>`));

			}


		} else {

			return error(new TypeError(`<${typeof value}> value <${JSON.stringify(value, null, 2)}> is not a <${duration.label}>`));

		}


		function parse(s: undefined | string): undefined | number {
			return !s ? undefined : (parseFloat(s)) ?? undefined;
		}

	},


	write(value) {
		throw new Error(";( to be implemented"); // !!!
	},

	parse(value) {
		throw new Error(";( to be implemented"); // !!!
	},


	format(value, locales) {
		return toDurationString(value, { locales });
	},


	cast(type: Type): typeof duration {
		return inconvertible(duration, type);
	}

});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function isDuration(value: unknown): value is Duration {
	return isObject(value) && Object.keys(value).every(key => Keys.has(key));
}

export function asDuration(value: unknown): undefined | Duration {
	return isDuration(value) ? value : undefined;
}


export function toDurationString(value: string | Duration, {

	locales

}: {

	locales?: Intl.LocalesArgument

}={

	locales: navigator.languages

}): string {

	const opts={ locales };

	const {

		minus,

		days,

		hours,
		minutes,
		seconds

	}=isString(value) ? duration.decode(value) : value;
	
	return [

		minus ? toTextString(Labels.minus, opts) : undefined,

		days && `${toIntegerString(days, opts)} ${toTextString(days > 1 ? Labels.days : Labels.day, opts)}`,

		hours && `${toIntegerString(hours, opts)} ${toTextString(hours > 1 ? Labels.hours : Labels.hour, opts)}`,
		minutes && `${toIntegerString(minutes, opts)} ${toTextString(minutes > 1 ? Labels.minutes : Labels.minute, opts)}`,
		seconds && `${toIntegerString(seconds, opts)} ${toTextString(seconds > 1 ? Labels.seconds : Labels.second, opts)}`

	].filter(v => v).join(" ");

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const Minus=`(?<minus>-)?`;

const Days=`(?:(?<days>\\d+)D)?`;

const Hours=`(?:(?<hours>\\d+)H)?`;
const Minutes=`(?:(?<minutes>\\d+)M)?`;
const Seconds=`(?:(?<seconds>\\d+(?:\\.\\d+))S)?`;

const Duration=RegExp(`^${Minus}P${Days}(?:T${Hours}${Minutes}${Seconds})?$`);


const Keys: Set<string>=new Set(Object.keys(<Duration>{

	minus: false,

	days: 0,

	hours: 0,
	minutes: 0,
	seconds: 0.0

}));

const Labels=immutable({

	minus: {
		en: "minus",
		it: "meno"
	},

	day: {
		en: "day",
		it: "giorno"
	},

	days: {
		en: "days",
		it: "giorni"
	},


	hour: {
		en: "hour",
		it: "ora"
	},

	hours: {
		en: "hours",
		it: "ore"
	},

	minute: {
		en: "minute",
		it: "minuto"
	},

	minutes: {
		en: "minutes",
		it: "minuti"
	},

	second: {
		en: "second",
		it: "secondo"
	},

	seconds: {
		en: "seconds",
		it: "secondi"
	}

});
