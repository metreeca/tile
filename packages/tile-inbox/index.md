
# Skin

internal: supports full-stack app development in house, not promoted as a product of its own

- (?) accessibility
- (?) element names (Element/TileElement)
- (?) custom HTML elements vs clases (accessibility)

- design system
	- owns the visual language: what tokens exist, what each one means, what values it takes in each theme
	- guarantees a consistent look across components and across apps that adopt it
	- stops at appearance: no behaviour, no markup, no component boundaries
	- CSS variables
		- the delivery channel: tokens resolve in the cascade, so a consumer retints or rethemes without a rebuild
		- the substitution point: components read tokens, never literal values, so overriding one variable is the
		  supported customisation path
		- carries the fallback contract: a component styled against a missing token degrades to its own default rather
		  than breaking
- layouts
	- the structural vocabulary an app arranges itself with: shells, panes, grids, stacks, spacing rhythm
	- answers where things sit, never what they mean: no domain knowledge, no data awareness
	- styled through the tokens like everything else, so arrangement and appearance stay independently replaceable
	- exists because apps need it, not because it is worth showcasing: scope stops at our own needs
- widgets
	- the pattern layer: recurring compositions assembled over layouts and tokens, such as forms, tables, dialogs,
	  navigation
	- spares each app from re-deriving the same arrangement, and keeps the arrangements consistent when it matters
	- internal support: shaped by what our apps actually repeat, not by what a component library would be expected
	  to cover
	- a pattern graduates here only after it recurs: speculative additions stay in the app that needed them


# CSS Design Systems

shipping tokens as custom properties is the established practice: Primer, Radix Colors, Open Props and Spectrum all
deliver this way

- what the channel gives
	- inheritance and selector scoping: a theme is a selector that redefines tokens, so retheming needs no rebuild
	- runtime substitution: an app overrides one token for one subtree without forking a stylesheet
	- graceful absence: `var(--token, default)` keeps a component usable where the token was never defined
- what custom properties cannot carry
	- breakpoints: media and container query preludes cannot read a variable, so these stay build-time constants
	- selectors and at-rule preludes: no variable-driven `@supports`, no composed class names
	- non-CSS consumers: charts on canvas, SVG attribute values and any native or print target need the values as data,
	  not as cascade state
- what the design has to account for
	- registration with `@property`: gives a token a type, an initial value and cascade safety, and is what makes it
	  animatable
	- invalid at computed-value time: a malformed `var()` leaves the property unset and inheriting, which is a different
	  failure from an undefined token and needs its own statement in the contract
	- derived values: tints, alpha variants and contrast pairs come from `color-mix()` or relative colour syntax, or
	  else from pre-computed ramps that multiply the token count
	- first paint: tokens must be in the document before it, or the unthemed pass flashes
- the source and the channel are separate
	- a single token source generates both the variable sheet and a data export, so non-CSS consumers and type checking
	  are served from the same definitions
	- CSS variables then deliver the tokens, and are not where the tokens are defined
		- (?) accessibility
