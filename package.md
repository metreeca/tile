
# Tile

- (?) accessibility
- (?) p/react

- headless components
  - own the behaviour a linked data interface needs: what a shape offers, how a query narrows, what a write commits
  - exposed as core states, so the same behaviour serves any rendering layer without being restated per binding
  - no markup, no DOM, no styling: nothing that ties the behaviour to a renderer
- un/styled react components
  - observe the states and supply the minimum markup that makes them usable
  - structural styling
    - only what the component needs to work: positioning, stacking, overflow, focus affordances
    - no visual opinion: colour, type and spacing scale are left to whoever styles the app
  - (conditionally) styled if the design system is included
    - wiring is silent: hooks resolve against Skin tokens through the cascade, with no adapter, provider or flag
    - dependency stays one-way and optional: Skin carries no linked data knowledge, Tile imports nothing from Skin
    - the real deliverable is the token and class naming contract both sides honour, since that is what makes the
      silence work
    - without Skin an app still gets working, plainly structured components
