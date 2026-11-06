# @metreeca/tile

[![npm](https://img.shields.io/npm/v/@metreeca/tile)](https://www.npmjs.com/package/@metreeca/tile)

Preact linked data store for [@metreeca/tile](https://github.com/metreeca/tile) interfaces.

The store an app shares with its screens, and the hooks that bind components to the resources and collections it holds.

Reads and writes go through a [@metreeca/keep](https://github.com/metreeca/keep) store over the app's fetch client, so
components never handle caching, batching or validation themselves, and stay focused on what they present.

# Installation

```shell
npm install preact          # peer dependency
npm install @metreeca/tile  # this package
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

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
