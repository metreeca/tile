# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/metreeca/tile/commits/main)

### Added

- `@metreeca/tile-skin`: elevation tokens, pairing a surface with the shadow that lifts it, plus the blanket dimming
  what a modal covers
- `@metreeca/tile-skin`: layering tokens settling the stacking order of things overlapping the page
- `@metreeca/tile-skin`: motion tokens, the durations collapsing under `prefers-reduced-motion`
- `@metreeca/tile-skin`: opacity tokens for a thing present but not available
- `@metreeca/tile-skin`: status anchors for a success, a caution and an aside, each with a notice tint, alongside the
  failure colour already carried
- `@metreeca/tile-skin`: pressed and selected state roles, and the fills a control colouring its whole box takes
- `@metreeca/tile-skin`: a heading size token and heading tracking
- `@metreeca/tile-skin`: viewport tokens carrying the result of each breakpoint query, so a stylesheet branches on a
  breakpoint by name through a style query instead of repeating its width, which CSS gives it no other way to do
- `@metreeca/tile-skin`: `data-theme` pins a colour scheme on the root element or on any subtree, which a
  `prefers-color-scheme` query cannot express
