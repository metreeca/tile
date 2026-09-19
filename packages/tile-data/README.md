# @metreeca/tile-data

[![npm](https://img.shields.io/npm/v/@metreeca/tile-data)](https://www.npmjs.com/package/@metreeca/tile-data)

Preact contexts and hooks for [@metreeca/tile](https://github.com/metreeca/tile) interfaces.

A consumer reaches the ambient state a subtree inherits and the environment it runs in: the store and the settings an
app publishes once, and the accessors a component reads them back with. Nothing here renders, so what a component shows
stays a separate decision from what it is wired to.

The store a provider publishes comes from [@metreeca/keep](https://github.com/metreeca/keep), so caching, batching and
validation stay with the storage layer rather than being restated in the interface.

# Installation

```shell
npm install preact               # peer dependency
npm install @metreeca/tile-data  # this package
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

# Usage

> [!NOTE]
>
> This section introduces essential concepts; for complete coverage, see the API reference:
>
> | Module                             | Description               |
> |------------------------------------|---------------------------|
> | [@metreeca/tile-data][data]        | Preact contexts and hooks |
> | [@metreeca/tile-data/model][model] | Headless component state  |

[data]: https://metreeca.github.io/tile/modules/_metreeca_tile-data.index.html

[model]: https://metreeca.github.io/tile/modules/_metreeca_tile-data.model.html

{TBD: usage overview and examples}

# Support

- open an [issue](https://github.com/metreeca/tile/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/metreeca/tile/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/metreeca/tile?tab=Apache-2.0-1-ov-file) file for details.
