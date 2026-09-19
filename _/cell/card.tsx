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

import { isDefined } from "../Core/src/index.js";
import { isNumber } from "@metreeca/core/number";
import { isString } from "@metreeca/core/string";
import { classes } from "@metreeca/view";
import * as React from "react";
import { createElement, ReactNode, useState } from "react";
import "./card.css";


/**
 * Resource summary card.
 *
 * @param wrap
 * @param size
 * @param title
 * @param tags
 * @param image
 * @param children
 * @constructor
 */
export function TileCard({

	wrap,
	size,
	side="start",

	tags,
	title,
	image,

	children

}: {

	wrap?: boolean

	size?: number | string
	side?: "start" | "end"

	tags?: ReactNode
	title?: ReactNode
	image?: ReactNode

	children?: ReactNode

}) {

	const [loaded, setLoaded]=useState(false);

	return createElement("tile-card", {

		class: classes({ start: side === "start", end: side === "end" }),

		style: {

			"--tile-card-size-width":

				isNumber(size) ? `${size}em`
					: isDefined(size) ? size
						: side === "start" ? "10rem"
							: "15rem"

		}

	}, <>

		{title && <span>{title}</span>}
		{tags && <nav style={{ color: "var(--tile--color-label)" }}>{tags}</nav>}

		<div className={classes({ wrap })}>{children}</div>

		{image && <i>{isString(image) ? <img hidden={!loaded} src={image}

			onLoad={() => setLoaded(true)}

		/> : image}</i>}

	</>);

}
