# @metreeca/tile-state

[![npm](https://img.shields.io/npm/v/@metreeca/tile-state)](https://www.npmjs.com/package/@metreeca/tile-state)

Headless query state components for model-driven linked data interfaces.

A consumer composes an interface from the query patterns it actually needs: a selection the user toggles, a filter over
a property, a range over a scalar, the options offered for a facet, a count, a collection page, a single resource. Each
pattern is a plain state object exposing the operations that make sense for it, leaving rendering entirely to the
caller.

The same state drives any rendering layer:
[@metreeca/tile-service](https://www.npmjs.com/package/@metreeca/tile-service) binds it to Preact components, and a
different binding reaches the same behaviour without restating it.

# Installation

```shell
npm install @metreeca/tile-state
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

# Usage

| Module                        | Description                     |
|-------------------------------|---------------------------------|
| [@metreeca/tile-state][state] | Headless query state components |

[state]: https://metreeca.github.io/tile/modules/_metreeca_tile-state.index.html

# Support

- open an [issue](https://github.com/metreeca/tile/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/metreeca/tile/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/metreeca/tile?tab=Apache-2.0-1-ov-file) file for details.
