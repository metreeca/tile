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
`packages/tile-cell/`).

Resource shapes come from `@metreeca/blue` and queries from `@metreeca/qest`: this repository **NEVER** defines a
parallel model of its own, and a control offered for a property is decided by the shape describing it rather than by a
hand-written mapping.

Reads and writes go through a `@metreeca/keep` store: caching, batching and validation belong there, and this
repository **NEVER** reimplements them behind the interface.

# References

- [@metreeca/core](https://github.com/metreeca/core) - Core utilities and shared types, supplying the state primitives
  the headless components are built on
- [@metreeca/qest](https://github.com/metreeca/qest) - Foundations for client-driven, queryable REST/JSON APIs,
  supplying the query model the state components expose
- [@metreeca/blue](https://github.com/metreeca/blue) - Declarative blueprints for model-driven linked data processing,
  supplying the shapes that decide what an interface offers
- [@metreeca/keep](https://github.com/metreeca/keep) - Model-driven storage API, supplying the store the interface
  reads from and writes to
- [@metreeca/gate](https://github.com/metreeca/gate) - Zero-code model-driven endpoints for linked data resources, the
  server counterpart this layer talks to

# NPM Scripts

- **`npm run clean`** - Remove dependencies and build artefacts
- **`npm run prime`** - Install dependencies from the lockfile
- **`npm run setup`** - Configure for local development
- **`npm run build`** - Compile sources and generate docs
- **`npm run check`** - Run the test suite
- **`npm run proof`** - Build and serve docs

# Package Layout

The root `package.json` `workspaces` glob (`packages/*`) covers the framework packages, each in its own directory
immediately under `packages/` (for example `packages/tile-lens`).

Headless packages carry **NO** dependency on a rendering framework: Preact, and any other rendering layer added later,
appears **ONLY** in its own binding packages (`tile-data` for the contexts and hooks a component is wired to,
`tile-cell` and `tile-hive` for the leaf and container components it is assembled from, `tile-lens` and `tile-form` for
the views and editors built over them). A binding package adds observation and rendering over state it never redefines:
behaviour lives in framework-agnostic `@metreeca/core` state objects, so a second binding reaches the same behaviour
without restating it.

Packages are named after what they contribute, not after the library they contribute it with: `tile-data`, not
`tile-hooks`.

# Package Summaries

Every package states its summary in three places, which **MUST** be kept aligned:

- `packages/<package>/package.json` `description` - `<summary> for @metreeca/tile interfaces.`
- `packages/<package>/README.md`, first line after the badge - the same sentence, with `@metreeca/tile` linked to the
  project repository
- the root `README.md` package table - `<summary>` with the rendering layer left off, since the rows sit under prose
  that already states it (`Contexts and hooks`, not `Preact contexts and hooks`)

A package carrying a `src/index.ts` states it in a fourth place, that module's doc definition line, as `<summary>.`
without the family suffix. The file is **NEVER** added for the sake of the summary: it earns its place by holding the
surface the package's own modules are built out of, as `tile-cell` does for the props a widget declares. A package
with no such surface (`tile-hive`) declares no root entry point, and its `package.json` `exports` carries no `"."`
entry either. A root entry point **NEVER** re-exports the modules beside it: a screen takes the widgets it renders
from their own modules, and nothing else along with them.

Revising one **ALWAYS** means revising the others.

A package `README.md` **Usage** section opens with a note pointing at the API reference, then carries the real thing:
what a consumer has to know to put the package to work, stubbed as `{TBD: usage overview and examples}` until written.
The note links the root of the package reference,
`https://metreeca.github.io/tile/modules/_metreeca_<package>.html`, and **NEVER** the site root, a module page, or a
table of them: the catalogue grows with every module added, and the generated navigation already carries it. Usage
samples for a single module belong to that module's own documentation. The section **NEVER** stands in for the
generated index.

# Skills

These skills carry the conventions this repository is held to, whether they sit in `.claude/skills/` or have since
moved to the personal set. Each states the model it governs and what it takes precedence over, so the routing survives
the move:

| Skill              | When to activate                                                            |
|--------------------|-----------------------------------------------------------------------------|
| `preact-developer` | Writing or reviewing a widget, a hook or a custom element                   |
| `css-developer`    | Writing or reviewing a stylesheet, or introducing a token, colour or measure |
| `a11y-developer`   | Creating or revising a widget, or adding a role, `aria-*`, tabindex or keys  |

# Component State

A component holding state declares it as a `@metreeca/core` state object and adopts it with `useModel` from
`@metreeca/tile-data/model`, reading data and transitions straight off the model:

```tsx
const { labels, active, select } = useModel(() => createTabs({ labels: Object.keys(panels) }));
```

- A transition renders the component again on its own, so a handler just calls it; a transition changing nothing
  renders nothing, and a zero-argument one is passed straight as a handler.
- A transition starts from the state the render read and notifies asynchronously: two calls in one handler land where
  one does, and the data read alongside keeps the earlier value until the next render.
- The factory runs on the first render only, so the model keeps the props as they stood then: a prop changing later
  **NEVER** reaches it.
- Behaviour outgrowing a single widget moves to a sibling `*.pure.ts` module as a headless component of its own, leaving
  the widget only what it renders: `Tabs` in `tabs.tsx`, the state it adopts in `tabs.pure.ts`.

A `*.pure.ts` module is a headless component in its own right, **NEVER** an internal appendix of the widget beside it:
the suffix names what the module does without, which is a rendering layer, and **NEVER** claims anything about side
effects. It carries **NO** dependency on Preact, is tested without a DOM, and is documented and versioned like any
other module, since a second binding reaches the same behaviour by importing it. The generated reference leaves it out
for now, `typedoc.json` excluding `**/*.pure.ts`, so a published comment **NEVER** links into one. Internals stay in a
`*.core.ts` module, which the published surface never exposes.

A module handing out a third-party catalogue under names of its own keeps the bare re-exports in a sibling `*.pack.ts`
module, likewise left out of the reference by `typedoc.json`: the documented module beside it is the only path a
consumer imports, and carries the comment the catalogue is described by. `icon.ts` documents the `Icon` namespace it
hands out, `icon.pack.ts` names the glyph each role stands for.

A widget renders a `<tile-*>` custom element through `createElement`, with its rules in a sibling stylesheet the module
imports. The prefix is carried by the element, which the DOM requires to be hyphenated, and **NEVER** by the exported
component, which the module path already places: `Tabs` in `tabs.tsx`, rendering `<tile-tabs>` styled by `tabs.css`.

# Shared Utilities

Reach for `@metreeca/core` before writing a helper: its `state`, `strings`, `arrays` and `structures` entry points
already cover the state primitives alongside the common collection and value operations. A hand-rolled equivalent
duplicates tested code and drifts from it, missing the edge cases the shared one handles.

Keep a local helper only where the shared one genuinely doesn't fit, and record in its doc comment what the difference
is, so the next reader doesn't take it for an oversight.

# Testing

The root `vitest.config.ts` aliases all workspace `@metreeca/tile*` packages to their TypeScript source via regex, so
vitest transpiles directly from `src/` without requiring a prior build step. The resolver maps each `@metreeca/tile*`
specifier to `packages/<package>/src`; the aliases are convention-based and require no manual updates when adding
packages or subpath exports.

Headless state is tested without a DOM: a test that needs one belongs to a binding package, which supplies its own
environment.

# Version Management

All workspace packages share the root `package.json` version. Beyond the `version` fields the release flow already
cascades, update the internal `@metreeca/tile*` dependency ranges in every `packages/**/package.json` to match.

When adding, removing, or renaming packages, update the package table in the root `README.md` Usage section to match.
