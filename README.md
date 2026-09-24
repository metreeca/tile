# Metreeca Tile

Minimalist model-driven UI toolkit for linked data resources.

**Metreeca Tile** provides specialised Preact components for working with linked data resources served by
[@metreeca/qest](https://github.com/metreeca/qest) APIs.

- **Model-Driven Data**: resource models shared by client and server drive data exchanges and validation, cutting
  the boilerplate usually required by both
- **Declarative Screens**: JSX composes general-purpose widgets and layouts with specialised linked data components,
  such as resource and collection viewers, search facets and property editors
- **Optional Design System**: design tokens theme every component according to the platform light or dark scheme,
  and can be left out without breaking any of them

# Installation

```shell
npm install @metreeca/tile            # design system package, optional
npm install @metreeca/tile-<layer>    # Preact package, one per component layer
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

Add a binding package for each component layer an app assembles its screens from. Bindings render with Preact and take
it as a peer dependency: check the package README for what each one expects. The design system package is optional and
styles whatever a binding renders.

| Package               | Description            |
|-----------------------|------------------------|
| [@metreeca/tile]      | Design system          |
| [@metreeca/tile-data] | Contexts and hooks     |
| [@metreeca/tile-cell] | Widgets and controls   |
| [@metreeca/tile-hive] | Layouts and containers |
| [@metreeca/tile-lens] | Linked data views      |
| [@metreeca/tile-form] | Linked data forms      |

[@metreeca/tile]: https://metreeca.github.io/tile/modules/_metreeca_tile.html

[@metreeca/tile-data]: https://metreeca.github.io/tile/modules/_metreeca_tile-data.html

[@metreeca/tile-cell]: https://metreeca.github.io/tile/modules/_metreeca_tile-cell.html

[@metreeca/tile-hive]: https://metreeca.github.io/tile/modules/_metreeca_tile-hive.html

[@metreeca/tile-lens]: https://metreeca.github.io/tile/modules/_metreeca_tile-lens.html

[@metreeca/tile-form]: https://metreeca.github.io/tile/modules/_metreeca_tile-form.html

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
