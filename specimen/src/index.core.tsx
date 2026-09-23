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

import { Button } from "@metreeca/tile-cell/button.js";
import { Icon } from "@metreeca/tile-cell/icon";
import { Link } from "@metreeca/tile-cell/link.js";
import { Logo } from "@metreeca/tile-cell/logo.js";
import { app } from "@metreeca/tile-data";
import { useFetch } from "@metreeca/tile-data/fetch.js";
import { Shell } from "@metreeca/tile-hive/shell.js";
import { Style } from "@metreeca/tile-hive/style.js";
import type { ComponentChildren } from "preact";
import { useState } from "preact/hooks";


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

		logo={<Style css={{ fontSize: "fontSizeLarge" }}><Logo>{app.name}</Logo></Style>}

		meta={<>

			<Button
				icon={lock ? <Icon.Unlock/> : <Icon.Lock/>}
				look="subtle"
				title={lock ? "Release the tray" : "Lock the tray"}
				onClick={edit}
			/>

		</>}

		head={<>

			<Button
				icon={main ? <Icon.PanelLeftOpen/> : <Icon.PanelLeftClose/>}
				look="subtle"
				title={main ? "Show the tray" : "Hide the tray"}
				onClick={() => setMain(!main)}
			/>

			<Button
				icon={wide ? <Icon.ChevronsRightLeft/> : <Icon.ChevronsLeftRight/>}
				look="subtle"
				title={wide ? "Cap the measure" : "Take the width"}
				onClick={() => setWide(!wide)}
			/>

			<Link active look="strong" href="/tile">Design System</Link>
			<Link active look="strong" href="/tile-cell">Widgets and Controls</Link>

		</>}

		menu={<>

			<small>v{VERSION}</small>

			<Button
				icon={<Icon.Search/>}
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
					icon={<Icon.LogOut/>}
					look="subtle"
					name="Sign out"
					title="Sign out"
					onClick={() => setUser(undefined)}
				/>

			</>

			: <Button
				icon={<Icon.LogIn/>}
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
