# @metreeca/tile-lens

[![npm](https://img.shields.io/npm/v/@metreeca/tile-lens)](https://www.npmjs.com/package/@metreeca/tile-lens)

Preact linked data views for [@metreeca/tile](https://github.com/metreeca/tile) interfaces.

Views of resources and collections driven by shapes: the model decides which properties are shown, how each value
reads and how a collection is narrowed, so a model change reaches the interface with no view code to update.

Views read their data through the [@metreeca/tile](https://github.com/metreeca/tile) store the app provides, and take
their look from the [@metreeca/skin](https://metreeca.github.io/skin/) tokens an app restates for its brand.

# Installation

```shell
npm install @metreeca/tile-lens  # this package
npm install preact               # peer dependency
npm install lucide-preact        # peer dependency
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

# Usage

> [!NOTE]
>
> This section introduces essential concepts; for complete coverage, see the
> [API reference](https://metreeca.github.io/tile/modules/_metreeca_tile-lens.html).

{TBD: usage overview and examples}

# Support

- open an [issue](https://github.com/metreeca/tile/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/metreeca/tile/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/metreeca/tile?tab=Apache-2.0-1-ov-file) file for details.

The views draw their glyphs with [Lucide](https://lucide.dev/), licensed under ISC, with the icons derived from
[Feather](https://feathericons.com/) under MIT. An app distributing a build that includes the views must ship both
notices with it. The `LICENSE` file of the `lucide-preact` package carries them, ready to copy into a notice file.
