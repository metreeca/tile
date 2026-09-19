> [!CAUTION]
>
> - Revising a token means revising it in **every** place listed under [Token Contract](#token-contract)
> - The suite checks token **names**, never **values**: a wrong colour or size reaches production unnoticed
> - Retuning an accent means rechecking the contrast ratios under [Colours](#colours)

# Overview

`@metreeca/tile-skin` is the design system: a token layer and the base rules applying it to plain document markup. It
carries no components and no behaviour, and nothing in it imports a rendering framework.

# Module Layout

`src/index.css` imports the modules and is the only entry an app includes. They are listed by increasing structural
complexity, so a composite lands after the plain elements it is built from and takes precedence where the two match
with equal specificity. It also loads the brand faces and carries the page defaults itself: `color-scheme`, the page
colours and typography, and the `:root` default of every token.

- `tokens.css` — the `@property` registration of every token: the type it takes and the default it falls back on
- `schemes.css` — what the four colour anchors are worth, one block per platform colour scheme
- `reset.css`, then `headings.css`, `inlines.css`, `blocks.css`, `lists.css`, `tables.css`, `forms.css` — base rules
  for one group of elements each

# Token Contract

A token lives in three places, revised together:

- `src/index.ts` — the `tile` entry naming it, which is what components and apps address
- `src/tokens.css` — its `@property` registration
- `src/index.css` — its `:root` assignment, or, for the four colour anchors, one assignment per scheme in
  `src/schemes.css`

`src/index.test.ts` fails when a declared name is never assigned, when an assigned name is not declared, or when a rule
reads a token no one declares. It says nothing about the value behind the name.

# Colours

Four anchors carry literals, one pair per colour scheme in `schemes.css`:

- `--tile--color` and `--tile--background-color`
- `--tile--color-accent-lite` and `--tile--color-accent-dark`, which carry the company brand

Every other colour derives from them through `color-mix(in oklab, …)`, so an app retuning the anchors carries the whole
interface along.

> [!WARNING]
>
> **NEVER** reassign an anchor in a rule that also reads a token derived from it: the two form a custom property cycle
> and both resolve to nothing. This is why the striped table row paints `background-color` instead of retuning
> `--tile--background-color`.

Text roles hold WCAG AA contrast, 4.5:1 against the background they sit on, in **both** schemes and over the stripe;
the focus ring holds 3:1. `--tile--border-color` and `--tile--color-disabled` sit below 3:1 by design and carry no
meaning on their own.

# Registrations

An `@property` `initial-value` has to be computationally independent, so a token stated in `em`, `rem` or a percentage
is registered `syntax: "*"`; only an absolute value takes a real type. A derived token is registered `syntax: "*"` with
no `initial-value`, since its value stands on other tokens.

# Literals

Spacing, sizes, weights and radii come from the scale tokens, never from a number written into a rule. An optical
nudge below the scale, such as the `0.1em` between quoted paragraphs, stays literal and says so in a comment.
