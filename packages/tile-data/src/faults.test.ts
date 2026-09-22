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

import { describe, expect, it } from "vitest";

import { createFaults } from "./faults.core.js";


describe("createFaults", () => {

	describe("creation", () => {

		it("should stand against no fault", async () => {

			expect(createFaults().faults).toEqual([]);

		});

		it("should stand against every fault reported by default", async () => {

			const model = createFaults()
				.raise({ status: 404 })
				.raise({ status: 410 })
				.raise({ status: 500 });

			expect(model.faults).toHaveLength(3);

		});


		it("should reject a fractional limit", async () => {

			expect(() => createFaults({ limit: 1.5 })).toThrow(TypeError);

		});

	});

	describe("raise", () => {

		it("should state the fault last", async () => {

			const model = createFaults().raise({ status: 404 }).raise({ status: 500 });

			expect(model.faults.map(({ status }) => status)).toEqual([404, 500]);

		});

		it("should keep problem details as given", async () => {

			const problem = { status: 404, title: "Not Found", detail: "unknown resource" };

			expect(createFaults().raise(problem).faults[0]).toMatchObject(problem);

		});

		it("should state a value that is not problem details as a fault of its own", async () => {

			const error = new TypeError("broken");

			expect(createFaults().raise(error).faults[0]).toMatchObject({

				status: 0,
				title: "TypeError",
				detail: "broken"

			});

		});

		it("should carry an issue that is JSON data as machine-readable details", async () => {

			expect(createFaults().raise({ code: 42 }).faults[0]).toMatchObject({

				status: 0,
				report: { code: 42 }

			});

		});

		it("should render an issue that is not JSON data", async () => {

			expect(createFaults().raise(() => {}).faults[0]).toMatchObject({

				status: 0,
				detail: expect.any(String)

			});

		});

		it("should state the same problem twice as two faults", async () => {

			const problem = { status: 500 };
			const model = createFaults().raise(problem).raise(problem);

			expect(model.faults).toHaveLength(2);
			expect(model.faults[0]?.instance).not.toBe(model.faults[1]?.instance);

		});

		it("should stand against every fault where the limit is not positive", async () => {

			const model = createFaults({ limit: -1 })
				.raise({ status: 404 })
				.raise({ status: 500 });

			expect(model.faults).toHaveLength(2);

		});

		it("should clear the oldest faults standing beyond the limit", async () => {

			const model = createFaults({ limit: 2 })
				.raise({ status: 404 })
				.raise({ status: 410 })
				.raise({ status: 500 });

			expect(model.faults.map(({ status }) => status)).toEqual([410, 500]);

		});

		it("should leave the faults it was taken from standing as they were", async () => {

			const model = createFaults().raise({ status: 404 });

			model.raise({ status: 500 });

			expect(model.faults).toHaveLength(1);

		});

	});

	describe("clear", () => {

		it("should clear the fault given, leaving the others standing", async () => {

			const model = createFaults().raise({ status: 404 }).raise({ status: 500 });

			expect(model.clear(model.faults[0]).faults.map(({ status }) => status)).toEqual([500]);

		});

		it("should clear the faults given, leaving the others standing", async () => {

			const model = createFaults()
				.raise({ status: 404 })
				.raise({ status: 410 })
				.raise({ status: 500 });

			const cleared = model.faults.filter(({ status }) => status !== 410);

			expect(model.clear(cleared).faults.map(({ status }) => status)).toEqual([410]);

		});

		it("should clear every standing fault", async () => {

			expect(createFaults().raise({ status: 404 }).raise({ status: 500 }).clear().faults).toEqual([]);

		});

		it("should ignore a fault no longer standing", async () => {

			const model = createFaults().raise({ status: 404 });
			const cleared = model.clear(model.faults[0]);

			expect(cleared.clear(model.faults[0])).toBe(cleared);

		});

		it("should ignore an empty clearing", async () => {

			const model = createFaults();

			expect(model.clear()).toBe(model);

		});

	});

	describe("identity", () => {

		it("should identify a fault as a UUID URN", async () => {

			expect(createFaults().raise({ status: 404 }).faults[0]?.instance)
				.toMatch(/^urn:uuid:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);

		});

		it("should tell standing faults apart", async () => {

			const model = createFaults().raise({ status: 404 }).raise({ status: 500 });

			expect(model.faults[0]?.instance).not.toBe(model.faults[1]?.instance);

		});

		it("should replace the occurrence stated by the source", async () => {

			const model = createFaults().raise({ status: 404, instance: "/products/1" });

			expect(model.faults[0]?.instance).toMatch(/^urn:uuid:/);

		});

		it("should never hand out the identity of a cleared fault again", async () => {

			const model = createFaults().raise({ status: 404 });
			const cleared = model.clear();

			expect(cleared.raise({ status: 500 }).faults[0]?.instance).not.toBe(model.faults[0]?.instance);

		});

	});

});
