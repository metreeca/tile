# @metreeca/tile-move

[![npm](https://img.shields.io/npm/v/@metreeca/tile-move)](https://www.npmjs.com/package/@metreeca/tile-move)

Preact movable items and the move lifecycle for [@metreeca/tile](https://github.com/metreeca/tile) interfaces.

A consumer lets readers move things with the pointer, by touch or with the keyboard alike: cards across the cells of a
board, or items within and across sortable lists. Every move runs the same course,
picked up, carried, dropped and then waiting for the application to settle it, so a widget shows a move it has not yet
been told the outcome of, and puts back one the application refuses, without the consumer tracking any of it.

Screen readers are told in English where an item is picked up, carried and dropped, after the names a reader sees on
screen.

Gestures are performed by [dnd-kit](https://dndkit.com/), which this package alone depends on.

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
