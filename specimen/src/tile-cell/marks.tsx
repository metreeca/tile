/**
 * Markdown samples.
 *
 * @module
 */

import { Mark } from "@metreeca/tile-cell/mark";
import "./index.css";


const text = `---
title: Release Notes
author: Metreeca
---

# Release Notes

Tokens carry the values behind every colour, measure and duration :tada:, and widgets read them rather than stating
values of their own. See the [guide](guide.md) or the [index](docs/index.md#tokens).

## Tokens

| Token                  | Role                |
|------------------------|---------------------|
| \`--tile--color-info\`   | informative status  |
| \`--tile--color-fail\`   | failure status      |

- [x] colours
- [ ] motions

> [!NOTE]
> An app overrides a token to restyle everything that reads it.

> [!TIP]
> A colour scheme is pinned on the root element or on any subtree.

> [!IMPORTANT]
> A breakpoint is answered by a flag rather than asked as a width.

> [!WARNING]
> A fallback restates an anchor and hides a missing import.

> [!CAUTION]
> Reassigning a token read by a derived one resolves both to nothing.

## Code

\`\`\`ts

	// a widget reads its model straight off the hook

	const { labels, active, select } = useModel(() => createTabs({ labels: ["a", "b"] }));

	export function count(items: readonly string[]): number {
		return items.filter(item => item.length > 0).length; /* non-empty */
	}

\`\`\`

## Tokens

A second heading with the same text gets a distinct id.
`;


/**
 * Creates the marks section.
 *
 * Shows a Markdown text rendered as a document, as its table of contents, and through its front matter values.
 *
 * @returns The marks section
 */
export function Marks() {
	return <>

		<p>A mark renders a Markdown text as a document, as the outline linking into it, or through the values its
			front matter declares: here <strong><Mark meta="title">{text}</Mark></strong> by <Mark
				meta={({ author }) => <em>{author}</em>}>{text}</Mark>.</p>

		<Mark meta="toc">{text}</Mark>

		<hr/>

		<Mark>{text}</Mark>

	</>;
}
