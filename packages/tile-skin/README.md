# @metreeca/tile-skin

[![npm](https://img.shields.io/npm/v/@metreeca/tile-skin)](https://www.npmjs.com/package/@metreeca/tile-skin)

Design system for [@metreeca/tile](https://github.com/metreeca/tile) interfaces.

An app includes the stylesheet and gets a coherent look across every Tile component: a token layer defining colour,
type, spacing, sizing and focus affordances, and base rules applying them to plain document markup. Redefining a token
in a later rule restyles everything that reads it, with no component change.

The palette stands on five colour anchors, every other colour deriving from them, so retuning the anchors carries the
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
> [API reference](https://metreeca.github.io/tile/modules/_metreeca_tile-skin.html).

Include the stylesheet once, at the entry point of the app, ahead of the app styles overriding it:

```typescript
import "@metreeca/tile-skin/index.css";
```

An app assembling its own HTML links it in the document head instead: the stylesheet has to reach the document before
it is painted, or the first frame shows the unstyled markup.

Override any token to restyle the interface:

```css
:root {
    --tile--color-accent-strong: #D60;
    --tile--font-family: Inter, sans-serif;
}
```

The stylesheet declares its rules in a `tile` cascade layer, so an override written outside a layer wins however the
two stylesheets reach the document; an app whose own rules are layered orders its layer after `tile`.

Retheme by retuning the anchors alone, `--tile--color`, `--tile--background-color`, `--tile--color-accent-subtle`,
`--tile--color-accent-strong` and `--tile--color-invalid`: labels, borders, stripes, focus rings and hover states
derive from them and follow. The accents ship brand-agnostic, so an app supplies its own, a quieter value and a louder
one per colour scheme, and rechecks that the text roles still hold AA contrast against the page and the striped row in
both. An override the browser cannot parse leaves the interface on the default rather than unstyled, and an app pinning
a colour scheme sets `color-scheme` on the root element as usual.

Measures are stated in `em`, so a subtree given a size of its own takes its rhythm along. The two ladders answer
different questions: `--tile--spacing-*` sets a thing apart from what surrounds it, while `--tile--scaling-*` sizes what
is measured against the text rather than spaced from it, a glyph, a spinner, a swatch or a dot, with
`--tile--scaling-100` matching the text it sits in.

Radii come both ways: `--tile--border-radius` is a length, rounding a field, a panel or a button by the same amount
whatever size it is given, while `--tile--border-radius-*` carries a share of the box, so a mark rounds with its own
size and every share above a half draws the same roundel. `--tile--stroke-width` carries a bare number, in the user
units of the vector viewport it applies to, so the weight of a glyph holds at any size.

A component styled against a token it cannot count on, because the stylesheet may not be loaded at all, names its own
fallback in the reference:

```css
color: var(--tile--color-accent-strong, #06C);
```

Restyle a single subtree instead by assigning the tokens inline, naming them through the published contract rather than
as literal strings, so a renamed token breaks the build instead of silently losing its styling:

```tsx
import { css } from "@metreeca/tile-skin";

<section style={css({ colorAccentStrong: "#D60" })}>
```

Where CSS doesn't reach, on a canvas, in an SVG attribute or on a print target, take the value a token resolves to for
the element it applies to, rather than a copy of the default, and keep whatever the app overrode along with the colour
scheme in force:

```typescript
import { tile } from "@metreeca/tile-skin";

getComputedStyle(element).getPropertyValue(tile.colorAccentStrong);
```

# Support

- open an [issue](https://github.com/metreeca/tile/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/metreeca/tile/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/metreeca/tile?tab=Apache-2.0-1-ov-file) file for details.
