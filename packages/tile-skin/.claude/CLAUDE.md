> [!CAUTION]
>
> - `css-developer` carries the conventions every stylesheet here is written to, and **MUST** be activated before one
>   is touched; this file carries only what is specific to the package
> - Revising a token means revising it in **every** place listed under [Token Contract](#token-contract)
> - The suite checks token **names**, never **values**: a wrong colour or size reaches production unnoticed
> - Retuning an anchor means rechecking the contrast ratios under [Colours](#colours)

# Overview

`@metreeca/tile-skin` is the design system: a token layer and the base rules applying it to plain document markup. It
carries no components and no behaviour, and nothing in it imports a rendering framework.

# Module Layout

`src/index.css` imports the modules and is the only entry an app includes. They are listed by increasing structural
complexity, so a composite lands after the plain elements it is built from and takes precedence where the two match
with equal specificity. It also loads the brand faces and carries the page defaults itself: `color-scheme`, the page
colours and typography, and the `:root` default of every token.

- `tokens.css` — the `@property` registration of every token: the type it takes and the default it falls back on
- `schemes.css` — what the five colour anchors are worth, one block per platform colour scheme
- `palettes.css` — the four ten-step colour scales, the nine series slots and the four area classes, the three
  accent-derived scales following the anchors and the heat scale, the slots and the classes stated as literals
- `reset.css`, then `headings.css`, `inlines.css`, `blocks.css`, `lists.css`, `tables.css`, `forms.css` — base rules
  for one group of elements each

# Layering

The whole design system sits in one cascade layer, `tile`. Each module is imported into it, and the `:root` defaults in
`index.css` are wrapped in a block of their own:

```css
@import "./tokens.css" layer(tile);
@import "./reset.css" layer(tile);

@layer tile {
    :root { /* … */ }
}
```

What this buys is a single guarantee: **an unlayered rule beats every layered one**, whatever the specificity and
whatever order the stylesheets reach the document in. An app or a binding package therefore overrides the skin by
writing an ordinary rule, with no `!important`, no specificity inflation and no control over load order. It is what
lets the specimen state the brand in an inline `<style>` and still win over the bundle vite injects afterwards.

Three rules follow, and they are the whole of the discipline:

- a rule added to **any** module here **ALWAYS** goes inside the layer; one left outside would outrank the entire
  design system and could never be overridden again
- a component stylesheet in a binding package stays **unlayered**, which it does simply by not being imported through
  `index.css`
- an app with layers of its own orders them after `tile`

Two things the arrangement deliberately does not do:

- **It does not subdivide.** One layer, not `tile.tokens` / `tile.base` / `tile.composites`: inside a single layer,
  source order and specificity decide exactly as they did before, so the module order in `index.css` still carries the
  precedence a composite needs over its plain elements. Every extra layer name is a public commitment an app has to
  order against, bought for nothing.
- **It does not touch the font import.** The Google Fonts `@import` stays unlayered, since it carries only
  `@font-face`, which a layer has no effect on.

`@property` registrations are global regardless of the layer they are declared in, so `tokens.css` behaves identically
inside it.

> [!WARNING]
>
> Layering removes specificity from the comparison **between** stylesheets: a skin rule can no longer outrank a
> component rule, however specific it is. Nothing relies on that today, since no module here selects `label` or `nav`,
> which is where `tile-hive` competes. Adding a high-specificity base rule for an element a component also styles is
> the case to watch.

# Token Contract

A token lives in three places, revised together:

- `src/index.ts` — the `tile` entry naming it, which is what components and apps address
- `src/tokens.css` — its `@property` registration
- `src/index.css` — its `:root` assignment, or, for the five colour anchors, one assignment per scheme in
  `src/schemes.css`, or, for a colour scale step, its assignment in `src/palettes.css`

`src/index.test.ts` fails when a declared name is never assigned, when an assigned name is not declared, or when a rule
reads a token no one declares. It says nothing about the value behind the name.

An `@property` registration states the type a token takes and the default it falls back on, under the constraints
`css-developer` §Registrations sets out: only an absolute value takes a real type, and a derived token carries no
default at all.

# Colours

Five anchors carry literals, one value each per colour scheme in `schemes.css`:

- `--tile--color` and `--tile--background-color`
- `--tile--color-subtle`, which an interface carries at rest, and `--tile--color-strong`, which marks a thing out;
  both ship brand-agnostic, and an app supplies its own brand by overriding them
- `--tile--color-invalid`, which a failure is told in

Every other colour derives from them through `color-mix(in oklab, …)` or `oklch(from …)`, so an app retuning the
anchors carries the whole interface along.

The accent pair is named for the emphasis it carries rather than for how it looks, as `css-developer` §Colours requires.
`subtle` and `strong` are relative to each other, which any brand honours by supplying a quieter value and a louder one,
and neither name survives being read as an absolute.

> [!WARNING]
>
> `subtle` is about **chroma**, **NOT** contrast or lightness: the subtle accent is near-neutral, carrying about a
> fifth of the strong one's chroma (0.034 against 0.177 in the light scheme, 0.032 against 0.155 in the dark), at
> much the same lightness. It is a slate beside a saturated colour, which is what the brand pair does too, and it
> holds the higher contrast of the two, 5.91:1 against 5.57:1 on white. A "fix" darkening it or giving it the hue of
> its partner undoes both the reading and the text roles derived from it.

`--tile--color-invalid` is an anchor rather than a derivation of an accent on purpose: deriving it carried the hue an
app brands with into the role marking a failure, so a blue-branded interface rejected a value in blue.

The striped table row is where the custom property cycle `css-developer` warns of would bite: it paints
`background-color` instead of retuning `--tile--background-color`, which every other colour here stands on.

Text roles hold WCAG AA contrast, 4.5:1 against the background they sit on, in **both** schemes and over the stripe;
the focus ring holds 3:1. `--tile--border-color` and `--tile--color-disabled` sit below 3:1 **by design** and carry no
meaning on their own, so they are the two exceptions a contrast check is allowed to pass over.

# Palettes

`palettes.css` carries the colours a chart, a coding or a map reads: four ten-step scales, nine series slots and four
area classes. A step, a slot or a class is **NEVER** a substitute for a role token: a role says what a colour means in
the interface, these say where a value sits or which thing it belongs to.

## Scales

Four ten-step scales address a colour by position rather than by role, the number being the share of the anchor a step
carries: `010` is the faintest and `100` the anchor at full strength, which the top step of each derived scale reads
straight off.

`--tile--color-gray-*`, `--tile--color-subtle-*` and `--tile--color-strong-*` derive from the anchors, so an app
retuning a brand carries them along and a step mixes towards the page in either scheme. A step is **NOT** a
replacement for a role token: the text and background roles in `index.css` do not land on the ladder, and
`--tile--background-color-edit` and `--tile--background-color-stripe` sit below its first step.

`--tile--color-heat-*` carries literals, for the same reason `--tile--color-invalid` does: a magnitude coding taking
the hue an app brands with stops reading as a temperature. It runs cool blue → green → yellow → red → violet, the
violet standing for a measure past the top of the range.

> [!WARNING]
>
> The heat scale codes by **hue**, and its lightness is deliberately **NOT** monotone: it peaks mid-scale and falls at
> both ends. A step therefore means a band a legend names, never a position on a continuous gradient, and a consumer
> **ALWAYS** states the band in text beside the colour. Ranking its steps by lightness, or reading a gradient across
> them, is a misuse the values cannot support; a continuous heat map needs a monotone scale of its own.

Text over a heat step takes `--tile--color` up to `070` and `--tile--background-color` from `080` on, where the scale
turns dark enough to carry it. The dark scheme restates only the last two steps, which at their light values sit at
2.05:1 and 2.76:1 against the page and lose the top of the range; the cool half holds in both schemes and is stated
once.

## Series

`--tile--color-series-1` to `--tile--color-series-9` tell one thing apart from another. A number is a slot, not a
share, so the three-digit form of a scale would misread here. The slots carry literals, for the reason
`--tile--color-invalid` does: a series colour follows the thing it paints, so neither a rebrand nor a filter that
drops a series may repaint the survivors. One value serves both schemes, since a tint that recedes on the light page
stands out on the dark one.

They are nine of the ten hues of [Tableau 10](https://www.tableau.com/blog/colors-upgrade-tableau-10-56782), its grey
left out, reordered: Tableau's own sequence puts adjacent hues at the same lightness, which the gates reject.

Validated against the package surfaces rather than against the defaults the `dataviz` skill ships, with
`scripts/validate_palette.js`:

- worst adjacent CVD ΔE 13.7, worst adjacent normal-vision ΔE 16.7, in the order declared
- the order leads with Tableau's blue and clears both gates; 347 of 30,000 sampled blue-leading orders do
- every slot clears 4.1:1 on `#111`, so one column serves both schemes

> [!WARNING]
>
> **Lightness alternation carries the separation**, not hue spacing. Simulated protan and deutan vision collapses hue,
> so a run of slots at one lightness fails however evenly their hues are spread: a generated set with even hues at one
> lightness measured ΔE 0.7 against a target of 8, and needed a swing of 0.14 in OKLCh L before it passed. That is
> what the declared order buys, and why it is not Tableau's.

> [!WARNING]
>
> The **order** is the separation mechanism, not a preference: the figures above hold for adjacent pairs in the order
> declared. Reordering the slots, resampling a hue or inserting a tenth forfeits the guarantee and means re-running
> the validator over the candidate orderings. Nine hold only where neighbours are compared, on grouped bars, stacked
> segments and lines; where every pair is compared, on a scatter, a bubble chart or a map, **only the first three
> hold**.

> [!WARNING]
>
> Four of the nine fall short of 3:1 against the light page: the yellow at 1.61:1, the pink at 1.98:1, the teal at
> 2.29:1 and the orange at 2.42:1.
> A chart carrying them **ALWAYS** states its figures in text as well, through direct labels or a table view, and the
> slots are the one family a contrast check passes over wholesale rather than slot by slot.

A tenth slot has no room left: at this lightness every candidate that clears the gates repeats a hue already in the
set, passing on adjacency alone while colliding wherever all pairs are compared. A tenth thing is therefore gathered
under one residual slot rather than coloured.

## Areas

`--tile--color-area-1` to `--tile--color-area-4` fill a shape rather than draw a mark: a region on a choropleth, a
band on a terrain, a cell on a grid. They are the four colourblind-safe classes of the
[ColorBrewer Paired](https://colorbrewer2.org/#type=qualitative&scheme=Paired&n=4) scheme, in its own order.

The structure is the point: two pairs, a light and a dark of one hue each. A reader tells the members of a pair apart
by lightness where hue alone would fail, and reads the two hues as two families, which is what a greyscale print or a
photocopy survives on.

Every pair of classes meets on a shared boundary, not only the ones a legend lists side by side, so the four are held
to the **all-pairs** measure rather than the adjacent one:

- worst all-pairs CVD ΔE 13.3 (`pale green ↔ pale blue`, deutan), tritan 4.3
- worst all-pairs normal-vision ΔE 14.1, against the skill's floor of 15: the two pale classes are what sits below it
- the pale classes hold 1.67:1 and 1.52:1 on the light page, the dark ones 4.77:1 and 3.38:1; on `#111` every class
  clears 3.9:1

> [!WARNING]
>
> **Four is the limit.** Paired stops being colourblind-safe past four classes, so a fifth class is a second map, an
> inset or a facet, never a fifth colour. The normal-vision shortfall of 14.1 is accepted here **only** because a map
> keeps its boundaries drawn and names its classes in the legend; a chart, which has neither, may not borrow these
> four in place of the series slots.

# Literals

The scale tokens are declared here, so a rule in this package reads them exactly as a consumer does, never as the
number behind them. The optical nudges that stay literal are the `0.1em` between quoted paragraphs and the mono-face
adjustments in `inlines.css`; each says in a comment why it sits below the scale.
