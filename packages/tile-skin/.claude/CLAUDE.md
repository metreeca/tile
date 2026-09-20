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
  `src/schemes.css`

`src/index.test.ts` fails when a declared name is never assigned, when an assigned name is not declared, or when a rule
reads a token no one declares. It says nothing about the value behind the name.

An `@property` registration states the type a token takes and the default it falls back on, under the constraints
`css-developer` §Registrations sets out: only an absolute value takes a real type, and a derived token carries no
default at all.

# Colours

Five anchors carry literals, one value each per colour scheme in `schemes.css`:

- `--tile--color` and `--tile--background-color`
- `--tile--color-accent-subtle`, which an interface carries at rest, and `--tile--color-accent-strong`, which marks a
  thing out; both ship brand-agnostic, and an app supplies its own brand by overriding them
- `--tile--color-invalid`, which a failure is told in

Every other colour derives from them through `color-mix(in oklab, …)` or `oklch(from …)`, so an app retuning the
anchors carries the whole interface along.

The accent pair is named for the emphasis it carries rather than for how it looks, as `css-developer` §Colours requires.
`subtle` and `strong` are relative to each other, which any brand honours by supplying a quieter value and a louder one,
and neither name survives being read as an absolute.

> [!WARNING]
>
> `subtle` is about **chroma**, **NOT** contrast: the subtle accent carries roughly half the chroma of the strong one
> (0.083 against 0.177 in the light scheme) while holding the **higher** contrast, 10.4:1 against 5.6:1 on white,
> because it is the darker of the two. A "fix" bringing its contrast down to match the name breaks the text roles
> derived from it.

`--tile--color-invalid` is an anchor rather than a derivation of an accent on purpose: deriving it carried the hue an
app brands with into the role marking a failure, so a blue-branded interface rejected a value in blue.

The striped table row is where the custom property cycle `css-developer` warns of would bite: it paints
`background-color` instead of retuning `--tile--background-color`, which every other colour here stands on.

Text roles hold WCAG AA contrast, 4.5:1 against the background they sit on, in **both** schemes and over the stripe;
the focus ring holds 3:1. `--tile--border-color` and `--tile--color-disabled` sit below 3:1 **by design** and carry no
meaning on their own, so they are the two exceptions a contrast check is allowed to pass over.

# Literals

The scale tokens are declared here, so a rule in this package reads them exactly as a consumer does, never as the
number behind them. The optical nudges that stay literal are the `0.1em` between quoted paragraphs and the mono-face
adjustments in `inlines.css`; each says in a comment why it sits below the scale.
