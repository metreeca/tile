# @metreeca/tile

Minimalist model-driven UI toolkit for linked data resources.

Preact components for [@metreeca/qest](https://github.com/metreeca/qest) linked data APIs. Resource models shared with
the server drive what screens show, what forms accept and how values are validated, so neither side restates them.

Screens are composed in JSX from linked data views and forms, bound to the resources of a
[@metreeca/keep](https://github.com/metreeca/keep) store. Components take their look from the [@metreeca/skin] design
tokens: they work without its stylesheet, and follow the platform colour scheme with it.

# Installation

```shell
npm install preact                  # peer dependency
npm install @metreeca/skin          # design system stylesheet, optional
npm install @metreeca/tile          # linked data store
npm install @metreeca/tile-<layer>  # one package per component layer
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

Add a package for each component layer an app assembles its screens from. The rendering layers take Preact as a peer
dependency: check the package README for what each one expects. An app brands whatever they render by overriding the
[@metreeca/skin] tokens, as its [theming guide](https://github.com/metreeca/skin#theming) explains for every family.

| Package               | Description             |
|-----------------------|-------------------------|
| [@metreeca/tile-type] | Shape-driven value text |
| [@metreeca/tile]      | Linked data store       |
| [@metreeca/tile-lens] | Linked data views       |
| [@metreeca/tile-form] | Linked data forms       |

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
