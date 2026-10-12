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

test("transparent theme variables provide channels and preserve their own alpha", () => {
	const { css } = createLegacyCss(":root{--line-color:rgba(0,0,0,.1)}.a{border-color:color-mix(in srgb,var(--line-color) 50%,transparent)}");
	assert.match(css, /--legacy-rgb-line-color:0,0,0/);
	assert.match(css, /--legacy-alpha-line-color:\.1/);
	assert.match(css, /var\(--legacy-alpha-line-color,1\)/);
});

test("production keeps modern CSS bytes and URLs, with no compatibility request in modern browsers", async () => {
	const directory = await mkdtemp(join(tmpdir(), "mizuki-browser-"));
	try {
		await mkdir(join(directory, "_astro"));
		const original = ":root{--primary:oklch(.7 .14 var(--hue))}.card{background:var(--primary)}";
		await writeFile(join(directory, "_astro", "main.hash.css"), original);
		await writeFile(join(directory, "index.html"), '<html><head><link rel="stylesheet" href="/_astro/main.hash.css"></head><body></body></html>');
		await prepareLegacyBrowser(directory);
		assert.equal(await readFile(join(directory, "_astro", "main.hash.css"), "utf8"), original);
		const html = await readFile(join(directory, "index.html"), "utf8");
		assert.match(html, /href="\/_astro\/main.hash.css"/);
		assert.ok(await readFile(join(directory, "_astro", "main.hash.legacy.css"), "utf8"));
		const selector = html.match(/<script data-legacy-styles>([\s\S]*?)<\/script>/)[1];
		const modern = { window: { CSS: {} }, CSS: { supports: () => true } };
		vm.runInNewContext(selector, modern);
		assert.equal(modern.window.__legacyBrowserRequested, undefined);
		const requests = [];
		const legacy = { window: { CSS: {} }, CSS: { supports: () => false }, document: { createElement: () => ({}), head: { appendChild: (script) => requests.push(script.src) } } };
		vm.runInNewContext(selector, legacy);
		vm.runInNewContext(selector, legacy);
		assert.equal(requests.length, 1);
		assert.match(requests[0], /^\/_astro\/legacy-browser\.[a-f\d]+\.js$/);
		await prepareLegacyBrowser(directory);
		assert.equal((await readFile(join(directory, "index.html"), "utf8")).match(/data-legacy-styles/g).length, 1);
		await writeFile(join(directory, "_astro", "main.hash.css"), original + ":root{--extra:oklch(.5 .1 60)}");
		await prepareLegacyBrowser(directory);
		const updated = await readFile(join(directory, "index.html"), "utf8");
		assert.ok(!updated.includes(requests[0]), "regenerating assets must update the runtime URL");
	} finally {
		assert.ok(resolve(directory).startsWith(resolve(tmpdir()) + sep + "mizuki-browser-"));
		await rm(directory, { recursive: true, force: true });
	}
});
