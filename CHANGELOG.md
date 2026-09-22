# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/metreeca/tile/commits/main)

### Added

- `@metreeca/tile`: elevation tokens, pairing a surface with the shadow that lifts it, plus the blanket dimming
  what a modal covers
- `@metreeca/tile`: layering tokens settling the stacking order of things overlapping the page
- `@metreeca/tile`: motion tokens, the durations collapsing under `prefers-reduced-motion`
- `@metreeca/tile`: opacity tokens for a thing present but not available
- `@metreeca/tile`: status anchors for a success, a caution and an aside, each with a notice tint, alongside the
  failure colour already carried
- `@metreeca/tile`: pressed and selected state roles, and the fills a control colouring its whole box takes
- `@metreeca/tile`: a heading size token and heading tracking
- `@metreeca/tile`: viewport tokens carrying the result of each breakpoint query, so a stylesheet branches on a
  breakpoint by name through a style query instead of repeating its width, which CSS gives it no other way to do
- `@metreeca/tile`: `data-theme` pins a colour scheme on the root element or on any subtree, which a
  `prefers-color-scheme` query cannot express
- `@metreeca/tile`: `css.var()` gives the reference a token is read through, for an inline style, a presentation
  attribute or anywhere else a CSS value is written by hand rather than by a rule
- `@metreeca/tile`: base rules for a preformatted block, set apart on the stripe as a quotation is and scrolled
  where it runs past the measure
- `@metreeca/tile`: a code span is read as one word, rather than folded at a hyphen or a space
- `@metreeca/tile-hive`: `host()` fits the root it creates to whatever holds it, so a frame rendered into it fills
  the window rather than standing as tall as its content; a root the document already carries is left as it stands
