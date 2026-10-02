# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0](https://github.com/metreeca/tile/compare/v0.2.0...HEAD)

### Added

- `@metreeca/tile` — `padding` spacing token, `color`, `backgroundColor`, `padding`, `borderRadius` and `boxShadow`
  style properties, and exported token group types
- `@metreeca/tile` — enlarged images shown on a rounded panel over the whole viewport, and every heading level sized
  from the heading size token
- `@metreeca/tile-data/store` — shared resource store (`Store`, `useStore`) with `useResource` and `useCollection`
  bindings over `@metreeca/keep`
- `@metreeca/tile-data/router` — nested `Routes` tables routing the trailing path of a section, with subtree patterns
  and a bare `*` catch-all inherited by nested tables
- `@metreeca/tile-cell/hint` — pointer hint naming a control, a button standing on a glyph alone included
- `@metreeca/tile-cell` — `title` hint on links, `Reload` and `Dismiss` icon roles, and the GitHub mark
- `@metreeca/tile-hive/box`, `/stack` and `/strip` — styled box, vertical stack and horizontal strip layouts with
  split placements
- `@metreeca/tile-hive/shell` — `copy` slot under the content, with the done action taken off show while exchanges
  are in flight

### Changed

- `@metreeca/tile-data/router` — **breaking**: `Router` drops the `mode` (hash routing) and `fallback` props, in favour
  of catch-all patterns in `Routes`; route tables are declared only in `Routes`
- `@metreeca/tile-data/router` — **breaking**: the navigator takes the `replace` flag in the navigation object rather
  than as a second argument
- `@metreeca/tile-data/router` — **breaking**: every same-site link is followed in place, and `Routes` renders nothing
  while it moves the location
- `@metreeca/tile-cell/fault` — **breaking**: `text` and `children` props removed; reader-actionable faults are told by
  their `detail`
- `@metreeca/tile-data` — depends on `@metreeca/keep` and `@metreeca/keep-rest` `^0.10.0`

### Fixed

- `@metreeca/tile` — scheme-varying colours stated as `light-dark()` pairs
- `@metreeca/tile-cell` — glyphs and link logos centred on the text, neutral button hover and press painted once, note
  code blocks laid out as written, subtle links set in the surrounding face
- `@metreeca/tile-hive/shell` — headers held to the height of a subtle button, focus rings kept whole, columns clipped
  to their width with wide content scrolled across, and the menu kept at the end of a header without a heading

## [0.2.0](https://github.com/metreeca/tile/releases/tag/v0.2.0)

Initial release of the Metreeca Tile minimalist model-driven UI toolkit, superseding the legacy `@metreeca/tile` 4.x
line: a design system published as CSS tokens and base rules, with Preact bindings wiring components to headless
`@metreeca/core` state and `@metreeca/http` clients. `@metreeca/tile-lens` and `@metreeca/tile-form` claim their
package names ahead of the linked data views and forms they will carry.

- `@metreeca/tile` — design system tokens (colours, palettes, typography, spacings, scalings, borders, elevations,
  layers, motions, opacities, viewports, visuals), base markup rules, `data-theme` colour scheme pinning and the
  `css()` / `css.var()` helpers
- `@metreeca/tile-data` — shared faults, shared fetch client, headless component state and client-side routing
- `@metreeca/tile-cell` — button, fault, icons, link, logo and note widgets
- `@metreeca/tile-hive` — shell, styled area and tabbed panel containers
- `@metreeca/tile-lens` — linked data selection state
- `@metreeca/tile-form` — placeholder for linked data forms
