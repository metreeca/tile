# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.0](https://github.com/metreeca/tile/compare/v0.6.1...HEAD)

### Added

- `@metreeca/tile-type` — new package of shape-driven value types, showing a stored value to a reader, handing it to
  a native input and reading back what the input yields, with `toType` picking the default type for a shape
- `@metreeca/tile-data/store` — collection lenses sharing one collection across a screen: `useMembers` growing the
  items a batch at a time, `useActions` adding and removing them, `useCount`, `useKeywords`, `useTally` and `useRange`
  narrowing them, and `useQuery` keeping the page criteria in the browser location
- `@metreeca/tile-data/store` — `scope` criteria on `useCollection`, fixing which items a collection holds beyond the
  reach of the reader: every lens retrieves under them, and clearing the collection keeps them in place
- `@metreeca/tile-data/asset` — `useAsset` retrieving a static asset such as a Markdown guide by its path alone, in
  the media type its extension names, and dropping the previous text as soon as the path changes
- `@metreeca/tile-lens` — `Frame` resource frame, `Table` collection table, `Tally` and `Range` facets, `Clear`
  collection reset and `Count` collection counter
- `@metreeca/tile-cell` — `Markdown` document, `Toc` table of contents and `Path` breadcrumb trail, disclosure
  states on `Button` (`expanded`, `controls`), query entries on links, and the `Icon.Reset` and `Icon.Options` glyph
  roles
- `@metreeca/tile-hive` — `Card` resource summary and `Info` property panel, wrapping long values in the body of a
  page and keeping them to one line in a sidebar
- `@metreeca/tile` — `css.tint` washing a colour token out into a surface fill
- `@metreeca/tile` — `colorLink` and `colorLinkHover` link colours, in the hue of the subtle accent at a lightness of
  their own, so links hold AA contrast whatever the brand supplies
- `@metreeca/tile-cell/markdown` — image width hints, so `chart.png#50` sets a picture at half the width of its block
- `@metreeca/tile` — an image standing alone in a paragraph reads as a figure, centred and scaled down to the measure

### Changed

- Upgrade `@metreeca/blue` to `^0.13.1`
- Upgrade `@metreeca/keep` and `@metreeca/keep-rest` to `^0.12.2`
- `@metreeca/tile-data/store` — **breaking**: `useCollection` binds a screen to the collection held by a resource,
  shared by every lens on it, rather than retrieving items (migration: retrieve items through `useMembers`)
- `@metreeca/tile-lens/sheet` — **breaking**: `Sheet` renders the items of a `members` relay handed by `useMembers`
  in place of the `entry`, `shape` and `model` props
- `@metreeca/tile` — **breaking**: text is set on two weights, regular and strong, and the `fontWeightHeavy` token is
  removed (migration: use `fontWeightStrong`)
- `@metreeca/tile` — top-level headings stand further off the text preceding them, and a table closing on a column with
  an empty header gives that column the room the others leave, keeping the leading ones as narrow as their content
- `@metreeca/tile` — text is set with greyscale antialiasing on macOS, reading lighter at the same weights
- `@metreeca/tile` — inline code sits on a tint of its own ink at close to the size of the text around it, and table
  text is set at the size of the body copy rather than the small size, matching the prose it sits in
- `@metreeca/tile-cell/icon` — `Icon.Clear` is drawn as a plain cross, the circled one moving to `Icon.Reset`
- `@metreeca/tile-cell/link` — `strong` links take the link colour, and `subtle` and `strong` links are underlined
  under the pointer; every link draws its underline within the line, so containers clipping their content keep it
- `@metreeca/tile-hive/tabs` — tab labels, and the menu standing in for them where they would not fit, sit closer to
  the rule closing off the strip

### Fixed

- `@metreeca/tile` — code in a preformatted block keeps its line breaks rather than running onto a single line
- `@metreeca/tile-cell` — subtle links give hover feedback, and the logo mark is centred on the capitals beside it
- `@metreeca/tile-hive/toast` — toast marks set further apart from their message
- `@metreeca/tile-hive/shell` — the waiting mark stands over the control it replaces, so the header end holds still

### Security

- Upgrade the `vitest` development dependency to `^5.0.3`, fixing GHSA-xp26-3454-mjgp and GHSA-qxg6-89mg-rqv8 in
  the test tooling; published packages are not affected
- Upgrade the `happy-dom` development dependency to `^21.0.4`, fixing GHSA-834v-8h66-3h79 in the DOM environment the
  test suites run on; published packages are not affected, as `happy-dom` never reaches their consumers

## [0.6.1](https://github.com/metreeca/tile/compare/v0.6.0...v0.6.1) - 2026-10-21

### Security

- Upgrade the `vite` development dependency to `^8.3.5`, fixing GHSA-587h-7wmj-h5pm, GHSA-r825-w8mm-5pxw and
  GHSA-698v-4r3x-3vcv in the build and specimen tooling; published packages are not affected
- Upgrade the `markdown-it` documentation tooling dependency to `14.3.3`, fixing GHSA-gfr2-rv44-r23c and
  GHSA-vfgh-jcmw-g37q in the API reference build; published packages are not affected

## [0.6.0](https://github.com/metreeca/tile/compare/v0.5.1...v0.6.0) - 2026-10-20

### Changed

- Upgrade `@metreeca/blue` to `^0.13.0`
- Upgrade `@metreeca/core` to `^0.13.0`
- Upgrade `@metreeca/http` to `^0.5.0`
- Upgrade `@metreeca/keep` to `^0.12.0`
- Upgrade `@metreeca/keep-rest` to `^0.12.0`
- Upgrade `@metreeca/qest` to `^0.13.0`

## [0.5.1](https://github.com/metreeca/tile/compare/v0.5.0...v0.5.1) - 2026-10-14

### Fixed

- `@metreeca/tile-cell/icon` — glyph sizing kept in production bundles, which dropped the icon stylesheet and left
  glyphs at the oversized Lucide defaults wherever `Icon` was imported, toasts and the shell included

## [0.5.0](https://github.com/metreeca/tile/compare/v0.4.0...v0.5.0) - 2026-10-14

### Added

- `@metreeca/tile-hive/guard` — `Guard` failure boundary showing a fallback in place of a component that failed to
  render, and raising the failure on the shared board while the rest of the screen keeps working
- `@metreeca/tile-hive/toast` — bug glyph marking `defect` posts, painted on the fail step like ordinary failures

### Changed

- `@metreeca/tile-data/board` — **breaking**: `Status` gains a `defect` member for faults of the interface itself,
  and `raise` posts errors and any other value that is not problem details as a `defect` instead of a `failure`
  (migration: add a `defect` branch to every exhaustive `switch` over `Status`, and match `"defect"` wherever raised
  issues are picked out by `status === "failure"`, since broken scripts and failed renders now reach the board so)
- `@metreeca/tile-data/board` — only the outermost `Board` takes up broken scripts and unhandled rejections, so a
  page issue is stated once however many boards are nested, while each board keeps the posts of its own components
- `@metreeca/tile-cell` — no longer depends on `@metreeca/http`, which none of its modules imports

## [0.4.0](https://github.com/metreeca/tile/compare/v0.3.0...v0.4.0) - 2026-10-14

### Added

- `@metreeca/tile-move` — new package of movable items: `Placeable` card boards moving cards between grid cells and
  `Sortable` lists reordering items within and across lists, dragged by a grip or by their whole surface with the
  pointer, by touch or with the keyboard, with moves handed to `onMove` and dropped items gliding into place
- `@metreeca/tile-data/board` — shared status board (`Board`, `useBoard`, `usePosts`) collecting posts by status and
  raising failures as posts
- `@metreeca/tile-data/storage` — `useStorage` hook binding a component to a Web Storage entry
- `@metreeca/tile-data/model` — `useModel` takes a dependency list and creates the model again whenever a dependency
  changes, compared for deep equality
- `@metreeca/tile-hive/toast` — `Toast` stack showing the posts on the shared board as transient notices
- `@metreeca/tile-cell/more` — `More` incremental loading trigger, firing as it scrolls into view
- `@metreeca/tile-lens/sheet` — `Sheet` incremental collection list, virtualised over a sliding window of items
- `@metreeca/tile-cell/note` — check mark for highlight notes and a distinct alert for critical ones
- `@metreeca/tile` — `colorInfoStroke`, `colorPassStroke`, `colorWarnStroke` and `colorFailStroke` status text
  tokens, the `backgroundColorGlass` elevation token, and select menus drawn with a chevron

### Changed

- Upgrade `@metreeca/core` to `^0.12.1`
- Upgrade `@metreeca/blue` to `^0.12.1`
- Upgrade `@metreeca/http` to `^0.4.1`
- Upgrade `@metreeca/qest` to `^0.12.1`
- Upgrade `@metreeca/keep` to `^0.11.1`
- Upgrade `@metreeca/keep-rest` to `^0.11.1`
- `@metreeca/tile` — `colorInfo` and `colorPass` hold mark contrast (3:1) rather than text contrast in the light
  scheme: status text takes the matching stroke token
- `@metreeca/tile-cell/button` — status button labels hold AA contrast through the stroke roles

### Removed

- `@metreeca/tile-data/faults` — **breaking**: `Faults`, `useFaults` and `useRaise` removed in favour of the shared
  status board (`useRaise()(issue)` → `useBoard().raise(issue)`)
- `@metreeca/tile-cell/fault` — **breaking**: `Fault` removed in favour of the `Toast` stack in
  `@metreeca/tile-hive/toast`
- `@metreeca/tile-lens` — **breaking**: root entry point and the empty placeholder modules removed

## [0.3.0](https://github.com/metreeca/tile/releases/tag/v0.3.0) - 2026-10-02

### Added

- `@metreeca/tile` — `padding` spacing token, `color`, `backgroundColor`, `padding`, `borderRadius` and `boxShadow`
  style properties, and exported token group types
- `@metreeca/tile` — enlarged images shown on a rounded panel over the whole viewport, and every heading level sized
  from the heading size token
- `@metreeca/tile-data/store` — shared resource store (`Store`, `useStore`) with `useResource` and `useCollection`
  bindings over `@metreeca/keep`
- `@metreeca/tile-data/router` — nested `Routes` tables routing the trailing path of a section, with subtree patterns
  and a bare `*` catch-all inherited by nested tables
- `@metreeca/tile-cell/hint` — pointer hint naming a control, a button standing on a glyph alone included
- `@metreeca/tile-cell` — `title` hint on links, `Reload` and `Dismiss` icon roles, and the GitHub mark
- `@metreeca/tile-hive/box`, `/stack` and `/strip` — styled box, vertical stack and horizontal strip layouts with
  split placements
- `@metreeca/tile-hive/shell` — `copy` slot under the content, with the done action taken off show while exchanges
  are in flight

### Changed

- `@metreeca/tile-data/router` — **breaking**: `Router` drops the `mode` (hash routing) and `fallback` props, in favour
  of catch-all patterns in `Routes`; route tables are declared only in `Routes`
  (`<Router fallback={view}>` → `<Routes>{{ ..., "*": view }}</Routes>`)
- `@metreeca/tile-data/router` — **breaking**: the navigator takes the `replace` flag in the navigation object rather
  than as a second argument (`navigate(route, true)` → `navigate({ route, replace: true })`)
- `@metreeca/tile-data/router` — **breaking**: every same-site link is followed in place, and `Routes` renders nothing
  while it moves the location
- `@metreeca/tile-cell/fault` — **breaking**: `text` and `children` props removed; reader-actionable faults are told by
  their `detail` (`<Fault text={wording}/>` → a problem carrying `detail: wording`)
- `@metreeca/tile-data` — depends on `@metreeca/blue` and `@metreeca/qest` `^0.12.0`, and on `@metreeca/keep` and
  `@metreeca/keep-rest` `^0.11.0`
- `@metreeca/tile-data`, `/tile-cell`, `/tile-hive` and `/tile-lens` — require `@metreeca/core` `^0.12.0`, and
  `@metreeca/http` `^0.4.0` where they depend on it

### Fixed

- `@metreeca/tile` — scheme-varying colours stated as `light-dark()` pairs
- `@metreeca/tile-cell` — glyphs and link logos centred on the text, neutral button hover and press painted once, note
  code blocks laid out as written, subtle links set in the surrounding face
- `@metreeca/tile-hive/shell` — headers held to the height of a subtle button, focus rings kept whole, columns clipped
  to their width with wide content scrolled across, and the menu kept at the end of a header without a heading

## [0.2.0](https://github.com/metreeca/tile/releases/tag/v0.2.0)

Initial release of the Metreeca Tile minimalist model-driven UI toolkit, superseding the legacy `@metreeca/tile` 4.x
line: a design system published as CSS tokens and base rules, with Preact bindings wiring components to headless
`@metreeca/core` state and `@metreeca/http` clients. `@metreeca/tile-lens` and `@metreeca/tile-form` claim their
package names ahead of the linked data views and forms they will carry.

- `@metreeca/tile` — design system tokens (colours, palettes, typography, spacings, scalings, borders, elevations,
  layers, motions, opacities, viewports, visuals), base markup rules, `data-theme` colour scheme pinning and the
  `css()` / `css.var()` helpers
- `@metreeca/tile-data` — shared faults, shared fetch client, headless component state and client-side routing
- `@metreeca/tile-cell` — button, fault, icons, link, logo and note widgets
- `@metreeca/tile-hive` — shell, styled area and tabbed panel containers
- `@metreeca/tile-lens` — linked data selection state
- `@metreeca/tile-form` — placeholder for linked data forms
