# @metreeca/tile

[![npm](https://img.shields.io/npm/v/@metreeca/tile)](https://www.npmjs.com/package/@metreeca/tile)

Metadata and element wiring for [@metreeca/tile](https://github.com/metreeca/tile) interfaces.

A consumer reaches what the app states about itself, the defaults its controls observe, the element a page is rendered
into, and the attribute values and event handlers a component builds out of state: everything an interface needs
wherever it is assembled and no single layer should own.

Nothing here decides what an interface shows or how it is wired: layouts and controls come from the binding packages,
state from the headless ones.

# Installation

```shell
npm install @metreeca/tile
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

> [!WARNING]
>
> Importing this package reads the document, so it belongs to a browser: a consumer without one, a test or a server
> render, has to supply a DOM before the import runs.

# Usage

> [!NOTE]
>
> This section introduces essential concepts; for complete coverage, see the
> [API reference](https://metreeca.github.io/tile/modules/_metreeca_tile.html).

{TBD: usage overview and examples}

# Support

- open an [issue](https://github.com/metreeca/tile/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/metreeca/tile/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/metreeca/tile?tab=Apache-2.0-1-ov-file) file for details.
