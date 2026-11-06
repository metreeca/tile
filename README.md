# @metreeca/tile

Linked data UI toolkit for Preact.

Preact views and forms for [@metreeca/qest](https://github.com/metreeca/qest) linked data APIs. The
[@metreeca/blue](https://github.com/metreeca/blue) shapes shared with the server decide what a screen shows, what a
form accepts and when a value is valid, so neither side restates the model the other already holds.

Screens are composed in JSX from linked data views and forms, running within the contexts and hooks of
[@metreeca/clay](https://github.com/metreeca/clay). Views and forms bind to the resources of a
[@metreeca/keep](https://github.com/metreeca/keep) store, which keeps caching, batching and validation out of
interface code, so screens state what they present and the store settles how resources are exchanged.

Their look comes from the [@metreeca/skin] design tokens alone: components render without the skin stylesheet, and
follow the platform colour scheme once it is loaded, or whatever theme the app sets there instead.

# Installation

```shell
npm install @metreeca/skin            # design system stylesheet, optional
npm install @metreeca/clay            # contexts and hooks the store runs within
npm install @metreeca/tile            # linked data store and value types
npm install @metreeca/tile-widgets    # linked data views and facets
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

Add the widgets package where the app's screens show linked data, with the peer dependencies its README lists. An
app brands whatever Tile renders by overriding the [@metreeca/skin] tokens, as its
[theming guide](https://github.com/metreeca/skin#theming) explains for each family of tokens it defines.

| Package                  | Description                                    |
|--------------------------|------------------------------------------------|
| [@metreeca/tile]         | Linked data store and shape-driven value types |
| [@metreeca/tile-widgets] | Linked data widgets                            |
| [@metreeca/tile-charts]  | Linked data charts (planned)                   |
| [@metreeca/tile-topics]  | SKOS topic widgets (planned)                   |

[@metreeca/skin]: https://metreeca.github.io/skin/

[@metreeca/tile]: https://metreeca.github.io/tile/modules/_metreeca_tile.html

[@metreeca/tile-widgets]: https://metreeca.github.io/tile/modules/_metreeca_tile-widgets.html

[@metreeca/tile-charts]: https://metreeca.github.io/tile/modules/_metreeca_tile-charts.html

[@metreeca/tile-topics]: https://metreeca.github.io/tile/modules/_metreeca_tile-topics.html

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
