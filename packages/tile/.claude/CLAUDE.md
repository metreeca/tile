> [!CAUTION]
>
> - `css-developer` carries the conventions every stylesheet here is written to, and **MUST** be activated before one
>   is touched; this file carries only what is specific to the package
> - Revising a token means revising it in **every** place listed under [Token Contract](#token-contract)
> - The suite checks token **names**, never **values**: a wrong colour or size reaches production unnoticed
> - Retuning an anchor means rechecking the contrast ratios under [Colours](#colours)

# Overview

`@metreeca/tile` is the design system: a token layer and the base rules applying it to plain document markup. It
carries no components and no behaviour, and nothing in it imports a rendering framework.

# Module Layout

`src/index.css` imports the modules and is the only entry an app includes. The token modules come first, the anchors
ahead of what derives from them, then the base rules by increasing structural complexity, so a composite lands after
the plain elements it is built from and takes precedence where the two match with equal specificity. It also loads the
brand faces, and carries the page defaults itself and nothing else: `color-scheme`, the page colours and the page
typography, every one of them reading a token it does not state.

The modules fall into two groups, one folder each, and the split holds in both directions: nothing in `markup/`
assigns a token, and every `var()` in `tokens/` is a token deriving from another.

`src/tokens/` — a family per pair, `<family>.ts` naming the tokens and `<family>.css` stating their values, and the
only place either side of the family is revised:

- `typography` — the brand faces and their fallback stacks, the sizes, the weights, the line height and the heading
  tracking
- `spacings` — the ladder a thing is set apart from its neighbour on
- `scalings` — the ladder a thing measured against the text is sized on
- `colors` — the eight colour anchors, the light value registered and the dark one restated per scheme, and the text,
  status, state and surface roles derived from them
- `borders` — the line, the radii, the focus ring, the invalid outline and the vector stroke width
- `elevations` — the surfaces a thing lifted off the page is painted on, the shadows pairing with them and the
  blanket dimming what a modal covers
- `palettes` — the four ten-step colour scales, the nine series slots and the four area classes, the three
  accent-derived scales following the anchors and the heat scale, the slots and the classes stated as literals
- `layers` — the stacking order two things overlapping the page are settled by
- `motions` — the durations a change takes and the curves it accelerates on, the durations collapsing under
  `prefers-reduced-motion`
- `opacities` — how far a thing present but not available is faded
- `viewports` — which breakpoints the viewport has passed, one flag each, `off` registered and `on` set from its width
  upwards

A breakpoint cannot be a width token: CSS does not accept a custom property in a media feature, so
`@media (min-width: var(--x))` never matches. `viewports` carries the *answer* instead of the question, and this is
the one measure in the package an app cannot retune through a custom property.

**Nothing outside `viewports.css` ever states a width**, in CSS or in TypeScript. The stylesheet runs the four queries
once and hands the answers on as tokens, and a rule branches on one through a style query:

```css
@container style(--tile--viewport-medium: on) {
    tile-screen {
        grid-template-columns: 1fr 2fr;
    }
}
```

The tokens are assigned on `:root` and inherit, so every element sits inside a container a style query matches and no
rule declares one of its own. Each is registered with `off`, so the narrow case is a value a rule matches rather than
the absence of one. What this buys is **reuse, not retuning**: the width still lives in `viewports.css`, and
overriding a flag forces it without moving the threshold.

The standard set, and the **only** widths a rule in this repository breaks at:

| Token            | From    | What it answers                                              |
|------------------|---------|--------------------------------------------------------------|
| `viewportSmall`  | `30rem` | a phone held upright, the one-column floor                   |
| `viewportMedium` | `48rem` | a tablet or a split window, where a second column fits       |
| `viewportLarge`  | `64rem` | a laptop, where navigation becomes a rail                    |
| `viewportXlarge` | `90rem` | a desktop, where the measure is capped rather than stretched |

Every width is a **floor**, so the narrow layout is what a rule states unconditionally and each breakpoint only adds
to it, leaving the narrower flags on. A `max-width` query is **NEVER** mixed in: at the boundary two rules then both
match, or neither does. A band is expressed by pairing the wider flag as `off` with the narrower one as `on`.

Code needing the same answer reads the token through `getComputedStyle` as it reads any other, which is a
point-in-time read; a component reacting to a threshold being crossed watches the element rather than polling. There
is deliberately **no** TypeScript copy of the widths and **no** composed `matchMedia` string: one existed briefly and
earned nothing but a test policing its own duplicate.

A widget changing shape because of the space it was **given** states a `@container` size query against its own inline
size and takes no breakpoint at all. These four are for the page-level decisions a container query cannot answer.

`src/markup/` — base rules for plain document markup, carrying **no** `.ts` side and declaring no token of their own:

- `reset.css`, then `headings.css`, `inlines.css`, `blocks.css`, `lists.css`, `tables.css`, `forms.css` — one group
  of elements each

# Layering

The whole design system sits in one cascade layer, `tile`. Each module is imported into it, and the page defaults in
`index.css` are wrapped in a block of their own:

```css
@import "./tokens/typography.css" layer(tile);
@import "./markup/reset.css" layer(tile);

@layer tile {
    :root { /* … */ }
}
```

What this buys is a single guarantee: **an unlayered rule beats every layered one**, whatever the specificity and
whatever order the stylesheets reach the document in. An app or a binding package therefore overrides the design
system by writing an ordinary rule, with no `!important`, no specificity inflation and no control over load order. It
is what lets the specimen state the brand in an inline `<style>` and still win over the bundle vite injects afterwards.

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

`@property` registrations are global regardless of the layer they are declared in, so a token module behaves
identically inside it.

> [!WARNING]
>
> Layering removes specificity from the comparison **between** stylesheets: a design system rule can no longer outrank
> a component rule, however specific it is. Nothing relies on that today, since no module here selects `label` or `nav`,
> which is where `tile-hive` competes. Adding a high-specificity base rule for an element a component also styles is
> the case to watch.

# Token Contract

A token lives in two places, both inside its family pair, revised together:

- `src/tokens/<family>.ts` — the entry naming it, which is what components and apps address
- `src/tokens/<family>.css` — its `@property` registration, and its `:root` assignment where it needs one

**Its value is stated exactly once**, and which of the two carries it follows from what the value is:

- a **literal** is the registration's `initial-value` and gets **no** `:root` assignment: a spacing step, a radius, a
  weight, an anchor, a heat step, a series slot, an area class
- a **derivation**, reading `var()`, `color-mix()` or `oklch()`, is a `:root` assignment and the registration carries
  **no** `initial-value`, which it could not resolve anyway: a colour role, a derived scale step, the border colour,
  the focus ring, the invalid outline
- a **scheme-varying value** carries **NO** `initial-value`, and is therefore registered `syntax: "*"` like a
  derivation, since a registration stating any other syntax **MUST** carry an initial value or the whole `@property`
  rule is invalid. It states each scheme for itself, in four rules: two guarded media queries,
  `@media (prefers-color-scheme: light)` under `:root:not([data-theme="dark"])` and
  `@media (prefers-color-scheme: dark)` under `:root:not([data-theme="light"])`, and two attribute rules,
  `[data-theme="light"]` and `[data-theme="dark"]`

**Neither scheme is the default of the other.** Light is **NOT** a registered fallback that dark overrides: a value
differing by scheme while one of the two doubled as the fallback read as though light were merely the absence of
dark. Between them the four rules cover every case, since `prefers-color-scheme` resolves to `light` wherever dark is
not asked for.

The four forms are **NOT** redundant, and dropping any one breaks a case the others cannot reach:

- a media query follows the platform, and its `:not()` guard is what stops it overriding an app that pinned the
  opposite scheme at the root; its specificity has to stay above the two attribute rules that follow it
- an attribute rule is unqualified rather than `:root[data-theme="…"]`, so a pinned **subtree** works, which is the
  whole point: a media query cannot be scoped to one, so a dark panel on a light page has no other expression
- both attribute rules are needed, since a pinned subtree inherits whatever encloses it and a light island inside a
  dark one would otherwise stay dark

> [!CAUTION]
> When classifying a rule by scheme, an attribute counts only where the rule **selects** it, never where a guard
> **excludes** it. `:root:not([data-theme="light"])` names light to say which scheme it is *not* for. A first cut of
> the suite matched the bare attribute anywhere in the rule, classified the dark query as light as well, and passed
> a stylesheet with an anchor missing from the light scheme entirely.

Only custom properties follow a pinned subtree. Native controls, scrollbars and the caret answer to `color-scheme`,
which `index.css` states for both attribute values alongside the page defaults.

`src/index.ts` gathers the families into `tile` and adds nothing of its own; a new family is added to the spread and
to the imports in `src/index.css`.

`src/index.test.ts` fails when a declared name is defined in neither place or in both, when a defined name is not
declared, when a rule reads a token no one declares, when a registration is missing or duplicated, when a token
carrying no unconditional value is missing from either scheme, and when a derived token carries a default it cannot
resolve. It says nothing about the value behind the name.

An `@property` registration states the type a token takes and the default it falls back on, under the constraints
`css-developer` §Registrations sets out: only an absolute value takes a real type, and a derived token carries no
default at all.

# Token Lifecycle

A published token name is a public commitment, so it is **NEVER** renamed in place: a consumer's stylesheet reads the
custom property directly and no compiler catches the break.

Retiring a name runs in two releases:

1. **Deprecate.** Add the new token through the contract above. Keep the old one declared and registered, and redefine
   it as a derivation reading the new one, so both resolve and nothing painted through either changes. Mark the entry
   in the `.ts` side with `@deprecated`, naming the replacement, and record the pair in `CHANGELOG.md`.
2. **Remove.** Drop the old entry, its registration and its assignment in the next **minor** line, never in a patch.

A consumer migrates by rewriting the call sites, which takes two passes because a token appears in two shapes: the
TypeScript entry (`tile.colorStrong`), which an IDE rename or a `jscodeshift` codemod rewrites safely, and the custom
property (`--tile--color-strong`), which a plain search and replace over `.css` files settles since the name cannot
occur as anything else.

The suite is **NOT** a lifecycle check: a deprecated token passes exactly as any other, since it is still declared,
registered and defined. Only the changelog records that it is on its way out.

> [!WARNING]
>
> Because a literal default now lives only in its registration, a browser that ignores `@property` leaves every one of
> them unset rather than falling back on a `:root` copy. That is not a new floor: `oklch(from …)`, which the colour
> roles are derived with, lands in the same browsers and versions, so nothing here was reachable without `@property`
> support to begin with.

# Colours

Eight anchors carry literals in `colors.css`. Seven state a value per colour scheme, in the four rules the contract
above sets out; `--tile--color-warn` alone carries one value for both and keeps its registered default:

- `--tile--color` and `--tile--background-color`
- `--tile--color-subtle`, which an interface carries at rest, and `--tile--color-strong`, which marks a thing out;
  both ship brand-agnostic, and an app supplies its own brand by overriding them
- `--tile--color-info`, `--tile--color-pass`, `--tile--color-warn` and `--tile--color-fail`, the four steps of the
  meaning scale below

## The meaning scale

Every meaning a widget carries lands on these four steps, and **NO** widget invents a fifth colour: a meaning the
scale does not carry is stated in words.

| Step   | Says                   |
|--------|------------------------|
| `info` | stated or provisional  |
| `pass` | completed as intended  |
| `warn` | completed with caveats |
| `fail` | failed to complete     |

`info` is **NOT** a milder `pass`: it is the absence of a verdict, so the scale is one unjudged step ahead of a
three-step ramp. Three kinds of meaning share it, chosen by what the widget **is**, so no widget carries two:
`level` on content, `mode` on controls, `status` on reported things:

| Attribute | `normal`            | `info`    | `pass`      | `warn`    | `fail`     |
|-----------|---------------------|-----------|-------------|-----------|------------|
| `level`   | an ordinary passage | `info`    | `highlight` | `warning` | `critical` |
| `mode`    | an ordinary control | `safe`    | `commit`    | `alert`   | `danger`   |
| `status`  | nothing to report   | `pending` | `success`   | `warning` | `failure`  |

**`normal` is the default of all three, and it is NOT a step**: it carries no colour coding at all, leaving the
ordinary page colours. A widget that states nothing is `normal`, and a `level="normal"` passage is **NOT** a blue
`info` admonition. Only the four marked values reach the scale.

Four steps is the ceiling, because colour carries no more: one absence of hue and three hues told apart at a glance.
A meaning the scale does not carry is stated in **words**, never in a fifth colour.

A widget maps its remaining values onto the steps and states that mapping where its consumers read it, or two widgets
put the same meaning on different steps and the learned scale breaks:

```
tile-note    level   info → info    highlight → pass    warning → warn    critical → fail
tile-button  mode    safe → info    commit → pass       alert → warn      danger → fail
```

### Which attribute a widget takes

Decided by **tense**, which also places any new value:

| Attribute | Answers                          | Tense    | Set by                    | Taken by        |
|-----------|----------------------------------|----------|---------------------------|-----------------|
| `level`   | how much attention this deserves | timeless | the author, ahead of time | content         |
| `mode`    | what activating this will do     | future   | the designer              | controls        |
| `status`  | what the system says happened    | past     | the system, at runtime    | reported things |

Written into the page by a human: `level`. Appears because something ran: `status`. A consequence not yet incurred:
`mode`. No tense at all: it is `look`, not a meaning.

### `look`

How loud a thing appears is a separate axis, carried by the `look` attribute and **NOT** colour-coded: it is told in
layout, weight and border, so it never competes with the scale for the same channel and a widget carries one of each
without the readings interfering.

| Value    | Means                                                          |
|----------|----------------------------------------------------------------|
| `subtle` | recedes: lighter weight, no border, less room                  |
| `normal` | ordinary weight, ordinary room                                 |
| `strong` | carries the moment: heavier weight, a border, more room, first |

`subtle` and `strong` are the pair the colour anchors already use, so one vocabulary names this axis everywhere.

> [!CAUTION]
> Do **NOT** name this attribute `role`, which collides with ARIA, or `style`, which collides with the DOM attribute
> and the JSX prop. `primary` is **NOT** a value: it names a position in a flow, one per dialog, which a control
> cannot know about itself, where `strong` names a level the control does know.

How loud a widget appears is a property of the **area** rather than of the widget, so an area settles it for
everything it holds through `--tile--look`, from the `visuals` family. **EVERY** widget taking a `look` reads it the
same way, so an app learns the mechanism once:

- the widget **NEVER** defaults the attribute: it renders one only where the consumer asked for it, since the
  attribute has to be absent for the area to have a say
- the stylesheet keys each step on the attribute, `[look="subtle"]`, and repeats that step for a widget carrying no
  attribute inside `@container style(--tile--look: subtle)`, which is the only way a rule branches on a value
- the two forms carry the same declarations, restated: a style query is a conditional group and takes rules of its
  own, so they cannot be written as one selector

A widget stating a `look` answers to that alone, which is what leaves one loud control standing in a quietened
toolbar.

> [!CAUTION]
> What a widget **means** is **NEVER** settled this way. A meaning belongs to the one widget carrying it, so `mode`,
> `level` and `status` are stated at the widget and inherited by nothing: an area quietening its controls leaves each
> of them saying what it says.

### Tensions on the record

- **Blue collides with the brand accent.** `--tile--color-strong` ships blue, so the `info` step and a strong control
  are confusable, worse for an app branding in blue. The info token is a cyan for this reason.
- **A step is NEVER told in colour alone**, since `pass` and `fail` are the pair colour vision deficiency collapses
  most readily; the icon and the wording carry the same meaning.
- **`mode="commit"` and `look="strong"` co-occur on nearly every Save button.** They stay distinct, but the pairing
  has to stay the exception or green-plus-prominence becomes the default and means nothing.
- **`pending` and `info` share the `info` step.** A pending that must read as *moving* rather than merely unjudged
  adds the loading opacity and the motion tokens on top of the hue, not instead of it.
- **`level` and `status` collapse at the attribute level today.** `tile-note` carries both, an authored empty-state
  aside and a `Fault`. `pending` is the value that will force them apart, since an authored admonition is never
  pending.
- **`highlight` is the thinnest cell.** A passage reporting that something *went* well is really reporting a
  `status`, so it earns its place only for a passage singled out as worth having.

> [!WARNING]
>
> `--tile--color-warn` is a **fill, never a stroke**, and it carries **one value in both colour schemes**. A
> caution paints a filled badge with it and sets its message in the dark page anchor over it, at 11.0:1. Stroking it
> on the page gives **1.73:1** and is a defect.
>
> This is forced by the colour space, **NOT** chosen. Red reaches full saturation at a middling lightness, so
> `--tile--color-fail` is dark enough to read on white and loud at once. Yellow reaches full saturation only when
> it is very light, so any yellow dark enough to stroke on white has already spent its chroma. Three rounds inside a
> stroke budget proved it: `#850` at 4.5:1 read as mud, `#A40` escaped the mud only by moving to a burnt orange
> sitting ΔE 2.0 from the failure red under simulated deuteranopia, and `#B67C00` at 3:1 was still muted at chroma
> 0.132. As a fill it reaches **chroma 0.151** against the failure's 0.218, and separates from it by **ΔE 25.8 deutan
> and 42.7 protan**.
>
> Retuning it for a better stroke contrast walks straight back into the mud. If a caution ever genuinely needs
> coloured text, that is a **second token**, not a change to this one.
>
> `--tile--color-fail` alone holds 4.5:1 and serves as either text or mark. `--tile--color-info` and
> `--tile--color-pass` are **marks at 3:1**, not text: cyan and green are chroma-starved at the lightness 4.5:1
> forces, so holding them to it left `info` at chroma 0.090 against the failure's 0.218, reading as dull beside
> every other step. At the mark budget they reach 0.107 and 0.202 and lift from L 0.52 to L 0.61. They paint the
> glyph, the rule and the fill of a notice whose text takes `--tile--color` on the tint, at 18.5:1.
>
> Do **NOT** drop `--tile--color-fail` to the mark budget to match them: `markup/forms.css` and
> `tile-cell/src/note.css` both paint text with it, and red is the one hue reaching full chroma at a lightness dark
> enough to carry a sentence.

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

`--tile--color-fail` is an anchor rather than a derivation of an accent on purpose: deriving it carried the hue an
app brands with into the role marking a failure, so a blue-branded interface rejected a value in blue.

The striped table row is where the custom property cycle `css-developer` warns of would bite: it paints
`background-color` instead of retuning `--tile--background-color`, which every other colour here stands on.

Text roles hold WCAG AA contrast, 4.5:1 against the background they sit on, in **both** schemes and over the stripe;
the focus ring holds 3:1. The exceptions a contrast check is allowed to pass over, each **by design**:

- `--tile--border-color`, `--tile--color-disabled` and `--tile--color-placeholder`, below 3:1, carrying no meaning
  on their own. The last two share one value, 1.75:1 light and 1.52:1 dark on the edit background: both stand for
  text the reader has not supplied, and a disabled control is told from an empty one by its **background**, never by
  the weight of its text. Reading either as a text role is the mistake to avoid
- `--tile--color-info` and `--tile--color-pass`, marks at 3:1, since the hues cannot hold chroma at the lightness
  4.5:1 forces
- `--tile--color-warn`, a fill, at 1.73:1 stroked

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
replacement for a role token: the text and background roles in `colors.css` do not land on the ladder, and
`--tile--background-color-edit` and `--tile--background-color-stripe` sit below its first step.

`--tile--color-heat-*` carries literals, for the same reason `--tile--color-fail` does: a magnitude coding taking
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
`--tile--color-fail` does: a series colour follows the thing it paints, so neither a rebrand nor a filter that
drops a series may repaint the survivors. One value serves both schemes, since a tint that recedes on the light page
stands out on the dark one.

They are nine of the ten hues of [Tableau 10](https://www.tableau.com/blog/colors-upgrade-tableau-10-56782), its grey
left out, reordered: Tableau's own sequence puts adjacent hues at the same lightness, which the gates reject.

Validated against the package surfaces rather than against the defaults the `dataviz` skill ships:

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
> declared. Reordering the slots, resampling a hue or inserting a tenth forfeits the guarantee and means re-measuring
> the candidate orderings. Nine hold only where neighbours are compared, on grouped bars, stacked
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
