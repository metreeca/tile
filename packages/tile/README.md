# @metreeca/tile

[![npm](https://img.shields.io/npm/v/@metreeca/tile)](https://www.npmjs.com/package/@metreeca/tile)

Design system for [@metreeca/tile](https://github.com/metreeca/tile) interfaces.

An app includes the stylesheet and gets a coherent look across every Tile component: a token layer defining colour,
type, spacing and focus affordances, and base rules applying them to plain document markup. Redefining a token in a
later rule restyles everything that reads it, with no component change.

The dependency runs one way and stays optional: components carry only the structural styling they need to work, so an
app that leaves this package out still gets a usable, plainly structured interface. What both sides honour is the token
naming contract, published here as typed constants.

# Installation

```shell
npm install @metreeca/tile
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

# Usage

Include the stylesheet once, at the entry point of the app:

```typescript
import "@metreeca/tile/index.css";
```

Override any token in a later rule to restyle the interface:

```css
:root {
    --tile--color-accent-lite: #06C;
    --tile--font-family: Inter, sans-serif;
}
```

Restyle a single subtree instead by assigning the tokens inline, naming them through the published contract rather than
as literal strings:

```tsx
import { css, tile } from "@metreeca/tile";

<section style={css({ [tile.colorAccentLite]: "#06C" })}>
```

| Module                 | Description   |
|------------------------|---------------|
| [@metreeca/tile][tile] | Design system |

[tile]: https://metreeca.github.io/tile/modules/_metreeca_tile.index.html

# Support

- open an [issue](https://github.com/metreeca/tile/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/metreeca/tile/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/metreeca/tile?tab=Apache-2.0-1-ov-file) file for details.
