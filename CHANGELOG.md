# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unpublished](https://github.com/metreeca/tile/compare/v0.0.0...HEAD)

### Fixed

- Ship the compiled package: publishing packed the repository root, delivering raw TypeScript sources, demo, docs and
  workflow files instead of the build output.
- Limit publishing to `@metreeca/tile`: the release scripts also emitted `@metreeca/core`, `@metreeca/data`,
  `@metreeca/mesh` and `@metreeca/view` under the shared version, claiming names owned by other packages.
