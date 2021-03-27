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

import "./spinner.less";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface Props {

	size?: string
	color?: string
	period?: string,
	thickness?: string

}

export function ToolSpinner({

	size="1em",
	color="#DDD",
	period="1s",
	thickness="0.2em"

}: Props) {

	return (// @ts-ignore
		<tool-spinner style={{

			"--tool-spinner-size": size,
			"--tool-spinner-color": color,
			"--tool-spinner-period": period,
			"--tool-spinner-thickness": thickness

		}}/>
	);

}
