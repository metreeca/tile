# @metreeca/tile-data

[![npm](https://img.shields.io/npm/v/@metreeca/tile-data)](https://www.npmjs.com/package/@metreeca/tile-data)

Preact contexts and hooks for [@metreeca/tile](https://github.com/metreeca/tile) interfaces.

The contexts a Tile app provides and the hooks its components consume them with, along with the binding that turns a
framework-agnostic `@metreeca/core` state object into the state of a Preact component.

# Installation

```shell
npm install preact               # peer dependency
npm install @metreeca/tile-data  # this package
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

> [!WARNING]
>
> Importing what the app states about itself reads the document, so it belongs to a browser: a consumer without one, a
> test or a server render, has to supply a DOM before the import runs.

# Usage

> [!NOTE]
>
> This section introduces essential concepts; for complete coverage, see the
> [API reference](https://metreeca.github.io/tile/modules/_metreeca_tile-data.html).

{TBD: usage overview and examples}

# Support

- open an [issue](https://github.com/metreeca/tile/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/metreeca/tile/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/metreeca/tile?tab=Apache-2.0-1-ov-file) file for details.
