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

import { useFetcher } from "@metreeca/data/contexts/fetcher";
import { useTrace } from "@metreeca/data/contexts/trace";
import { useError } from "@metreeca/data/hooks/error";
import { classes } from "@metreeca/view";
import { CloseIcon } from "@metreeca/view/widgets/icon";
import { TileSpin } from "@metreeca/view/widgets/spin";
import React, { createElement, ReactNode, useEffect, useState } from "react";
import "./page.css";
import { ErrorBoundary } from "react-error-boundary";


export function TilePage({

	locked=false,

	logo,
	meta,

	done,
	back,

	name,
	menu,
	more,

	tray,

	info,
	copy,

	children: main

}: {

	locked?: boolean

	logo?: ReactNode
	meta?: ReactNode

	done?: ReactNode
	back?: ReactNode

	name?: ReactNode
	menu?: ReactNode
	more?: ReactNode

	tray?: ReactNode

	info?: ReactNode
	copy?: ReactNode

	children: ReactNode

}) {

	const fetcher=useFetcher();
	const [trace]=useTrace();

	const [active, setActive]=useState(false);
	const [expanded, setExpanded]=useState<boolean>();
	// !!! const [error, setError]=useState<any>();


	useEffect(() => {

		return fetcher.observe(setActive);

	}, [fetcher]);

	useEffect(() => {

		function resize() { setExpanded(undefined); }

		window.addEventListener("resize", resize);

		return () => window.removeEventListener("resize", resize);

	});

	useEffect(() => {

		trace && report(trace);

	}, [trace]);


	useError(
		error => report(error),
		error => report(error)
	);


	function report(error: any) {
		console.log(error);
	}


	return createElement("tile-page", {

		class: classes({

			locked,
			active

		})

		// onClick: e => {
		//
		//     if ( tray ) { setTray(!(e.target === e.currentTarget || (e.target as Element).closest("a"))); }
		//
		// },

		// onKeyDown: (e) => {
		//     if ( e && e.key === "Enter" ) {
		//         e.cancelable=true;
		//         if ( e.stopPropagation ) {
		//             e.stopPropagation();
		//             e.preventDefault();
		//         }
		//     }
		// }

	}, <>

		<ErrorBoundary // https://github.com/bvaughn/react-error-boundary

			fallbackRender={function ({ error, resetErrorBoundary }: {
				error: any,
				resetErrorBoundary: () => void
			}) {

				return <>

					<aside/>

					<main>
						<header>
							<span>;( Internal Error</span>
							<button><CloseIcon onClick={resetErrorBoundary}/></button>
						</header>
						<section style={{ whiteSpace: "nowrap" }}>{JSON.stringify(error, null, 2)}</section>
					</main>

				</>;

			}}

			onError={error => report(error)}

		>

			<aside>

				<header className={"scroll-b"}>
					{logo && <span>{logo}</span>}
					{meta && <span>{meta}</span>}
				</header>

				<section>{tray}</section>
				<footer className={"scroll-t"}>{info}</footer>

			</aside>

			<main>

				<header className={"scroll-b"}>
					{done ? <span>{done}</span> : name ? <span>{name}</span> : undefined}
					{active ? <TileSpin/> : back ? <span>{back}</span> : menu ? <span>{menu}</span> : undefined}
				</header>

				<section>{main}</section>
				<footer>{copy}</footer>

			</main>

		</ErrorBoundary>

	</>);
}
