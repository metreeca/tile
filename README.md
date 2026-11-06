# @metreeca/tile

Linked data UI toolkit for Preact.

Preact views and forms for [@metreeca/qest](https://github.com/metreeca/qest) linked data APIs. The
[@metreeca/blue](https://github.com/metreeca/blue) shapes shared with the server decide what a screen shows, what a
form accepts and when a value is valid, so neither side restates the model the other already holds.

Screens are composed in JSX and bound to the resources of a [@metreeca/keep](https://github.com/metreeca/keep) store,
which keeps caching, batching and validation out of interface code. Their look comes from the [@metreeca/skin] design
tokens alone: components render without the skin stylesheet, and follow the platform colour scheme once it is loaded.

# Installation

```shell
npm install @metreeca/skin            # design system stylesheet, optional
npm install @metreeca/tile            # linked data store
npm install @metreeca/tile-<package>  # one per package the app takes up
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

Add the views, forms and value text the app's screens need, each from its own package, with the peer dependencies its
README lists. An app brands whatever Tile renders by overriding the [@metreeca/skin] tokens, as its
[theming guide](https://github.com/metreeca/skin#theming) explains for each family of tokens it defines.

| Package               | Description             |
|-----------------------|-------------------------|
| [@metreeca/tile]      | Linked data store       |
| [@metreeca/tile-type] | Shape-driven value text |
| [@metreeca/tile-lens] | Linked data views       |
| [@metreeca/tile-form] | Linked data forms       |

[@metreeca/skin]: https://metreeca.github.io/skin/

[@metreeca/tile]: https://metreeca.github.io/tile/modules/_metreeca_tile.html

[@metreeca/tile-type]: https://metreeca.github.io/tile/modules/_metreeca_tile-type.html

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
