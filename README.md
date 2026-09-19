# Metreeca Tile

Model-driven user interfaces for queryable linked data APIs.

**Metreeca Tile** is the user interface counterpart of the Metreeca model-driven stack: the same shapes that describe a
resource on the server ([@metreeca/blue](https://github.com/metreeca/blue)) and the same queries a client sends to it
([@metreeca/qest](https://github.com/metreeca/qest)) drive what the interface shows, what the user can narrow, and what
is written back.

- **Headless State**: the query patterns an interface is built from (selections, filters, ranges, options, counts,
  collections, resources), each a plain state object with no rendering attached
- **Framework Bindings**: rendering-layer adapters wiring the headless state into components; the state itself stays
  framework-agnostic
- **Model-Driven**: the shape of a resource decides the controls offered for it, so a model change reaches the interface
  without a matching interface change
- **Live Data**: reads and writes go through a [@metreeca/keep](https://github.com/metreeca/keep) store, sharing the
  caching, batching and validation the rest of the stack relies on

# Installation

```shell
npm install @metreeca/tile-state   # headless query state components
npm install @metreeca/tile-react   # React bindings
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

Install the state package, then add the binding package for the rendering framework in use.

| Package                | Description                      |
|------------------------|----------------------------------|
| [@metreeca/tile-state] | Headless query state components  |
| [@metreeca/tile-react] | React bindings for headless state |

[@metreeca/tile-state]: https://metreeca.github.io/tile/modules/_metreeca_tile-state.html

[@metreeca/tile-react]: https://metreeca.github.io/tile/modules/_metreeca_tile-react.html

# Usage

> [!NOTE]
>
> Each package documents its own API in its README and API reference; for complete coverage, see the
> [API reference](https://metreeca.github.io/tile/).

# Support

- open an [issue](https://github.com/metreeca/tile/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/metreeca/tile/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/metreeca/tile?tab=Apache-2.0-1-ov-file) file for details.
