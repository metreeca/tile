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


export interface Period {

	minus?: boolean;

	years?: number;
	months?: number;
	days?: number;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * https://www.w3.org/TR/xmlschema-2/#duration
 */
export const period: Type<string, Period>=immutable({

	label: "period",
	model: "P0D",


	encode({

		minus,

		years,
		months,
		days

	}): string {

		return `${
			minus ? "-" : ""
		}P${
			years ? `${years}Y` : ""
		}${
			months ? `${months}M` : ""
		}${
			days ? `${days}D` : ""
		}`;

	},

	decode(value): Period {
		if ( isString(value) ) {

			const groups=value.match(Period)?.groups;

			if ( groups ) {

				return {

					minus: !!groups.minus,

					years: parse(groups.years),
					months: parse(groups.months),
					days: parse(groups.days)

				};

			} else {

				return error(new TypeError(`malformed <${period.label}> value <${value}}>`));

			}


		} else {

			return error(new TypeError(`<${typeof value}> value <${JSON.stringify(value, null, 2)}> is not a <${period.label}>`));

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
		return toPeriodString(value, { locales });
	},


	cast(type: Type): typeof period {
		return inconvertible(period, type);
	}

});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function isPeriod(value: unknown): value is Period {
	return isObject(value) && Object.keys(value).every(key => Keys.has(key));
}

export function asPeriod(value: unknown): undefined | Period {
	return isPeriod(value) ? value : undefined;
}


export function toPeriodString(value: string | Period, {

	locales

}: {

	locales?: Intl.LocalesArgument

}={

	locales: navigator.languages

}): string {

	const opts={ locales };

	const {

		minus,

		years,
		months,
		days

	}=isString(value) ? period.decode(value) : value;

	return [

		minus ? toTextString(Labels.minus, opts) : undefined,

		years && `${toIntegerString(years, opts)} ${toTextString(years > 1 ? Labels.years : Labels.year, opts)}`,
		months && `${toIntegerString(months, opts)} ${toTextString(months > 1 ? Labels.months : Labels.month, opts)}`,
		days && `${toIntegerString(days, opts)} ${toTextString(days > 1 ? Labels.days : Labels.day, opts)}`

	].filter(v => v).join(" ");

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const Minus=`(?<minus>-)?`;

const Years=`(?:(?<years>\\d+)Y)?`;
const Months=`(?:(?<months>\\d+)M)?`;
const Days=`(?:(?<days>\\d+)D)?`;

const Period=RegExp(`^${Minus}P${Years}${Months}${Days}$`);


const Keys: Set<string>=new Set(Object.keys(<Period>{

	minus: false,

	years: 0,
	months: 0,
	days: 0

}));

const Labels=immutable({

	minus: {
		en: "minus",
		it: "meno"
	},


	year: {
		en: "year",
		it: "anno"
	},

	years: {
		en: "years",
		it: "anni"
	},

	month: {
		en: "month",
		it: "mese"
	},

	months: {
		en: "months",
		it: "mesi"
	},

	day: {
		en: "day",
		it: "giorno"
	},

	days: {
		en: "days",
		it: "giorni"
	}

});
