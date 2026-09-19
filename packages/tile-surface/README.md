# @metreeca/tile-surface

[![npm](https://img.shields.io/npm/v/@metreeca/tile-surface)](https://www.npmjs.com/package/@metreeca/tile-surface)

Preact layouts and widgets for @metreeca/tile interfaces.

A consumer assembles a screen from the arrangements an app repeats: shells, panes, grids and stacks that answer where
things sit, and the recurring compositions built over them. Behaviour comes from the headless state and the wiring
above it, so replacing an arrangement never touches what the interface does.

Styling is structural only: what a widget needs to work, with colour, type and spacing left to
[@metreeca/tile](https://www.npmjs.com/package/@metreeca/tile) or to whoever styles the app.

# Installation

```shell
npm install preact                  # peer dependency
npm install @metreeca/tile-surface  # this package
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

# Usage

| Module                            | Description                    |
|-----------------------------------|--------------------------------|
| [@metreeca/tile-surface][surface] | Preact layouts and widgets     |

[surface]: https://metreeca.github.io/tile/modules/_metreeca_tile-surface.index.html

# Support

- open an [issue](https://github.com/metreeca/tile/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/metreeca/tile/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/metreeca/tile?tab=Apache-2.0-1-ov-file) file for details.
