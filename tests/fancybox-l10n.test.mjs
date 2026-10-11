import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { loadFancyboxL10n, normalizeLangCode } from "../src/scripts/utils/fancybox-l10n.ts";

test("中文语言包覆盖全部图片入口，重新绑定后保留旋转工具栏", async () => {
	assert.equal(normalizeLangCode(" zh-CN "), "zh_CN");
	assert.equal(normalizeLangCode("en-US"), null);
	assert.equal(await loadFancyboxL10n("unsupported"), null);
	assert.equal(await loadFancyboxL10n("constructor"), null);
	assert.equal(await loadFancyboxL10n("__proto__"), null);
	const chinese = await loadFancyboxL10n("zh-CN");
	assert.equal(chinese.CLOSE, "关闭");
	const bindings = new Map();
	const fancybox = {
		bind: (selector, options) => bindings.set(selector, options),
		unbind: (selector) => bindings.delete(selector),
	};
	const selectors = { albumImages: "article", imageGrids: "grid", albumLinks: "album", singleFancybox: "single" };
	const toolbar = { display: { middle: ["rotateCW"] } };
	const module = { exports: {} };
	const events = new Map();
	const context = {
		exports: module.exports,
		document: { querySelector: () => ({}), addEventListener: (name, callback) => events.set(name, callback) },
		require: (name) => {
			if (name === "../core/swup-config") return {
				FANCYBOX_SELECTORS: selectors,
				getDefaultFancyboxConfig: () => ({ Carousel: { Toolbar: toolbar, Lazyload: { preload: 3 } } }),
			};
			if (name === "../utils/fancybox-l10n") return { loadFancyboxL10n: async () => chinese };
			if (name === "@fancyapps/ui") return { Fancybox: fancybox };
			if (name.endsWith("fancybox.css")) return {};
			throw new Error(`Unexpected import: ${name}`);
		},
	};
	const source = readFileSync(new URL("../src/scripts/handlers/fancybox-handler.ts", import.meta.url), "utf8");
	vm.runInNewContext(ts.transpileModule(source, {
		compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
	}).outputText, context);
	const handler = module.exports.getFancyboxHandler();
	assert.equal(module.exports.getFancyboxHandler(), handler);
	assert.equal(events.size, 1);
	await handler.init();
	assert.equal(bindings.size, 4);
	handler.cleanup();
	events.get("mizuki:post-decrypted")();
	await new Promise((resolve) => setTimeout(resolve, 0));
	assert.equal(bindings.size, 4, "Decryption after navigation must rebind images");
	for (const config of bindings.values()) {
		assert.equal(config.l10n.CLOSE, "关闭");
		assert.equal(config.Carousel.l10n.CLOSE, "关闭");
		assert.equal(config.Carousel.Toolbar, toolbar);
	}
	handler.cleanup();
	assert.equal(bindings.size, 0);
	await handler.init();
	assert.equal(bindings.size, 4);
});
