# @metreeca/tile-skin

[![npm](https://img.shields.io/npm/v/@metreeca/tile-skin)](https://www.npmjs.com/package/@metreeca/tile-skin)

Design system for [@metreeca/tile](https://github.com/metreeca/tile) interfaces.

An app includes the stylesheet and gets a coherent look across every Tile component: a token layer defining colour,
type, spacing and focus affordances, and base rules applying them to plain document markup. Redefining a token in a
later rule restyles everything that reads it, with no component change.

The palette stands on four colour anchors, every other colour deriving from them, so retuning the anchors carries the
whole interface along and the default look follows the platform colour scheme, light or dark, on its own.

The dependency runs one way and stays optional: components carry only the structural styling they need to work, so an
app that leaves this package out still gets a usable, plainly structured interface. What both sides honour is the token
naming contract, published here as typed constants.

# Installation

```shell
npm install @metreeca/tile-skin
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

# Usage

> [!NOTE]
>
> This section introduces essential concepts; for complete coverage, see the
> [API reference](https://metreeca.github.io/tile/modules/_metreeca_tile-skin.index.html).

Include the stylesheet once, at the entry point of the app, ahead of the app styles overriding it:

```typescript
import "@metreeca/tile-skin/index.css";
```

An app assembling its own HTML links it in the document head instead: the stylesheet has to reach the document before
it is painted, or the first frame shows the unstyled markup.

Override any token in a later rule to restyle the interface:

```css
:root {
    --tile--color-accent-lite: #06C;
    --tile--font-family: Inter, sans-serif;
}
```

Retheme by retuning the anchors alone, `--tile--color`, `--tile--background-color`, `--tile--color-accent-lite` and
`--tile--color-accent-dark`: labels, borders, stripes, focus rings and hover states derive from them and follow. An
override the browser cannot parse leaves the interface on the default rather than unstyled, and an app pinning a
colour scheme sets `color-scheme` on the root element as usual.

A component styled against a token it cannot count on, because the stylesheet may not be loaded at all, names its own
fallback in the reference:

```css
color: var(--tile--color-accent-lite, #D60);
```

Restyle a single subtree instead by assigning the tokens inline, naming them through the published contract rather than
as literal strings:

```tsx
import { css, tile } from "@metreeca/tile-skin";

<section style={css({ [tile.colorAccentLite]: "#06C" })}>
```

# Support

- open an [issue](https://github.com/metreeca/tile/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/metreeca/tile/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/metreeca/tile?tab=Apache-2.0-1-ov-file) file for details.
