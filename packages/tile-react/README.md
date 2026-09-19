# @metreeca/tile-react

[![npm](https://img.shields.io/npm/v/@metreeca/tile-react)](https://www.npmjs.com/package/@metreeca/tile-react)

React bindings for [@metreeca/tile-state](https://www.npmjs.com/package/@metreeca/tile-state).

A consumer renders the headless query state as React components: the state object decides what the interface can do,
this package decides how a React tree observes it and re-renders when it changes. Swapping a rendering layer leaves the
state and its behaviour untouched.

# Installation

```shell
npm install react                 # peer dependency
npm install @metreeca/tile-react  # this package
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

# Usage

| Module                        | Description                               |
|-------------------------------|-------------------------------------------|
| [@metreeca/tile-react][react] | React bindings for headless query state   |

[react]: https://metreeca.github.io/tile/modules/_metreeca_tile-react.index.html

# Support

- open an [issue](https://github.com/metreeca/tile/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/metreeca/tile/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/metreeca/tile?tab=Apache-2.0-1-ov-file) file for details.
