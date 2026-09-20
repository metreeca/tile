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
 * chain link lucide calls `Link2`.
 *
 * @module
 */

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
export { Trash2 as Delete } from "lucide-preact";

export { Check as Accept } from "lucide-preact";
export { X as Cancel } from "lucide-preact";
export { X as Close } from "lucide-preact";

export { Menu } from "lucide-preact";
export { X as Done } from "lucide-preact";

export { Heart as About } from "lucide-preact";
export { Info } from "lucide-preact";
export { AlertTriangle as Alert } from "lucide-preact";
export { HelpCircle as Help } from "lucide-preact";

export { Lock as Unauthorized } from "lucide-preact";
export { Ban as Forbidden } from "lucide-preact";
export { HeartCrack as NotFound } from "lucide-preact";
export { HeartPulse as Error } from "lucide-preact";
