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

import {defineConfig} from "vite";

import preact from "@preact/preset-vite";
import postcssNesting from "postcss-nesting";

export default defineConfig({ // https://vitejs.dev/config/

	root: "demo",

	plugins: [preact()],

	css: {
		postcss: {
			plugins: [postcssNesting()]
		}
	},

	build: {
		outDir: "../dist/demo",
		assetsDir: ".",
		emptyOutDir: true
	}

});