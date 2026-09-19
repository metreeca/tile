# @metreeca/tile-cell

[![npm](https://img.shields.io/npm/v/@metreeca/tile-cell)](https://www.npmjs.com/package/@metreeca/tile-cell)

Preact widgets and controls for [@metreeca/tile](https://github.com/metreeca/tile) interfaces.

A consumer populates a screen with the widgets a value is shown and edited through: labels, icons, buttons, fields and
the like. Behaviour comes from the state a widget observes, so what it does stays a separate decision from what it looks
like.

Styling is structural only: what a widget needs to work, with colour, type and spacing left to
[@metreeca/tile](https://www.npmjs.com/package/@metreeca/tile) or to whoever styles the app.

# Installation

```shell
npm install preact               # peer dependency
npm install @metreeca/tile-cell  # this package
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

# Usage

| Module                      | Description                 |
|-----------------------------|-----------------------------|
| [@metreeca/tile-cell][cell] | Preact widgets and controls |

[cell]: https://metreeca.github.io/tile/modules/_metreeca_tile-cell.index.html

# Support

- open an [issue](https://github.com/metreeca/tile/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/metreeca/tile/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/metreeca/tile?tab=Apache-2.0-1-ov-file) file for details.
