# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
