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

import { app } from "@metreeca/clay";
import { Button } from "@metreeca/clay-cell/button";
import { Link } from "@metreeca/clay-cell/link";
import { Logo } from "@metreeca/clay-cell/logo";
import { useFetch } from "@metreeca/clay/fetch";
import { Shell } from "@metreeca/clay-hive/shell";
import { Style } from "@metreeca/clay-hive/style";
import { TileLensPath } from "@metreeca/specimen/tile-lens/index.js";
import {
	ChevronsLeftRightIcon,
	ChevronsRightLeftIcon,
	LockIcon,
	LogInIcon,
	LogOutIcon,
	PanelLeftCloseIcon,
	PanelLeftOpenIcon,
	SearchIcon,
	UnlockIcon
} from "lucide-preact";
import type { ComponentChildren } from "preact";
import { useState } from "preact/hooks";


export const Root = "/";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function Page({

	tray,

	children

}: {

	tray?: ComponentChildren

	children?: ComponentChildren


}) {

	const fetch = useFetch();

	const [lock, setLock] = useState(false);
	const [main, setMain] = useState(false);
	const [wide, setWide] = useState(false);

	const [user, setUser] = useState<string>();

	function edit() {

		setLock(true);

		setTimeout(() => setLock(false), 1000);

	}


	return <Shell

		lock={lock}
		main={main}
		wide={wide}

		logo={<Style css={{ fontSize: "fontSizeLarge" }}>

			<Link look="strong" href={Root}><Logo/><span>{app.name}</span></Link>

		</Style>}

		meta={<>

			<Button
				icon={lock ? <UnlockIcon/> : <LockIcon/>}
				look="subtle"
				title={lock ? "Release the tray" : "Lock the tray"}
				onClick={edit}
			/>

		</>}

		head={<>

			<Button
				icon={main ? <PanelLeftOpenIcon/> : <PanelLeftCloseIcon/>}
				look="subtle"
				title={main ? "Show the tray" : "Hide the tray"}
				onClick={() => setMain(!main)}
			/>

			<Button
				icon={wide ? <ChevronsRightLeftIcon/> : <ChevronsLeftRightIcon/>}
				look="subtle"
				title={wide ? "Cap the measure" : "Take the width"}
				onClick={() => setWide(!wide)}
			/>

			<Link active look="strong" href={`${TileLensPath}*`}>Linked Data Views</Link>

		</>}

		menu={<>

			<small>v{VERSION}</small>

			<Button
				icon={<SearchIcon/>}
				look="subtle"
				name="Run an exchange"
				title="Run an exchange"
				onClick={() => { void fetch(app.base); }}
			/>

		</>}

		tray={tray}

		info={user

			? <>

				<small>{user}</small>

				<Button
					icon={<LogOutIcon/>}
					look="subtle"
					name="Sign out"
					title="Sign out"
					onClick={() => setUser(undefined)}
				/>

			</>

			: <Button
				icon={<LogInIcon/>}
				look="subtle"
				name="Sign in"
				title="Sign in"
				onClick={() => setUser("user@example.com")}
			/>

		}

		foot={<small>{app.copy}</small>}

	>

		{children}

	</Shell>;

}
