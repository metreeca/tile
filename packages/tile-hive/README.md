# @metreeca/tile-hive

[![npm](https://img.shields.io/npm/v/@metreeca/tile-hive)](https://www.npmjs.com/package/@metreeca/tile-hive)

Preact layouts and containers for [@metreeca/tile](https://github.com/metreeca/tile) interfaces.

A consumer assembles a screen from the arrangements an app repeats: pages, tables, accordions, panes, grids and stacks
that answer where things sit. A layout places the widgets handed to it without knowing what they mean, so an arrangement
is replaced without touching what the interface does.

Styling is structural only: what an arrangement needs to work, with colour, type and spacing left to
[@metreeca/tile-skin](https://www.npmjs.com/package/@metreeca/tile-skin) or to whoever styles the app.

# Installation

```shell
npm install preact               # peer dependency
npm install @metreeca/tile-hive  # this package
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

# Usage

> [!NOTE]
>
> This section introduces essential concepts; for complete coverage, see the
> [API reference](https://metreeca.github.io/tile/modules/_metreeca_tile-hive.html).

{TBD: usage overview and examples}

# Support

- open an [issue](https://github.com/metreeca/tile/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/metreeca/tile/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/metreeca/tile?tab=Apache-2.0-1-ov-file) file for details.
