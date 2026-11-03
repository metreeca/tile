# @metreeca/tile-move

[![npm](https://img.shields.io/npm/v/@metreeca/tile-move)](https://www.npmjs.com/package/@metreeca/tile-move)

Preact movable items and the move lifecycle for [@metreeca/tile](https://github.com/metreeca/tile) interfaces.

Drag and drop for cards across board cells and items within and across sortable lists, by pointer, touch or keyboard.

A widget shows a pending move until the app settles it and puts back a move the app refuses, with no state to track.
Moves are announced to screen readers in English, using the names shown on screen.

Gestures run on [dnd-kit](https://dndkit.com/), which stays internal: consumers never import it.

# Installation

```shell
npm install preact               # peer dependency
npm install @metreeca/tile-move  # this package
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

# Usage

> [!NOTE]
>
> This section introduces essential concepts; for complete coverage, see the
> [API reference](https://metreeca.github.io/tile/modules/_metreeca_tile-move.html).

{TBD: usage overview and examples}

# Support

- open an [issue](https://github.com/metreeca/tile/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/metreeca/tile/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/metreeca/tile?tab=Apache-2.0-1-ov-file) file for details.
