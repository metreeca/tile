# @metreeca/tile

[![npm](https://img.shields.io/npm/v/@metreeca/tile)](https://www.npmjs.com/package/@metreeca/tile)

Design system for [Metreeca Tile](https://github.com/metreeca/tile) interfaces.

An app includes the stylesheet and gets a coherent look across every Tile component: a token layer defining colour,
type, spacing, sizing and focus affordances, and base rules applying them to plain document markup. Redefining a token
in a later rule restyles everything that reads it, with no component change.

The palette stands on five colour anchors, every colour a role carries deriving from them, so retuning the anchors
carries the whole interface along and the default look follows the platform colour scheme, light or dark, on its own.
Beside the roles come the colours a chart, a coding or a map reads: ten-step scales, series slots and area classes,
each holding a separation a reader can rely on.

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

> [!NOTE]
>
> This section introduces essential concepts; for complete coverage, see the
> [API reference](https://metreeca.github.io/tile/modules/_metreeca_tile.html).

Include the stylesheet once, at the entry point of the app, ahead of the app styles overriding it:

```typescript
import "@metreeca/tile/index.css";
```

An app assembling its own HTML links it in the document head instead: the stylesheet has to reach the document before
it is painted, or the first frame shows the unstyled markup.

Override any token to restyle the interface:

```css
:root {
    --tile--color-strong: #D60;
    --tile--font-family: Inter, sans-serif;
}
```

The stylesheet declares its rules in a `tile` cascade layer, so an override written outside a layer wins however the
two stylesheets reach the document; an app whose own rules are layered orders its layer after `tile`.

Retheme by retuning the anchors alone, `--tile--color`, `--tile--background-color`, `--tile--color-subtle`,
`--tile--color-strong` and the four status colours `--tile--color-info`, `--tile--color-pass`,
`--tile--color-warn` and `--tile--color-fail`: labels, borders, stripes, focus rings, state fills, notice tints
and elevation surfaces derive from them and follow. The accents ship brand-agnostic, so an app supplies its own,
a quieter value and a louder one per colour scheme, and rechecks that the text roles still hold AA contrast against
the page and the striped row in both. The status four take values of their own rather than derivations of an accent,
so an outcome keeps reading as itself whatever an app brands with. An override the browser cannot parse leaves the
interface on the default rather than unstyled.

An interface follows the platform colour scheme on its own. An app that has to pin one sets `data-theme` to `light` or
`dark`, on the root element or on any subtree that has to differ from the page around it, which a
`prefers-color-scheme` query cannot express; the stylesheet states `color-scheme` alongside, so native controls and
scrollbars follow a pinned subtree too.

## Modes

A widget says what it is for through at most two attributes, and they never compete for the same channel.

**`look` — how loud it appears.** Structural, carried by layout, weight and border rather than by colour: `subtle`
recedes, `normal` is ordinary, `strong` is larger, earlier, heavier and bounded, and would read as strong in a
single-colour interface. The pair is the one the colour anchors already use, so a single vocabulary names this axis
throughout. A widget offers the steps that say something about it and names them in its own documentation, so a tab
strip with no form louder than its rule takes `subtle` and `normal` alone, and an area written in a step it does not
offer lands on the nearest one it does.

A widget stating no `look` takes the one the area around it is written in, from `--tile--look`, which is `normal`
where nothing assigns it. An app quietens a whole toolbar, panel or screen by assigning the token there, and the one
control in it that asks to be loud still is, since a stated attribute answers to itself alone.

```tsx
<div style={css({ look: "subtle" })}>
```

**What it means** is colour-coded, and every meaning lands on one four-step scale:

| Step   | Says                   | Token                |
|--------|------------------------|----------------------|
| `info` | stated or provisional  | `--tile--color-info` |
| `pass` | completed as intended  | `--tile--color-pass` |
| `warn` | completed with caveats | `--tile--color-warn` |
| `fail` | failed to complete     | `--tile--color-fail` |

The shape is one unjudged step plus a three-step verdict ramp: `info` is not a milder `pass`, it is the absence of a
verdict. Four steps is the ceiling, because colour carries no more, so a meaning the scale does not carry is stated in
words rather than in a fifth colour.

Three kinds of meaning share the scale, and which one a widget carries follows from what the widget is, so no widget
carries two:

- **`level`**, on content: how much attention a passage deserves, set by the author ahead of time
- **`mode`**, on controls: what activating will do, a consequence not yet incurred
- **`status`**, on reported things: what the system says happened, at runtime

`normal` is **the default of all three, and it is not a step**: it carries no colour coding at all and leaves the
ordinary page colours, so a widget that states nothing is `normal` and a `level="normal"` passage is not a blue `info`
admonition. Only the marked values reach the scale. The widget maps those onto the steps and states that mapping in
its own documentation.

| Attribute | `normal`            | `info`    | `pass`      | `warn`    | `fail`     |
|-----------|---------------------|-----------|-------------|-----------|------------|
| `level`   | an ordinary passage | `info`    | `highlight` | `warning` | `critical` |
| `mode`    | an ordinary control | `safe`    | `commit`    | `alert`   | `danger`   |
| `status`  | nothing to report   | `pending` | `success`   | `warning` | `failure`  |

The two attributes together read as how it appears and what it means:

```tsx
<Button look="subtle" mode="danger"/>
<Note   look="strong" level="warning"/>
```

> [!IMPORTANT]
>
> A step is never told by colour alone: an icon and the wording carry the same meaning, since the two ends of the
> ramp are the pair colour vision deficiency collapses most readily. `--tile--color-warn` is a fill rather than a
> stroke, so a caution paints a badge and sets its message in the page colour over it.

A thing lifted off the page takes a surface and the shadow that goes with it together, `--tile--background-color-raised`
with `--tile--box-shadow-raised` for a card that stays in the flow and `--tile--background-color-overlay` with
`--tile--box-shadow-overlay` for a menu or a dialog that leaves it. `--tile--z-index-*` settles which of two overlapping
things wins, and `--tile--background-color-blanket` dims what a modal covers.

Motion is stated the same way: `--tile--duration-*` says what kind of change a transition carries and
`--tile--easing-*` how it accelerates, and every duration collapses to zero for a reader who asked for less motion, so
a transition written through the tokens honours the preference with no rule of its own.

Where a colour stands for a position rather than for a role, take it from a ten-step scale: `--tile--color-gray-*` for
a neutral, `--tile--color-subtle-*` and `--tile--color-strong-*` for a branded one, `--tile--color-heat-*` for a
magnitude. The number is the share of the anchor the step carries, `010` the faintest and `100` the anchor itself, so
the three derived scales follow a retheme. The heat scale keeps literals of its own and codes by hue, so a step means a
band a legend names rather than a position on a gradient, and a consumer states the band in text beside the colour.

Where a colour stands for one thing among others, take it from a slot or a class. `--tile--color-series-1` to
`--tile--color-series-9` paint a bar, a line or a wedge: taken in sequence and held to the thing each one paints, so a
filter dropping a series leaves the survivors their colours. `--tile--color-area-1` to `--tile--color-area-4` fill a
shape instead, a region on a choropleth or a cell on a grid, and four is the limit: a fifth class is a second map. Both
families keep one value per slot across colour schemes, and neither follows a rebrand. Nine series hold where only
neighbours are compared; where every pair is compared, on a scatter, a bubble chart or a map, the first three hold.
Some of both stay under 3:1 against the light page, so a chart carrying them states its figures in text as well and a
map keeps its boundaries drawn and names its classes in the legend.

Measures are stated in `em`, so a subtree given a size of its own takes its rhythm along. The two ladders answer
different questions: `--tile--spacing-*` sets a thing apart from what surrounds it, while `--tile--scaling-*` sizes what
is measured against the text rather than spaced from it, a glyph, a spinner, a swatch or a dot, with
`--tile--scaling-100` matching the text it sits in.

Radii come both ways: `--tile--border-radius` is a length, rounding a field, a panel or a button by the same amount
whatever size it is given, while `--tile--border-radius-*` carries a share of the box, so a mark rounds with its own
size and every share above a half draws the same roundel. `--tile--stroke-width` carries a bare number, in the user
units of the vector viewport it applies to, so the weight of a glyph holds at any size.

A breakpoint is not a width token, because CSS accepts no custom property in a media feature and
`@media (min-width: var(--x))` never matches. The design system runs the four queries once and hands the answers on as
`--tile--viewport-*` tokens, `off` by default and `on` from each width upwards, which a rule branches on through a
style query.

| Token                     | From    | What it answers                                              |
|---------------------------|---------|--------------------------------------------------------------|
| `--tile--viewport-small`  | `30rem` | a phone held upright, the one-column floor                   |
| `--tile--viewport-medium` | `48rem` | a tablet or a split window, where a second column fits       |
| `--tile--viewport-large`  | `64rem` | a laptop, where navigation becomes a rail                    |
| `--tile--viewport-xlarge` | `90rem` | a desktop, where the measure is capped rather than stretched |

Every width is a floor, so the narrow layout is what a rule states unconditionally and each breakpoint only adds to
it, leaving the narrower flags on; a band pairs the wider flag as `off` with the narrower one as `on`.

```css
@container style(--tile--viewport-medium: on) {
    tile-screen {
        grid-template-columns: 1fr 2fr;
    }
}
```

The tokens are assigned on the root element and inherit, so every element sits inside a container the query matches
and no rule declares one of its own. They make a breakpoint reusable rather than retunable: the width stays in the
stylesheet, so overriding a flag forces it without moving the threshold, and an app wanting thresholds of its own
writes its own media queries. Code needing the same answer reads the token through `getComputedStyle`, as it reads any
other value outside the cascade.

A widget changing shape because of the space it was given states a `@container` size query against its own inline size
instead and needs no breakpoint at all.

A component styled against a token it cannot count on, because the stylesheet may not be loaded at all, names its own
fallback in the reference:

```css
color: var(--tile--color-strong, #06C);
```

Restyle a single subtree instead by assigning the tokens inline, naming them through the published contract rather than
as literal strings, so a renamed token breaks the build instead of silently losing its styling:

```tsx
import { css } from "@metreeca/tile";

<section style={css({ colorStrong: "#D60" })}>
```

Read a token where a single CSS value is written by hand rather than by a rule, in an inline style or a presentation
attribute. The reference resolves wherever it is read, so it carries whatever the app overrode and whichever colour
scheme is in force:

```tsx
import { css, tile } from "@metreeca/tile";

<span style={{ backgroundColor: css.var(tile.colorStrong) }}/>
```

A component that cannot count on the stylesheet being loaded writes the reference by hand instead, naming in it the
fallback it wants, as above.

Where a reference doesn't reach, on a canvas or against an API taking a colour as text, take the value a token resolves
to for the element it applies to, rather than a copy of the default, and keep whatever the app overrode along with the
colour scheme in force:

```typescript
import { tile } from "@metreeca/tile";

getComputedStyle(element).getPropertyValue(tile.colorStrong);
```

# Support

- open an [issue](https://github.com/metreeca/tile/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/metreeca/tile/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/metreeca/tile?tab=Apache-2.0-1-ov-file) file for details.
