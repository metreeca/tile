# Core Modules

`src/store/index.core.ts` keeps the binding the store hooks are built on, an exception to the repository rule that a
core module carries no dependency on Preact: it holds a Preact hook moving resource and collection bindings through
the same states rather than a headless component, offers consumers nothing, and so is left out of the reference by
`typedoc.json` as well as blocked by the `"./*.core"` entry.
