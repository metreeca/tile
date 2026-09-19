# @metreeca/tile-form

[![npm](https://img.shields.io/npm/v/@metreeca/tile-form)](https://www.npmjs.com/package/@metreeca/tile-form)

Preact linked data editors for [@metreeca/tile](https://github.com/metreeca/tile) interfaces.

A consumer turns a described resource into an editable form: the shape decides which properties are offered, what each
one accepts and when a value is valid, so editing rules stay with the model rather than being restated per screen.

Validated changes are committed through the store the app publishes, sharing the caching, batching and validation the
rest of the stack relies on.

# Installation

```shell
npm install preact               # peer dependency
npm install @metreeca/tile-form  # this package
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

# Usage

| Module                      | Description                |
|-----------------------------|----------------------------|
| [@metreeca/tile-form][form] | Preact linked data editors |

[form]: https://metreeca.github.io/tile/modules/_metreeca_tile-form.index.html

# Support

- open an [issue](https://github.com/metreeca/tile/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/metreeca/tile/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/metreeca/tile?tab=Apache-2.0-1-ov-file) file for details.
