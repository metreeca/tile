# Core Modules

`src/index.core.ts` keeps the drag and drop bindings the widgets are built on, an exception to the repository rule
that a core module carries no dependency on Preact: it holds Preact hooks over dnd-kit rather than a headless
component, offers consumers nothing, and so is left out of the reference by `typedoc.json` as well as blocked by the
`"./*.core"` entry.
