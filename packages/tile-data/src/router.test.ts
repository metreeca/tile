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

import { createElement, type FunctionComponent, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { active, hash, native, path, Router, type Switch, type Table, title, useRoute, useRouter } from "./router.js";


const Here: FunctionComponent = () => createElement("output", {}, useRoute());


function mount(routes: Table | Switch): void {
	act(() => render(createElement(Router, { routes }), document.body));
}

function text(): string {
	return document.body.textContent ?? "";
}


beforeEach(async () => {
	history.replaceState(null, "", "/");
	document.title = "";
});

afterEach(async () => {
	act(() => render(null, document.body));
});


describe("Router", () => {

	describe("tables", () => {

		it("should render the component matching the current route", async () => {

			mount({
				"/": () => createElement("p", {}, "home"),
				"/other": () => createElement("p", {}, "other")
			});

			expect(text()).toBe("home");

		});

		it("should render the element matching the current route as it is", async () => {

			mount({
				"/": createElement("p", {}, "home"),
				"/other": createElement("p", {}, "other")
			});

			expect(text()).toBe("home");

		});

		it("should pass named steps and the trailing path as props", async () => {

			history.replaceState(null, "", "/users/123/posts/7");

			const User: FunctionComponent<{ id?: string, $?: string }> = ({ id, $ }) =>
				createElement("p", {}, `${id} ${$}`);

			mount({ "/users/{id}/*": User });

			expect(text()).toBe("123 /posts/7");

		});

		it("should match anonymous steps", async () => {

			history.replaceState(null, "", "/any");

			mount({ "/{}": () => createElement("p", {}, "matched") });

			expect(text()).toBe("matched");

		});

		it("should match the first pattern in table order", async () => {

			history.replaceState(null, "", "/users/new");

			mount({
				"/users/new": () => createElement("p", {}, "form"),
				"/users/{id}": () => createElement("p", {}, "user")
			});

			expect(text()).toBe("form");

		});

		it("should ignore the query and the hash", async () => {

			const store = (route?: string) => route ?? "/?q=1#h";

			act(() => render(createElement(Router, {
				store,
				routes: { "/": () => createElement("p", {}, "home") }
			}), document.body));

			expect(text()).toBe("home");

		});

		it("should follow redirections, filling in wildcard references", async () => {

			history.replaceState(null, "", "/people/123/about");

			mount({
				"/people/{id}/*": "/users/{id}/*",
				"/users/{id}/*": ({ id, $ }: { id?: string, $?: string }) => createElement("p", {}, `${id} ${$}`)
			});

			expect(text()).toBe("123 /about");

		});

		it("should reject an unhandled route", async () => {

			expect(() => mount({ "/other": () => null })).toThrow("unhandled route /");

		});

		it("should reject a redirection loop", async () => {

			expect(() => mount({ "/": "/a", "/a": "/b", "/b": "/a" })).toThrow("redirection loop");

		});

	});

	describe("switches", () => {

		it("should render what the switch returns for the current route", async () => {

			mount(route => createElement("p", {}, `at ${route}`));

			expect(text()).toBe("at /");

		});

		it("should follow redirections returned by the switch", async () => {

			mount(route => route === "/" ? "/home" : createElement("p", {}, route));

			expect(text()).toBe("/home");

		});

	});

	describe("history", () => {

		it("should render again on browser history navigation", async () => {

			mount({ "/*": Here });

			act(() => {
				history.replaceState(null, "", "/other");
				window.dispatchEvent(new PopStateEvent("popstate"));
			});

			expect(text()).toBe("/other");

		});

		it("should route clicks on local anchors through history", async () => {

			mount({
				"/": () => createElement("a", { href: "/other" }, "link"),
				"/other": () => createElement("p", {}, "other")
			});

			act(() => document.querySelector("a")?.click());

			expect(location.pathname).toBe("/other");
			expect(text()).toBe("other");

		});

	});

});


describe("useRoute", () => {

	it("should return an empty route outside any router", async () => {

		act(() => render(createElement(Here, {}), document.body));

		expect(text()).toBe("");

	});

	it("should return the current route", async () => {

		history.replaceState(null, "", "/current");

		mount({ "/*": Here });

		expect(text()).toBe("/current");

	});

});


describe("useRouter", () => {

	function probe() {

		const navigators = vi.fn<(navigator: Router) => void>();

		const Probe: FunctionComponent = () => {
			navigators(useRouter());
			return createElement(Here, {});
		};

		return { navigators, Probe };

	}

	function navigate(navigators: ReturnType<typeof probe>["navigators"], ...args: Parameters<Router>): void {
		act(() => navigators.mock.lastCall?.[0](...args));
	}


	it("should return a no-op outside any router", async () => {

		const { navigators, Probe } = probe();

		act(() => render(createElement(Probe, {}), document.body));

		expect(() => navigate(navigators, "/other")).not.toThrow();
		expect(location.pathname).toBe("/");

	});

	it("should navigate to a route, adding a history entry", async () => {

		const { navigators, Probe } = probe();

		mount({ "/*": Probe });

		const length = history.length;

		navigate(navigators, "/other");

		expect(location.pathname).toBe("/other");
		expect(history.length).toBe(length + 1);
		expect(text()).toBe("/other");

	});

	it("should replace the current history entry if required", async () => {

		const { navigators, Probe } = probe();

		mount({ "/*": Probe });

		const length = history.length;

		navigate(navigators, "/other", true);

		expect(location.pathname).toBe("/other");
		expect(history.length).toBe(length);
		expect(text()).toBe("/other");

	});

	it("should set the document title and the history state", async () => {

		const { navigators, Probe } = probe();

		mount({ "/*": Probe });

		navigate(navigators, { route: "/other", title: " Other  Page ", state: { key: "value" } });

		expect(location.pathname).toBe("/other");
		expect(document.title).toBe("Other Page");
		expect(history.state).toEqual({ key: "value" });

	});

	it("should keep the current route if omitted", async () => {

		const { navigators, Probe } = probe();

		mount({ "/*": Probe });

		navigate(navigators, { title: "Title" });

		expect(location.pathname).toBe("/");
		expect(document.title).toBe("Title");

	});

	it("should hand out the same navigator across navigations", async () => {

		const { navigators, Probe } = probe();

		mount({ "/*": Probe });

		navigate(navigators, "/other");

		const [[first], [last]] = [navigators.mock.calls[0], navigators.mock.lastCall];

		expect(navigators.mock.calls.length).toBeGreaterThan(1);
		expect(last).toBe(first);

	});

});


describe("active", () => {

	function links(...routes: string[]): Table {
		return {
			"/*": () => createElement("nav", {}, routes.map(route =>
				createElement("a", { key: route, ...active(route) }, route)
			))
		};
	}

	function marked(): string[] {
		return Array.from(document.querySelectorAll("a[active]"), anchor => anchor.getAttribute("href") ?? "");
	}


	it("should mark links to the current route", async () => {

		history.replaceState(null, "", "/a");

		mount(links("/a", "/b"));

		expect(marked()).toEqual(["/a"]);

	});

	it("should mark wildcard links to enclosing routes", async () => {

		history.replaceState(null, "", "/a/b");

		mount(links("/a/*", "/a", "/b/*"));

		expect(marked()).toEqual(["/a/"]);

	});

	it("should strip the wildcard from the link", async () => {

		mount(links("/*"));

		expect(document.querySelector("a")?.getAttribute("href")).toBe("/");

	});

});

describe("native", () => {

	it("should mark links as native", async () => {

		expect(native("/other")).toEqual({ href: "/other", native: "" });

	});

});

describe("path", () => {

	it("should extract the route from the location path", async () => {

		history.replaceState(null, "", "/a/b?q=1#h");

		expect(path()).toBe("/a/b");

	});

	it("should convert absolute routes to themselves", async () => {

		expect(path("/a/b")).toBe("/a/b");

	});

	it("should resolve relative routes against the current location", async () => {

		history.replaceState(null, "", "/a/b?q=1#h");

		history.pushState(null, "", path("c"));

		expect(path()).toBe("/a/c");

	});

});

describe("hash", () => {

	it("should extract the route from the location hash", async () => {

		history.replaceState(null, "", "/?q=1#/a/b");

		expect(hash()).toBe("/a/b");

	});

	it("should convert routes to locations carrying them", async () => {

		history.pushState(null, "", hash("/a/b"));

		expect(hash()).toBe("/a/b");

	});

});

describe("title", () => {

	it("should set the document title", async () => {

		title("Title");

		expect(document.title).toBe("Title");

	});

	it("should tidy whitespace", async () => {

		title("  Some   Title ");

		expect(document.title).toBe("Some Title");

	});

});
