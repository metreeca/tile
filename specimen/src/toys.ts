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
 * Toys store.
 *
 * Offers the specimen sections a store holding the toys sample dataset of `@metreeca/keep-suite`, kept in memory in
 * the page by an Oxigraph repository, so the specimen runs against a real store with no server behind it. The module
 * resolves once the store is seeded, so a section importing it never meets an empty store.
 *
 * @module
 */

import type { Store } from "@metreeca/keep";
import { createSPARQLStore } from "@metreeca/keep-sparql";
import {
	catalogues,
	Categories,
	Category,
	collections,
	Image,
	Product,
	Products,
	Vendor,
	Vendors,
	Video
} from "@metreeca/keep-suite/toys";
import { createOxiRepository } from "@metreeca/wire-sparql-oxigraph";
import init from "oxigraph/web.js";


export { base, Category, Product, Products, Vendor } from "@metreeca/keep-suite/toys";


await init(); // loads the Oxigraph WebAssembly module, which the repository needs before it opens


/**
 * The store holding the toys sample dataset.
 */
export const toys: Store = createSPARQLStore(createOxiRepository());


// products reference vendors, categories and media, so those are in place before products are inserted

await Promise.all([
	...collections.categories.map(state => toys.insert({ entry: state.id, shape: Category, state })),
	...collections.vendors.map(state => toys.insert({ entry: state.id, shape: Vendor, state })),
	...collections.images.map(state => toys.insert({ entry: state.id, shape: Image, state })),
	...collections.videos.map(state => toys.insert({ entry: state.id, shape: Video, state }))
]);

await Promise.all(collections.products.map(state => toys.insert({ entry: state.id, shape: Product, state })));

await Promise.all([
	toys.insert({ entry: catalogues.categories.id, shape: Categories, state: catalogues.categories }),
	toys.insert({ entry: catalogues.vendors.id, shape: Vendors, state: catalogues.vendors }),
	toys.insert({ entry: catalogues.products.id, shape: Products, state: catalogues.products })
]);
