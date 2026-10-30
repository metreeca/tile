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

/**
 * Markdown document.
 *
 * Offers a Markdown text as the document it describes, its outline as links into that document, or the values its
 * front matter declares, so a page built from Markdown sources needs no rendering pipeline of its own.
 *
 * @module
 */

import type { Element, Root as Tree } from "hast";
import { headingRank } from "hast-util-heading-rank";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import type { Root } from "mdast";
import { type ComponentChildren, createElement } from "preact";
import { useEffect, useMemo } from "preact/hooks";
import { Fragment, jsx, jsxs } from "preact/jsx-runtime";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGemoji from "remark-gemoji";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "remark-github-blockquote-alert";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import "./mark.css";


/*
 * !!! bundle size: the module adds ~390 kB minified (~125 kB gzipped) to a consumer bundle, mostly highlight.js
 * grammars, since rehype-highlight statically imports the 37 lowlight `common` ones as its default `languages`, so
 * they ship even when unused. Lazy-loading them takes a lowlight-based highlighter of our own over `createLowlight()`,
 * importing grammars on demand for the languages a text names and highlighting again once they are registered.
 */


/**
 * The protocols a link or a source may name; anything else could run script or load content from outside the page.
 */
const SafeProtocol = /^(https?|ircs?|mailto|xmpp)$/i;


const front = unified()
	.use(remarkParse)
	.use(remarkFrontmatter);

const pipeline = unified()
	.use(remarkParse)
	.use(remarkFrontmatter)
	.use(remarkGfm)
	.use(remarkAlert)
	.use(remarkGemoji)
	.use(remarkCode)
	.use(remarkRehype)
	.use(rehypeSlug)
	.use(rehypeHighlight)
	.use(rehypeLinks);



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Front matter values.
 *
 * Maps each key a Markdown text declares in its YAML front matter to the value it is given, read as a plain string.
 */
export interface Meta {

	readonly [key: string]: string;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a Markdown document.
 *
 * Renders a Markdown text in one of three ways, as `meta` selects:
 *
 * - **document**, the default: the text in full, with GitHub Flavored Markdown tables, task lists and footnotes,
 *   GitHub alerts (`> [!NOTE]`), emoji shortcodes, fenced code highlighted by language and stripped of surrounding
 *   blank lines, and headings carrying the ids GitHub would give them, so links into the document resolve
 * - **table of contents**: the headings alone, each a link to the matching heading of the document
 * - **front matter**: the values the YAML front matter declares, the text itself left unrendered
 *
 * Links to Markdown files are rewritten to the route serving them, `guide.md` to `guide` and `index.md` to the folder
 * holding it, fragments preserved, so a set of documents linking each other by file name reads as a set of pages.
 * Links and sources whose protocol is unsafe are dropped, and raw HTML in the text is never rendered.
 *
 * A document scrolls the heading named by the location fragment into view as it renders and whenever the fragment
 * changes, so a link into the document lands on its target once the text is in place.
 *
 * @param options The widget configuration
 *
 * @returns The rendered document, outline or front matter value
 */
export function Mark({

	meta,

	children

}: {

	/**
	 * What is rendered of the text: `"toc"` for the table of contents, the key of a front matter value for that value
	 * alone, nothing if the text does not declare it, or a function turning the front matter values into content; the
	 * document in full if omitted, the only mode following the location fragment to the heading it names.
	 */
	meta?: "toc" | string | ((meta: Meta) => ComponentChildren)


	/**
	 * The Markdown text, front matter included.
	 */
	children: string

}): ComponentChildren {

	/*
	 * The heading a link points to exists only once the text is rendered, so landing on it waits for the render,
	 * and a fragment changing later never reloads the page, so it is followed on the window.
	 */

	useEffect(() => {

		if ( meta === undefined ) { scroll(); }

	}, [meta, children]);

	useEffect(() => {

		if ( meta === undefined ) {

			window.addEventListener("hashchange", scroll);

			return () => window.removeEventListener("hashchange", scroll);

		} else {

			return undefined;

		}

	}, [meta]);


	return useMemo(() => meta === undefined ? createElement("tile-mark", {}, render(transform(children)))
		: meta === "toc" ? createElement("tile-mark", {}, render(outline(transform(children))))
			: typeof meta === "function" ? meta(entries(children))
				: entries(children)[meta]
	, [meta, children]);

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function scroll(): void {
	document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
}


function entries(text: string): Meta {

	const yaml = front.parse(text).children.find(node => node.type === "yaml");

	return Object.fromEntries(Array.from(
		yaml?.value.matchAll(/^\s*(\w+)\s*:\s*(.*?)\s*$/gm) ?? [],
		([, key, value]) => [key, value]
	));

}

function transform(text: string): Tree {
	return pipeline.runSync(pipeline.parse(text));
}

/**
 * Reduces a document to its headings, each holding a link to the heading it stands for.
 *
 * The ids are left to the document, so an outline shown beside it adds no duplicate ids to the page.
 */
function outline(tree: Tree): Tree {
	return {

		...tree, children: tree.children
			.filter((node): node is Element => headingRank(node) !== undefined)
			.map(heading => ({
				...heading, properties: {}, children: [{
					type: "element",
					tagName: "a",
					properties: { href: `#${heading.properties.id}` },
					children: heading.children
				}]
			}))

	};
}

function render(tree: Tree): ComponentChildren {
	return toJsxRuntime(tree, { Fragment, jsx, jsxs, elementAttributeNameCase: "html", stylePropertyNameCase: "css" });
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Strips fenced code of surrounding blank lines and halves its indentation, so code pasted from a source file
 * reads at the width of the document rather than at the width of the editor it was copied from.
 */
function remarkCode() {
	return (tree: Root) => visit(tree, "code", node => {

		// ;(mutation) unified transformers edit the tree they are handed in place

		node.value = node.value
			.replace(/^\s+|\s+$/g, "")
			.replace(/^[ \t]+/mg, indent => indent.replace(/ {4}|\t/g, "  "));

	});
}

/**
 * Drops links and sources naming an unsafe protocol, and rewrites those naming a Markdown file to the route serving
 * it, `guide.md` to `guide` and `index.md` to its folder, fragments preserved, so linked documents read as pages.
 */
function rehypeLinks() {
	return (tree: Tree) => visit(tree, "element", node => {

		// ;(mutation) unified transformers edit the tree they are handed in place

		node.properties = Object.fromEntries(Object.entries(node.properties).map(([name, value]) =>
			[name, (name === "href" || name === "src") && typeof value === "string" ? route(value) : value]
		));

	});
}

function route(url: string): string {

	const protocol = /^([^:/?#]*):/.exec(url)?.[1];

	return protocol === undefined || SafeProtocol.test(protocol)
		? url.replace(/(?<=^|\/)([-\w]+)\.md(?=#|$)/, (_match, name: string) => name === "index" ? "" : name)
		: "";

}
