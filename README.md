# Metreeca Tile

Model-driven user interfaces for queryable linked data APIs.

**Metreeca Tile** drives interface components from the shapes and queries a
[@metreeca/qest](https://github.com/metreeca/qest) API already defines. Behaviour lives in state a component only
observes, so the same screen logic serves any rendering layer.

- **Preact Bindings**: the contexts and hooks a component is wired to, the widgets, layouts and containers it is
  assembled from, and the views and editors built over them; the state itself stays framework-agnostic
- **Model-Driven**: the shape of a resource decides the controls offered for it, so a model change reaches the interface
  without a matching interface change
- **Live Data**: reads and writes go through a [@metreeca/keep](https://github.com/metreeca/keep) store, sharing the
  caching, batching and validation the rest of the stack relies on
- **Design System**: an optional token layer styling whatever a binding renders; components stay usable without it, both
  sides honouring the same token naming contract

# Installation

```shell
npm install @metreeca/tile-<binding>  # Preact binding package, one per component layer
npm install @metreeca/tile-skin       # design system package, optional
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

Add a binding package for each component layer an app assembles its screens from. Bindings render with Preact and take
it as a peer dependency: check the package README for what each one expects. The design system package is optional and
styles whatever a binding renders. The bindings bring in `@metreeca/tile` themselves: an app installs it directly only
where it reaches on its own for what it states about itself or for what its own components are built out of.

| Package               | Description                 |
|-----------------------|-----------------------------|
| [@metreeca/tile]      | Metadata and element wiring |
| [@metreeca/tile-data] | Contexts and hooks          |
| [@metreeca/tile-cell] | Widgets and controls        |
| [@metreeca/tile-hive] | Layouts and containers      |
| [@metreeca/tile-lens] | Linked data views           |
| [@metreeca/tile-form] | Linked data editors         |
| [@metreeca/tile-skin] | Design system               |

[@metreeca/tile]: https://metreeca.github.io/tile/modules/_metreeca_tile.html

[@metreeca/tile-data]: https://metreeca.github.io/tile/modules/_metreeca_tile-data.html

[@metreeca/tile-cell]: https://metreeca.github.io/tile/modules/_metreeca_tile-cell.html

[@metreeca/tile-hive]: https://metreeca.github.io/tile/modules/_metreeca_tile-hive.html

[@metreeca/tile-lens]: https://metreeca.github.io/tile/modules/_metreeca_tile-lens.html

[@metreeca/tile-form]: https://metreeca.github.io/tile/modules/_metreeca_tile-form.html

[@metreeca/tile-skin]: https://metreeca.github.io/tile/modules/_metreeca_tile-skin.html

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
