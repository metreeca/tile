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
 * Headless lens components.
 *
 * Exposes the query patterns an interface is built from (selections, filters, ranges, options, counts, collections,
 * resources) as plain state objects: each carries the operations that make sense for it and leaves rendering entirely
 * to the caller, so the same behaviour serves any rendering layer without being restated per binding.
 *
 * @module index
 */
