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

import { Router, Routes, type Switch, type Table, useRoute, useRouter } from "./router.js";


const Here: FunctionComponent = () => createElement("output", {}, useRoute());


function mount(routes: Table | Switch, mode?: "path" | "hash"): void {
	act(() => render(createElement(Router, { mode, routes }), document.body));
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

		it("should render the element matching the current route as it is", async () => {

			mount({
				"/": createElement("p", {}, "home"),
				"/other": createElement("p", {}, "other")
			});

			expect(text()).toBe("home");

		});

		it("should match named steps and trailing paths", async () => {

			history.replaceState(null, "", "/users/123/posts/7");

			mount({ "/users/{id}/*": createElement("p", {}, "matched") });

			expect(text()).toBe("matched");

		});

		it("should match anonymous steps", async () => {

			history.replaceState(null, "", "/any");

			mount({ "/{}": createElement("p", {}, "matched") });

			expect(text()).toBe("matched");

		});

		it("should match the first pattern in table order", async () => {

			history.replaceState(null, "", "/users/new");

			mount({
				"/users/new": createElement("p", {}, "form"),
				"/users/{id}": createElement("p", {}, "user")
			});

			expect(text()).toBe("form");

		});

		it("should ignore the query and the hash", async () => {

			history.replaceState(null, "", "/#/?q=1#h");

			mount({ "/": createElement("p", {}, "home") }, "hash");

			expect(text()).toBe("home");

		});

		it("should follow redirections, filling in wildcard references", async () => {

			history.replaceState(null, "", "/people/123/about");

			mount({
				"/people/{id}/*": "/users/{id}/*",
				"/users/{id}/*": createElement(Here, {})
			});

			expect(text()).toBe("/users/123/about");

		});

		it("should move the location to the redirection, replacing the history entry", async () => {

			history.replaceState(null, "", "/old");

			const length = history.length;

			mount({ "/old": "/new", "/new": createElement(Here, {}) });

			expect(location.pathname).toBe("/new");
			expect(history.length).toBe(length);

		});

		it("should move the location hash to the redirection", async () => {

			history.replaceState(null, "", "/#/old");

			mount({ "/old": "/new", "/new": createElement(Here, {}) }, "hash");

			expect(location.hash).toBe("#/new");
			expect(text()).toBe("/new");

		});

		it("should reject an unhandled route", async () => {

			expect(() => mount({ "/other": createElement("p", {}) })).toThrow("unhandled route /");

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
			expect(location.pathname).toBe("/home");

		});

	});

	describe("history", () => {

		it("should render again on browser history navigation", async () => {

			mount({ "/*": createElement(Here, {}) });

			act(() => {
				history.replaceState(null, "", "/other");
				window.dispatchEvent(new PopStateEvent("popstate"));
			});

			expect(text()).toBe("/other");

		});

		it("should route clicks on local anchors through history", async () => {

			mount({
				"/": createElement("a", { href: "/other" }, "link"),
				"/other": createElement("p", {}, "other")
			});

			act(() => document.querySelector("a")?.click());

			expect(location.pathname).toBe("/other");
			expect(text()).toBe("other");

		});

	});

	describe("images", () => {

		function image(): HTMLImageElement | null {
			return document.querySelector("img");
		}

		function key(key: string): KeyboardEvent {
			const event = new KeyboardEvent("keydown", { key, cancelable: true });
			act(() => window.dispatchEvent(event));
			return event;
		}


		it("should enlarge an image on a plain click", async () => {

			mount({ "/": createElement("img", { src: "a.png", alt: "a" }) });

			act(() => image()?.click());

			expect(image()?.hasAttribute("active")).toBe(true);

		});

		it("should restore an enlarged image on a plain click", async () => {

			mount({ "/": createElement("img", { src: "a.png", alt: "a" }) });

			act(() => image()?.click());
			act(() => image()?.click());

			expect(image()?.hasAttribute("active")).toBe(false);

		});

		it("should restore an enlarged image on Escape, claiming the key", async () => {

			mount({ "/": createElement("img", { src: "a.png", alt: "a" }) });

			act(() => image()?.click());

			const event = key("Escape");

			expect(image()?.hasAttribute("active")).toBe(false);
			expect(event.defaultPrevented).toBe(true);

		});

		it("should leave Escape alone when no image is enlarged", async () => {

			mount({ "/": createElement("img", { src: "a.png", alt: "a" }) });

			expect(key("Escape").defaultPrevented).toBe(false);

		});

		it("should restore an enlarged image when the focus moves behind it", async () => {

			mount({
				"/": createElement("p", {},
					createElement("img", { src: "a.png", alt: "a" }),
					createElement("button", {}, "behind")
				)
			});

			act(() => image()?.click());
			act(() => document.querySelector("button")?.focus());

			expect(image()?.hasAttribute("active")).toBe(false);

		});

	});

});


describe("Routes", () => {

	function section(routes: Table | Switch): FunctionComponent {
		return () => createElement(Routes, { routes });
	}


	it("should match the trailing path left over by the enclosing pattern", async () => {

		history.replaceState(null, "", "/users/123");

		mount({
			"/users/*": createElement(section({
				"/": createElement("p", {}, "list"),
				"/{id}": createElement(Here, {})
			}), {})
		});

		expect(text()).toBe("/users/123");

	});

	it("should match the root of the section", async () => {

		history.replaceState(null, "", "/users/");

		mount({ "/users/*": createElement(section({ "/": createElement("p", {}, "list") }), {}) });

		expect(text()).toBe("list");

	});

	it("should nest to any depth", async () => {

		history.replaceState(null, "", "/a/b/c");

		mount({
			"/a/*": createElement(section({
				"/b/*": createElement(section({ "/c": createElement(Here, {}) }), {})
			}), {})
		});

		expect(text()).toBe("/a/b/c");

	});

	it("should hand switches the route relative to the section", async () => {

		history.replaceState(null, "", "/users/123");

		mount({ "/users/*": createElement(section(route => createElement("p", {}, route)), {}) });

		expect(text()).toBe("/123");

	});

	it("should see the whole route below a switch", async () => {

		history.replaceState(null, "", "/users/123");

		mount(() => createElement(section({ "/users/{id}": createElement(Here, {}) }), {}));

		expect(text()).toBe("/users/123");

	});

	it("should redirect relative to the section, replacing the history entry", async () => {

		history.replaceState(null, "", "/users/");

		const length = history.length;

		mount({
			"/users/*": createElement(section({
				"/": "/all",
				"/all": createElement(Here, {})
			}), {})
		});

		expect(location.pathname).toBe("/users/all");
		expect(history.length).toBe(length);
		expect(text()).toBe("/users/all");

	});

	it("should follow a section redirection reached through a router redirection", async () => {

		history.replaceState(null, "", "/");

		mount({
			"/": "/users/",
			"/users/*": createElement(section({
				"/": "/all",
				"/all": createElement(Here, {})
			}), {})
		});

		expect(location.pathname).toBe("/users/all");
		expect(text()).toBe("/users/all");

	});

	it("should redirect relative to the section in hash mode", async () => {

		history.replaceState(null, "", "/#/users/");

		mount({
			"/users/*": createElement(section({
				"/": "/all",
				"/all": createElement(Here, {})
			}), {})
		}, "hash");

		expect(location.hash).toBe("#/users/all");
		expect(text()).toBe("/users/all");

	});

	it("should reject a route not handled within the section", async () => {

		history.replaceState(null, "", "/users/123");

		expect(() => mount({
			"/users/*": createElement(section({ "/": createElement("p", {}) }), {})
		})).toThrow("unhandled route /123");

	});

});


describe("useRoute", () => {

	it("should return an empty route outside any router", async () => {

		act(() => render(createElement(Here, {}), document.body));

		expect(text()).toBe("");

	});

	it("should return the current route", async () => {

		history.replaceState(null, "", "/current");

		mount({ "/*": createElement(Here, {}) });

		expect(text()).toBe("/current");

	});

});


describe("useRouter", () => {

	function probe() {

		const navigators = vi.fn<(navigator: Router) => void>();

		const Probe: FunctionComponent = () => {
			navigators(useRouter());
			return createElement("output", {}, useRoute()); // reads the route, so it renders again on navigation
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

		mount({ "/*": createElement(Probe, {}) });

		const length = history.length;

		navigate(navigators, "/other");

		expect(location.pathname).toBe("/other");
		expect(history.length).toBe(length + 1);
		expect(text()).toBe("/other");

	});

	it("should replace the current history entry if required", async () => {

		const { navigators, Probe } = probe();

		mount({ "/*": createElement(Probe, {}) });

		const length = history.length;

		navigate(navigators, "/other", true);

		expect(location.pathname).toBe("/other");
		expect(history.length).toBe(length);
		expect(text()).toBe("/other");

	});

	it("should set the document title and the history state", async () => {

		const { navigators, Probe } = probe();

		mount({ "/*": createElement(Probe, {}) });

		navigate(navigators, { route: "/other", title: " Other  Page ", state: { key: "value" } });

		expect(location.pathname).toBe("/other");
		expect(document.title).toBe("Other Page");
		expect(history.state).toEqual({ key: "value" });

	});

	it("should keep the current route if omitted", async () => {

		const { navigators, Probe } = probe();

		mount({ "/*": createElement(Probe, {}) });

		navigate(navigators, { title: "Title" });

		expect(location.pathname).toBe("/");
		expect(document.title).toBe("Title");

	});

	it("should hand out the same navigator across navigations", async () => {

		const { navigators, Probe } = probe();

		mount({ "/*": createElement(Probe, {}) });

		navigate(navigators, "/other");

		const [[first], [last]] = [navigators.mock.calls[0], navigators.mock.lastCall];

		expect(navigators.mock.calls.length).toBeGreaterThan(1);
		expect(last).toBe(first);

	});

});


describe("modes", () => {

	const Nav = ({ route }: { route: string }) => {
		const router = useRouter();
		return createElement("button", { onClick: () => router(route) }, useRoute());
	};

	function click(): void {
		act(() => document.querySelector("button")?.click());
	}


	describe("path", () => {

		it("should be the default mode", async () => {

			history.replaceState(null, "", "/a/b#/c");

			mount({ "/*": createElement(Here, {}) });

			expect(text()).toBe("/a/b");

		});

		it("should draw routes from the location path", async () => {

			history.replaceState(null, "", "/a/b?q=1#h");

			mount({ "/*": createElement(Here, {}) }, "path");

			expect(text()).toBe("/a/b");

		});

		it("should navigate to absolute routes", async () => {

			history.replaceState(null, "", "/a/b");

			mount({ "/*": createElement(Nav, { route: "/c/d" }) }, "path");

			click();

			expect(location.pathname).toBe("/c/d");
			expect(text()).toBe("/c/d");

		});

		it("should resolve relative routes against the current location", async () => {

			history.replaceState(null, "", "/a/b?q=1#h");

			mount({ "/*": createElement(Nav, { route: "c" }) }, "path");

			click();

			expect(location.pathname).toBe("/a/c");
			expect(text()).toBe("/a/c");

		});

	});

	describe("hash", () => {

		it("should draw routes from the location hash", async () => {

			history.replaceState(null, "", "/x?q=1#/a/b");

			mount({ "/*": createElement(Here, {}) }, "hash");

			expect(text()).toBe("/a/b");

		});

		it("should navigate by carrying routes in the location hash", async () => {

			history.replaceState(null, "", "/x#/a/b");

			mount({ "/*": createElement(Nav, { route: "/c/d" }) }, "hash");

			click();

			expect(location.pathname).toBe("/x");
			expect(location.hash).toBe("#/c/d");
			expect(text()).toBe("/c/d");

		});

	});

});

