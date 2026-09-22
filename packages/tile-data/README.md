# @metreeca/tile-data

[![npm](https://img.shields.io/npm/v/@metreeca/tile-data)](https://www.npmjs.com/package/@metreeca/tile-data)

Preact contexts and hooks for [@metreeca/tile](https://github.com/metreeca/tile) interfaces.

A consumer reaches what the app states about itself, the ambient services a subtree inherits, the accessors a component
reads them back with, and the adoption of a headless state object as the state of a component. Nothing here renders, so
what a component shows stays a separate decision from what it is wired to.

The shared fetch client an app publishes once is a plain `fetch` function, so a deployment hands over one of its own:
[@metreeca/http](https://github.com/metreeca/http) provides composable middlewares covering authentication, caching and
uniform failure reporting, keeping those concerns with the transport layer rather than restating them in the interface.

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
