# @metreeca/tile

Minimalist model-driven UI toolkit for linked data resources.

Preact components for [@metreeca/qest](https://github.com/metreeca/qest) linked data APIs. Resource models shared with
the server drive what screens show, what forms accept and how values are validated, so neither side restates them.

Screens are composed in JSX from linked data views and forms alongside the general-purpose widgets, layouts, contexts
and hooks of [@metreeca/clay](https://github.com/metreeca/clay). The [@metreeca/skin] design system is optional: Tile
and Clay components work without it and follow the platform colour scheme with it.

# Installation

```shell
npm install @metreeca/skin            # design system package, optional
npm install @metreeca/clay            # Preact contexts and hooks
npm install @metreeca/clay-<layer>    # Preact widgets and layouts, one package per layer
npm install @metreeca/tile            # Preact linked data store
npm install @metreeca/tile-<layer>    # Preact package, one per component layer
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

Add a binding package for each component layer an app assembles its screens from. Bindings render with Preact and take
it as a peer dependency: check the package README for what each one expects. The [@metreeca/skin] design system is
optional and styles whatever a binding renders. An app brands it by overriding its tokens, as its
[theming guide](https://github.com/metreeca/skin#theming) explains for colours, faces and every other family.

| Package               | Description                          |
|-----------------------|--------------------------------------|
| [@metreeca/tile-type] | Shape-driven value text              |
| [@metreeca/tile]      | Linked data store                    |
| [@metreeca/tile-lens] | Linked data views                    |
| [@metreeca/tile-form] | Linked data forms                    |

[@metreeca/skin]: https://metreeca.github.io/skin/

[@metreeca/tile-type]: https://metreeca.github.io/tile/modules/_metreeca_tile-type.html

[@metreeca/tile]: https://metreeca.github.io/tile/modules/_metreeca_tile.html

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
