/*
 * Copyright © 2023-2026 Metreeca srl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Icon catalogue.
 *
 * Collects the glyphs and the roles `icon.ts` hands out as the `Icon` namespace: a role names the glyph it stands
 * for, and a name lucide already uses resolves to the glyph lucide draws, save for `Link`, which stands for the
 * chain link lucide calls `Link2`. `GitHub` is the Invertocat mark, filled in the current colour and fitted to the
 * span lucide glyphs cover, so it takes the same size and colour as the rest, though not their stroke width.
 *
 * @module
 */

import { createLucideIcon } from "lucide-preact";

export * from "lucide-preact";

export { LogIn, LogOut } from "lucide-preact";

export { Link2 as Link } from "lucide-preact";
export { ChevronRight as Open } from "lucide-preact";
export { ChevronLeft as Back } from "lucide-preact";

export { ChevronRight as Expand } from "lucide-preact";
export { ChevronDown as Collapse } from "lucide-preact";

export { Search } from "lucide-preact";
export { XCircle as Clear } from "lucide-preact";

export { ChevronsUpDown as Sort } from "lucide-preact";
export { ChevronDown as Increasing } from "lucide-preact";
export { ChevronUp as Decreasing } from "lucide-preact";

export { Plus as Insert } from "lucide-preact";
export { X as Remove } from "lucide-preact";

export { Plus as Create } from "lucide-preact";
export { Edit as Update } from "lucide-preact";
export { Save } from "lucide-preact";
export { Trash2 as Delete } from "lucide-preact";
export { RefreshCw as Reload } from "lucide-preact";

export { Check as Accept } from "lucide-preact";
export { X as Cancel } from "lucide-preact";
export { X as Close } from "lucide-preact";
export { X as Dismiss } from "lucide-preact";

export { Menu } from "lucide-preact";
export { X as Done } from "lucide-preact";

export { Heart as About } from "lucide-preact";
export { Info } from "lucide-preact";
export { AlertTriangle as Alert } from "lucide-preact";
export { HelpCircle as Help } from "lucide-preact";

export { Lock as Unauthorized } from "lucide-preact";
export { Ban as Forbidden } from "lucide-preact";
export { HeartCrack as NotFound } from "lucide-preact";
export { Ghost as Gone } from "lucide-preact";
export { HeartPulse as Error } from "lucide-preact";


export const GitHub = createLucideIcon("github", [
	["path", {
		d: "M10.226 17.284c-2.965-.36-5.054-2.493-5.054-5.256 0-1.123.404-2.336 1.078-3.144-.292-.741-.247-2.314.09-2.965.898-.112 2.111.36 2.83 1.01.853-.269 1.752-.404 2.853-.404 1.1 0 1.999.135 2.807.382.696-.629 1.932-1.1 2.83-.988.315.606.36 2.179.067 2.942.72.854 1.101 2 1.101 3.167 0 2.763-2.089 4.852-5.098 5.234.763.494 1.28 1.572 1.28 2.807v2.336c0 .674.561 1.056 1.235.786 4.066-1.55 7.255-5.615 7.255-10.646C23.5 6.188 18.334 1 11.978 1 5.62 1 .5 6.188.5 12.545c0 4.986 3.167 9.12 7.435 10.669.606.225 1.19-.18 1.19-.786V20.63a2.9 2.9 0 0 1-1.078.224c-1.483 0-2.359-.808-2.987-2.313-.247-.607-.517-.966-1.034-1.033-.27-.023-.359-.135-.359-.27 0-.27.45-.471.898-.471.652 0 1.213.404 1.797 1.235.45.651.921.943 1.483.943.561 0 .92-.202 1.437-.719.382-.381.674-.718.944-.943",
		fill: "currentColor",
		stroke: "none",
		transform: "translate(12 12) scale(0.9565) translate(-12 -12)" // 23 units wide, fitted to the 22 lucide glyphs span
	}]
]);
