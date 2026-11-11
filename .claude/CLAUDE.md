> [!CAUTION]
>
> - **ONLY** modify code when explicitly requested or clearly required.
> - **NEVER** make unsolicited changes or revert **unrelated** user edits.
> - **ALWAYS** monitor IDE diagnostics when working on a file

> [!CAUTION]
> Activating and following skill guidance is **MANDATORY** for every task. Before starting any work, identify and
> activate all relevant skills. Skill instructions are binding and override default behaviours. When in doubt about
> whether skill guidance is current, relevant skills MUST be reloaded.

# Overview

Metreeca Tile is the user interface layer of the Metreeca model-driven stack: it turns the shapes and queries the rest
of the stack already speaks into what an interface shows, narrows and writes back. The monorepo collects the headless
state packages and the rendering-layer bindings, each sitting directly under `packages/` (for example
`packages/tile-widgets/`).

Resource shapes come from `@metreeca/blue` and queries from `@metreeca/qest`: this repository **NEVER** defines a
parallel model of its own, and a control offered for a property is decided by the shape describing it rather than by a
hand-written mapping.

Reads and writes go through a `@metreeca/keep` store: caching, batching and validation belong there, and this
repository **NEVER** reimplements them behind the interface.

What an interface draws rests on Preact and the `@metreeca/skin` design system, running within the `@metreeca/clay`
toolkit: Tile adds the linked data layer over the general-purpose contexts and hooks Clay provides, and **NEVER**
restates them.

# References

- [Preact](https://preactjs.com/guide/v10/getting-started) - Fast 3kB alternative to React with the same API, the
  rendering layer every binding package renders with and takes as a peer dependency
- [@metreeca/core](https://github.com/metreeca/core) - Core utilities and shared types, providing the state primitives
  the headless components are built on
- [@metreeca/clay](https://github.com/metreeca/clay) - Minimalist UI toolkit for Preact, providing the fetch,
  routing, board and model hooks the bindings are wired to
- [@metreeca/http](https://github.com/metreeca/http) - Composable middleware for the standard fetch API, providing the
  client the store exchanges resources through
- [@metreeca/qest](https://github.com/metreeca/qest) - Foundations for client-driven, queryable REST/JSON APIs,
  providing the query model the state components expose
- [@metreeca/blue](https://github.com/metreeca/blue) - Declarative blueprints for model-driven linked data processing,
  providing the shapes that decide what an interface offers
- [@metreeca/keep](https://github.com/metreeca/keep) - Model-driven storage API, providing the store the interface
  reads from and writes to
- [@metreeca/gate](https://github.com/metreeca/gate) - Zero-code model-driven endpoints for linked data resources, the
  server counterpart this layer talks to
- [@metreeca/skin](https://github.com/metreeca/skin) - Essential design tokens and styles, providing the token contract
  and the stylesheet every component sheet reads from

# NPM Scripts

- **`npm run clean`** - Remove dependencies and build artefacts
- **`npm run prime`** - Install dependencies from the lockfile
- **`npm run setup`** - Configure for local development
- **`npm run build`** - Compile sources and generate docs
- **`npm run check`** - Run the test suite
- **`npm run proof`** - Build and serve docs
- **`npm run watch`** - Serve the specimen page with live reload

> [!CAUTION]
> The specimen dev server is normally already running, picking up edits through live reload. **NEVER** start, restart
> or stop a dev server: check visual changes against the running one, and where it is down, ask the user to start it.
>
> Several Vite servers may run side by side (other apps built on Tile among them), so the specimen holds **NO** fixed
> port: `5173` may well serve another app. Before checking anything, list the listening ports
> (`lsof -iTCP -sTCP:LISTEN -P`) and pick the one whose page is titled `Metreeca/Tile`; the facets are under
> `/tile-widgets/`.

# Package Layout

The root `package.json` `workspaces` glob (`packages/*`) covers the framework packages, each in its own directory
immediately under `packages/` (for example `packages/tile-widgets`).

A package compiles against its siblings through their `dist`, so each `tsconfig.build.json` is `composite` and names
those siblings under `references`, and the package `build` runs `tsc -b`: the compiler settles the order and brings a
stale sibling up to date first, whatever order the workspaces are visited in. A package added here declares a
reference for every `@metreeca/tile*` dependency it takes, or it compiles against whatever its sibling last left
behind. The build is incremental, its cache being the `tsconfig.build.tsbuildinfo` each package's `clean` removes
alongside `dist`: deleting `dist` by hand leaves that cache claiming the outputs are current, and the next build
emits nothing.

Headless packages carry **NO** dependency on a rendering framework: Preact, and any other rendering layer added later,
appears **ONLY** in its own binding packages (`tile` for the store bindings a component is wired to, `tile-widgets`
for the lenses, facets and fields built over them). A binding package adds observation and rendering over
state it never redefines: behaviour lives in framework-agnostic `@metreeca/core` state objects, so a second binding
reaches the same behaviour without restating it.

A binding package styles what it draws through the `@metreeca/skin` tokens, so the interface follows whatever theme an
app sets there. A general-purpose context or hook a binding package needs belongs to `@metreeca/clay`, **NEVER** to a
Tile package.

> [!CAUTION]
> Every sheet here is built on `@metreeca/skin`: activate `css-developer` before touching one. Its `skin`, `meaning`,
> `palettes` and `viewports` task skills carry the design system discipline and vocabularies a Tile widget follows.

## Package Distribution

A package boundary is drawn only where it spares a consumer something: an install, a peer dependency, or a release to
track. Bundle weight never justifies a split, since every module keeps its own subpath export and an app bundles only
what it imports.

- **Store apart**: `tile` holds the store, the resource and collection bindings, the value types and the headless
  state they adopt, and is the only package taking the `@metreeca/keep` stack; every other package builds on it
- **One widget package**: lenses, facets and fields share `tile-widgets` whatever their role. They share one stack,
  and fields reuse what lenses draw, so a split by role spares nobody an install and forces a placement call on every
  new widget. Within the package, each role takes a folder of its own: `lenses` for the widgets presenting a resource,
  a collection being the property of the resource holding it (the sense Fresnel gives the word), `facets` for the
  widgets narrowing a collection, and `fields` for the widgets writing resources back, while the parts they draw alike
  stay at the package root. Prose keeps to the same terms: a lens presents, a facet narrows, a field writes, and
  *widget* names any of them. Folders **NEVER** appear in
  import paths: `exports` lists every module, and its stylesheet, as a flat subpath (`@metreeca/tile-widgets/tally`),
  so module names stay unique across folders and a module added to a folder is reachable only once listed there
- **Heavy stacks apart**: a module group gets a package of its own when it is the only reason its neighbours would
  install a third-party stack, as `tile-charts` does for its plotting and mapping engines
- **Vocabularies apart**: widgets bound to a domain vocabulary rather than to any shape get a package of their own,
  as `tile-topics` does for SKOS concept schemes, so apps that never use the vocabulary never track its releases
- **Stubs private**: a package laid down ahead of its widgets carries a doc-only root module and `"private": true`
  until it holds an API, so it compiles and is documented as planned, but cannot be published empty

A package holding a collection takes a plural name (`tile-widgets`), and one holding a single capability takes the
name of that capability. Packages are named after what they contribute, never after the library they contribute it
with.

# Package Summaries

Every package states its summary in three places, which **MUST** be kept aligned:

- `packages/<package>/package.json` `description` - `<summary> for @metreeca/tile.`
- `packages/<package>/README.md`, first line after the badge - the same sentence, with `@metreeca/tile` linked to the
  project repository
- the root `README.md` package table - `<summary>` with the rendering layer left off, since the rows sit under prose
  that already states it (`Linked data widgets`, not `Preact linked data widgets`)

The suffix names the project repository as `@metreeca/tile`, for every package alike.

A package carrying a `src/index.ts` states it in a fourth place, that module's doc definition line, as `<summary>.`
without the family suffix. The file is **NEVER** added for the sake of the summary: it earns its place by holding the
surface the package's own modules are built out of, as `tile` does for the store every binding reads from. A package
with no such surface declares no root entry point, and its `package.json` `exports` carries no `"."` entry either. A
root entry point **NEVER** re-exports the modules beside it: a screen takes the widgets it renders from their own
modules, and nothing else along with them.

Revising one **ALWAYS** means revising the others.

A package `README.md` **Usage** section opens with a note pointing at the API reference, then carries the real thing:
what a consumer has to know to put the package to work, stubbed as `{TBD: usage overview and examples}` until written.
The note links the root of the package reference,
`https://metreeca.github.io/tile/modules/_metreeca_<package>.html`, and **NEVER** the site root, a module page, or a
table of them: the catalogue grows with every module added, and the generated navigation already carries it. Usage
samples for a single module belong to that module's own documentation. The section **NEVER** stands in for the
generated index.

# Design Precedent

[Atlassian](https://atlassian.design/) is the design system Tile is closest to. Check it before settling a component
contract or a theming question:

- A **component question** goes to the [Forge UI Kit](https://developer.atlassian.com/platform/forge/ui-kit/components/)
  for how a component surface is cut, and to the design system for the behaviour a component owes
- A **theming question** goes to the [token layer](https://atlassian.design/foundations/tokens): where upstream solves a
  variant through tokens, a Tile component solving it through props is a tell worth questioning

Upstream precedent is an argument, never a mandate. Tile is shape-driven: where a control is decided by the shape
describing a property, an Atlassian page describing a hand-wired mapping does not transfer. Ideas travel freely, while
prose, tables and figures stay upstream: link them, never reproduce them, and write whatever is borrowed in the
Metreeca register.

# Component State

A component holding state declares it as a `@metreeca/core` state object and adopts it with `useModel` from
`@metreeca/clay/model`, reading data and transitions straight off the model:

```tsx
const { open, expand, collapse, configure } = useModel(() => createFold());
```

- A transition renders the component again on its own, so a handler just calls it; a transition changing nothing
  renders nothing, and a zero-argument one is passed straight as a handler.
- A transition starts from the state the render read and notifies asynchronously: two calls in one handler land where
  one does, and the data read alongside keeps the earlier value until the next render.
- The factory runs on the first render only, so the model keeps the props as they stood then: a prop changing later
  **NEVER** reaches it, unless it is listed as a dependency. A model created from props lists them, and is created
  again from the factory whenever one changes, losing the state it reached:

  ```tsx
  const options = useModel(() => createTally({ size }), [entry, field, expression, size]); // a new query starts over
  ```
- Behaviour outgrowing a single widget or hook moves to a sibling `*.core.ts` module as a headless component of its
  own, leaving the module beside it only what it renders or binds: `useTally` in `tally.ts`, the state it adopts in
  `tally.core.ts`.

A `*.core.ts` module carries what the module beside it is built on. Where that is behaviour, the module is a headless
component in its own right and **NEVER** an internal appendix of the widget: it carries **NO** dependency on Preact, is
tested without a DOM, and is documented and versioned like any other module.

A `*.core.ts` module is **NEVER** exported: every package `exports` blocks the `.core` subpaths with a `"./*.core": null`
entry, so a consumer meets its types only through the published signatures naming them. The generated reference still
carries it like any other module, a type declared there being public wherever a published signature names it: TypeDoc
drops a symbol whose module is excluded, re-exported or not, so excluding these would leave a public type undocumented.

A binding package whose widgets draw the same parts alike keeps them in an `index.tsx` module: it holds rendering,
never behaviour, offers consumers nothing, and so is left out of the reference by `typedoc.json` and blocked by a
`"./index": null` entry, the package declaring no root entry point. Its rules sit in the package `index.css`
stylesheet, which the module imports. `tile-widgets` keeps there the parts its widgets draw alike, and the fold state they
adopt in `index.core.ts`.

A widget renders a `<tile-*>` custom element through `createElement`, with its rules in a sibling stylesheet the module
imports. The prefix is carried by the element, which the DOM requires to be hyphenated, and **NEVER** by the exported
component, which the module path already places: `Table` in `table.tsx`, rendering `<tile-table>` styled by
`table.css`.

# Shared Utilities

Reach for `@metreeca/core` before writing a helper: its `state`, `strings`, `arrays` and `structures` entry points
already cover the state primitives alongside the common collection and value operations. A hand-rolled equivalent
duplicates tested code and drifts from it, missing the edge cases the shared one handles.

Keep a local helper only where the shared one genuinely doesn't fit, and record in its doc comment what the difference
is, so the next reader doesn't take it for an oversight.

# Immutable Results

Every object or array a public API hands out, hook results, tuples and context values included, **MUST** be passed
through `immutable()` from `@metreeca/core/values`, so a consumer can never change state it does not own. Values taken
from outside, such as parsed JSON or a caller's initial value, are frozen too before they are handed back; an array
rebuilt by a transition is frozen anew, while one left unchanged keeps its identity so the context renders nothing.

# Testing

The root `vitest.config.ts` resolves imports of symlinked `@metreeca/*` packages, both workspace packages and siblings
linked by `npm run setup`, to the TypeScript source their `@metreeca/source` export entries declare, so tests run
against `src/` without a prior build. Packages installed from the registry keep resolving to their published `dist`.
An export entry lacking the condition falls back to `dist` as well, and tests then see that package as last built.

> [!CAUTION]
> **NEVER** enable `@metreeca/source` through vitest `resolve.conditions`. Published manifests carry the condition
> while their packages ship no `src/`, and Vite does not fall back to `default` on a missing target, so a global
> condition breaks every package installed from the registry that declares it, as happens under `npm ci` in CI.

Headless state is tested without a DOM: a test that needs one belongs to a binding package, which supplies its own
environment.

> [!IMPORTANT]
> The DOM environment comes from the package `check` script (`--environment happy-dom`), **NOT** from the root
> `vitest.config.ts`. A bare `npx vitest run <path>`, from the root or from the package alike, runs DOM tests without
> one and fails every test on `ReferenceError: document is not defined`. Run selected tests from the package directory
> with the flags its `check` script passes:
>
> ```shell
> cd packages/tile-widgets
> npx vitest --config ../../vitest.config.ts --root . --environment happy-dom run src/facets/tally.test.ts
> ```

# Version Management

All workspace packages share the root `package.json` version. Beyond the `version` fields the release flow already
cascades, update the internal `@metreeca/tile*` dependency ranges in every `packages/**/package.json` to match, and
in `specimen/package.json` as well: the specimen is a self-standing app outside the workspaces, with its own lockfile
and its own `setup` linking the local checkouts, so the release flow never reaches its ranges on its own.

When adding, removing, or renaming packages, update the package table in the root `README.md` Usage section to match.
