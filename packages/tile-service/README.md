# @metreeca/tile-service

[![npm](https://img.shields.io/npm/v/@metreeca/tile-service)](https://www.npmjs.com/package/@metreeca/tile-service)

Preact contexts and hooks for @metreeca/tile interfaces.

A consumer reaches the ambient state a subtree inherits and the environment it runs in: the store and the settings an
app publishes once, and the accessors a component reads them back with. Nothing here renders, so what a component shows
stays a separate decision from what it is wired to.

# Installation

```shell
npm install preact                  # peer dependency
npm install @metreeca/tile-service  # this package
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

# Usage

| Module                            | Description                    |
|-----------------------------------|--------------------------------|
| [@metreeca/tile-service][service] | Preact contexts and hooks      |

[service]: https://metreeca.github.io/tile/modules/_metreeca_tile-service.index.html

# Support

- open an [issue](https://github.com/metreeca/tile/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/metreeca/tile/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/metreeca/tile?tab=Apache-2.0-1-ov-file) file for details.
