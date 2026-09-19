# @metreeca/tile-lens

[![npm](https://img.shields.io/npm/v/@metreeca/tile-lens)](https://www.npmjs.com/package/@metreeca/tile-lens)

Preact linked data views for [@metreeca/tile](https://github.com/metreeca/tile) interfaces.

A consumer renders a resource without writing a view for it: the shape describing the resource decides which properties
are shown and which control each one is shown through, so a model change reaches the interface without a matching
interface change.

What a view shows is read through the store the app publishes, sharing the caching, batching and validation the rest of
the stack relies on.

# Installation

```shell
npm install preact               # peer dependency
npm install @metreeca/tile-lens  # this package
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

# Usage

| Module                      | Description              |
|-----------------------------|--------------------------|
| [@metreeca/tile-lens][lens] | Preact linked data views |

[lens]: https://metreeca.github.io/tile/modules/_metreeca_tile-lens.index.html

# Support

- open an [issue](https://github.com/metreeca/tile/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/metreeca/tile/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/metreeca/tile?tab=Apache-2.0-1-ov-file) file for details.
