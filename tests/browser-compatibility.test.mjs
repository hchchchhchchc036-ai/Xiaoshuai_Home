import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join, sep } from "node:path";
import { test } from "node:test";
import vm from "node:vm";
import { createLegacyCss, oklchToRgb, prepareLegacyBrowser } from "../scripts/prepare-legacy-browser.mjs";

test("OKLCH conversion retains theme colors in sRGB", () => {
	assert.deepEqual(oklchToRgb(0, 0, 240), [0, 0, 0]);
	assert.deepEqual(oklchToRgb(1, 0, 240), [255, 255, 255]);
	assert.deepEqual(oklchToRgb(0.7, 0.14, 250), [83, 163, 242]);
});

test("legacy CSS retains dynamic hue metadata and transparent mixes", () => {
	const css = ":root{--primary:oklch(.7 .14 var(--hue))}.button{color:var(--primary);background:color-mix(in srgb,var(--primary) 35%,transparent)}";
	const result = createLegacyCss(css);
	assert.deepEqual(result.variables, ["--primary"]);
	assert.match(result.css, /--legacy-source-primary:oklch/);
	assert.match(result.css, /--legacy-rgb-primary:/);
	assert.match(result.css, /rgba\(var\(--legacy-rgb-primary/);
	assert.match(result.css, /var\(--legacy-alpha-primary,1\)/);
	assert.match(result.css, /calc\(var\(--legacy-alpha-primary,1\)\*\.35\)/);
	assert.doesNotMatch(result.css, /background:color-mix/);
});

test("CSS nesting is lowered for Chrome 109", () => {
	const { css } = createLegacyCss(".a{& .b{color:oklch(.7 .14 250)}}");
	assert.match(css, /\.a \.b/);
	assert.doesNotMatch(css, /&/);
});

test("neutral Tailwind colors with a missing hue remain valid", () => {
	const result = createLegacyCss(":root{--color-neutral-50:oklch(98.5% 0 none)}");
	assert.match(result.css, /--color-neutral-50:#fafafa/);
});

test("relative OKLCH preserves the base theme color", () => {
	const { css } = createLegacyCss(".a{color:oklch(from var(--primary) l c h)}");
	assert.match(css, /color:var\(--primary\)/);
});

test("relative alpha, hex alpha and variable aliases preserve their channels", () => {
	const { css } = createLegacyCss(":root{--hex:#1234;--hex8:#ff000080;--alias:var(--hex)}.a{color:oklch(from var(--primary) l c h / 50%)}");
	assert.match(css, /rgba\(var\(--legacy-rgb-primary\),\.5\)/);
	assert.match(css, /--legacy-rgb-hex:17,34,51/);
	assert.match(css, /--legacy-rgb-alias:var\(--legacy-rgb-hex\)/);
	assert.ok(Math.abs(Number(css.match(/--legacy-alpha-hex:([\d.]+)/)[1]) - 68 / 255) < 1e-6);
	assert.ok(Math.abs(Number(css.match(/--legacy-alpha-hex8:([\d.]+)/)[1]) - 128 / 255) < 1e-6);
});

test("transparent theme variables provide channels and preserve their own alpha", () => {
	const { css } = createLegacyCss(":root{--line-color:rgba(0,0,0,.1)}.a{border-color:color-mix(in srgb,var(--line-color) 50%,transparent)}");
	assert.match(css, /--legacy-rgb-line-color:0,0,0/);
	assert.match(css, /--legacy-alpha-line-color:\.1/);
	assert.match(css, /var\(--legacy-alpha-line-color,1\)/);
});

test("transparent mixes honor operand order, implied weights and normalization", () => {
	for (const [mix, alpha] of [
		["transparent 50%,var(--primary)", ".5"],
		["var(--primary),transparent 70%", ".3"],
		["var(--primary) 25%,transparent 25%", ".25"],
		["var(--primary) 80%,transparent 80%", ".5"],
	]) {
		const { css } = createLegacyCss(`.a{color:color-mix(in srgb,${mix})}`);
		assert.ok(css.includes(`calc(var(--legacy-alpha-primary,1)*${alpha})`), `wrong transparent weight: ${mix}`);
	}
	assert.match(createLegacyCss(".a{color:color-mix(in srgb,transparent 70%,red)}").css, /color:#ff00004d/);
});

test("unconverted valid colors do not interrupt modern builds", () => {
	const result = createLegacyCss(".a{color:oklch(.7 var(--chroma) var(--hue))}");
	assert.ok(result.css.length > 0);
	assert.ok(result.warnings.includes("oklch(.7 var(--chroma) var(--hue))"));
});

test("production keeps modern CSS bytes and URLs, with no compatibility request in modern browsers", async () => {
	const directory = await mkdtemp(join(tmpdir(), "mizuki-browser-"));
	try {
		await mkdir(join(directory, "_astro"));
		await mkdir(join(directory, "posts", "sample"), { recursive: true });
		const original = ":root{--primary:oklch(.7 .14 var(--hue));--card-bg:white}:root.dark{--primary:oklch(.75 .14 var(--hue));--card-bg:oklch(.23 .015 var(--hue))}.card{background:var(--primary)}";
		await writeFile(join(directory, "_astro", "main.hash.css"), original);
		await writeFile(join(directory, "index.html"), '<html><head><link rel="stylesheet" href="/_astro/main.hash.css"></head><body></body></html>');
		await writeFile(join(directory, "posts", "sample", "index.html"), "<HTML><HEAD></HEAD><BODY>article</BODY></HTML>");
		await prepareLegacyBrowser(directory);
		assert.equal(await readFile(join(directory, "_astro", "main.hash.css"), "utf8"), original);
		const html = await readFile(join(directory, "index.html"), "utf8");
		assert.match(html, /href="\/_astro\/main.hash.css"/);
		assert.ok(await readFile(join(directory, "_astro", "main.hash.legacy.css"), "utf8"));
		assert.match(await readFile(join(directory, "posts", "sample", "index.html"), "utf8"), /data-legacy-styles/);
		const selectorMatch = html.match(/<script data-legacy-styles>([\s\S]*?)<\/script>/);
		assert.ok(selectorMatch, "legacy selector script must be injected");
		const selector = selectorMatch[1];
		const queries = [];
		const modern = { window: { CSS: {} }, CSS: { supports: (...args) => (queries.push(args), true) } };
		vm.runInNewContext(selector, modern, { timeout: 1000 });
		assert.deepEqual(queries.map((args) => Array.from(args)), [["color", "oklch(.7 .1 240)"], ["color", "color-mix(in srgb,red,blue)"]]);
		assert.equal(modern.window.__legacyBrowserRequested, undefined);
		const requests = [];
		const legacy = { window: { CSS: {} }, CSS: { supports: () => false }, document: { createElement: () => ({}), head: { appendChild: (script) => requests.push(script.src) } } };
		vm.runInNewContext(selector, legacy, { timeout: 1000 });
		vm.runInNewContext(selector, legacy, { timeout: 1000 });
		assert.equal(requests.length, 1);
		assert.match(requests[0], /^\/_astro\/legacy-browser\.[a-f\d]+\.js$/);
		const runtime = await readFile(resolve(directory, `.${requests[0]}`), "utf8");
		const values = new Map([["--hue", "240"]]);
		let writes = 0;
		let reads = 0;
		const observers = [];
		const makeLink = (path) => {
			let href = new URL(path, "https://example.test/").href;
			return { nodeType: 1, tagName: "LINK", rel: "stylesheet", events: {}, get href() { return href; }, set href(value) { href = new URL(value, "https://example.test/").href; }, addEventListener(type, callback) { this.events[type] = callback; }, querySelectorAll: () => [] };
		};
		const links = [makeLink("/_astro/main.hash.css?cache=1#style"), makeLink("https://cdn.example/style.css"), makeLink("/outside.css")];
		const root = {
			nodeType: 1, tagName: "HTML", className: "",
			classList: { contains: (name) => root.className.split(/\s+/).includes(name) },
			style: { setProperty(name, value) { values.set(name, value); writes++; }, removeProperty(name) { values.delete(name); writes++; } },
			querySelectorAll: () => links,
		};
		const sandbox = {
			window: { addEventListener() {} }, document: { documentElement: root }, URL,
			location: { href: "https://example.test/", origin: "https://example.test" },
			MutationObserver: class { constructor(callback) { this.callback = callback; observers.push(this); } observe(target, options) { this.target = target; this.options = options; } },
			getComputedStyle: () => { reads++; return { getPropertyValue(name) { if (name === "--hue") return values.get(name); if (name === "--legacy-source-primary") return `oklch(${root.classList.contains("dark") ? ".75" : ".7"} .14 ${values.get("--hue")})`; if (name === "--legacy-source-card-bg" && root.classList.contains("dark")) return `oklch(.23 .015 ${values.get("--hue")})`; return ""; } }; },
		};
		vm.runInNewContext(runtime, sandbox, { timeout: 1000 });
		assert.equal(new URL(links[0].href).pathname, "/_astro/main.hash.legacy.css");
		assert.equal(new URL(links[0].href).search, "?cache=1");
		assert.equal(links[1].href, "https://cdn.example/style.css");
		assert.equal(links[2].href, "https://example.test/outside.css");
		assert.equal(values.get("--primary"), "rgba(55,168,236,1)");
		const themeObserver = observers.find((observer) => observer.options.attributeFilter?.includes("class"));
		assert.ok(themeObserver && !themeObserver.options.subtree, "class/style observation must be limited to the root");
		const linksObserver = observers.find((observer) => observer.options.childList);
		assert.deepEqual(Array.from(linksObserver.options.attributeFilter), ["href"]);
		root.className = "dark";
		const beforeReads = reads;
		themeObserver.callback([{ type: "attributes", target: root }, { type: "attributes", target: root }]);
		assert.equal(reads - beforeReads, 1, "batch root mutations into one color update");
		assert.equal(values.get("--primary"), "rgba(74,184,253,1)");
		assert.ok(values.has("--card-bg"));
		values.set("--hue", "300");
		themeObserver.callback([{ type: "attributes", target: root }]);
		assert.notEqual(values.get("--primary"), "rgba(74,184,253,1)");
		const beforeWrites = writes;
		root.className = "dark is-theme-transitioning";
		themeObserver.callback([{ type: "attributes", target: root }]);
		assert.equal(writes, beforeWrites, "unrelated classes and self-written styles must not restart conversion");
		const dynamicLink = makeLink("/_astro/main.hash.css");
		linksObserver.callback([{ type: "childList", addedNodes: [{ nodeType: 1, tagName: "DIV", querySelectorAll: () => [dynamicLink] }] }]);
		assert.equal(new URL(dynamicLink.href).pathname, "/_astro/main.hash.legacy.css");
		dynamicLink.href = "/_astro/main.hash.css?new=1";
		linksObserver.callback([{ type: "attributes", target: dynamicLink }]);
		assert.equal(new URL(dynamicLink.href).pathname, "/_astro/main.hash.legacy.css");
		links[0].events.load();
		root.className = "";
		themeObserver.callback([{ type: "attributes", target: root }]);
		assert.equal(values.has("--card-bg"), false, "returning to a static light color must remove the owned dark override");
		assert.equal(values.has("--legacy-rgb-card-bg"), false);
		const firstLegacy = await readFile(join(directory, "_astro", "main.hash.legacy.css"), "utf8");
		await prepareLegacyBrowser(directory);
		assert.equal(await readFile(join(directory, "index.html"), "utf8"), html);
		assert.equal(await readFile(join(directory, "_astro", "main.hash.legacy.css"), "utf8"), firstLegacy);
		await writeFile(join(directory, "_astro", "main.hash.css"), original + ":root{--extra:oklch(.5 .1 60)}");
		await prepareLegacyBrowser(directory);
		const updated = await readFile(join(directory, "index.html"), "utf8");
		assert.ok(!updated.includes(requests[0]), "regenerating assets must update the runtime URL");
	} finally {
		assert.ok(resolve(directory).startsWith(resolve(tmpdir()) + sep + "mizuki-browser-"));
		await rm(directory, { recursive: true, force: true });
	}
});
