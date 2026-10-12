import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Reuse the CSS tooling already installed with the project's locked dependencies.
const require = createRequire(import.meta.url);
const postcssRequire = createRequire(require.resolve("postcss-import"));
const tailwindRequire = createRequire(require.resolve("@tailwindcss/vite"));
const tailwindNodeRequire = createRequire(tailwindRequire.resolve("@tailwindcss/node"));
const postcss = postcssRequire("postcss");
const valueParser = postcssRequire("postcss-value-parser");
const lightningcss = tailwindNodeRequire("lightningcss");

export function oklchToRgb(lightness, chroma, hue) {
	const angle = hue * Math.PI / 180;
	const a = chroma * Math.cos(angle);
	const b = chroma * Math.sin(angle);
	const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
	return [
		4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
		-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
		-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
	].map(function (channel) {
		var srgb = channel <= 0.0031308 ? 12.92 * channel : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;
		return Math.round(Math.max(0, Math.min(1, srgb)) * 255);
	});
}

function parseOklch(value, hue = 240) {
	const match = value.replace(/var\(--hue\)/g, String(hue)).match(/^oklch\(\s*([\d.e+-]+)(%?)\s+([\d.e+-]+)\s+([\d.e+-]+|none)(?:deg)?(?:\s*\/\s*([\d.e+-]+)(%?))?\s*\)$/i);
	if (!match) return null;
	return {
		rgb: oklchToRgb(Number(match[1]) / (match[2] ? 100 : 1), Number(match[3]), match[4] === "none" ? 0 : Number(match[4])),
		alpha: match[5] === undefined ? 1 : Number(match[5]) / (match[6] ? 100 : 1),
	};
}

function legacyValue(value) {
	const parsed = valueParser(value);
	parsed.walk((node) => {
		if (node.type !== "function") return;
		if (node.value === "oklch") {
			const text = valueParser.stringify(node);
			const relative = text.match(/^oklch\(from\s+var\((--[\w-]+)\)/);
			if (relative) {
				const alpha = text.match(/\/\s*([\d.]+)(%?)\s*\)$/);
				// ponytail: legacy relative colors retain the base hue/lightness; advanced gradient shifts remain modern-only.
				node.type = "word";
				node.value = alpha
					? `rgba(var(--legacy-rgb-${relative[1].slice(2)}),${Number(alpha[1]) / (alpha[2] ? 100 : 1)})`
					: `var(${relative[1]})`;
				return false;
			}
			const color = parseOklch(text);
			if (!color) throw new Error(`Cannot convert legacy color: ${text}`);
			node.type = "word";
			node.value = `rgba(${color.rgb.join(",")},${color.alpha})`;
			return false;
		}
		if (node.value === "color-mix") {
			const groups = [[]];
			for (const child of node.nodes) {
				if (child.type === "div" && child.value === ",") groups.push([]);
				else groups.at(-1).push(child);
			}
			const first = valueParser.stringify(groups[1] || []).trim();
			const second = valueParser.stringify(groups[2] || []).trim();
			const weight = first.match(/\s+([\d.]+)%$/);
			const color = first.replace(/\s+[\d.]+%$/, "");
			const variable = color.match(/^var\((--[\w-]+)\)$/);
			const transparent = /^transparent(?:\s+[\d.]+%)?$/.test(second);
			// ponytail: opaque mixes use the first color in legacy CSS; modern CSS retains the exact mix.
			const fallback = variable && transparent
				? `rgba(var(--legacy-rgb-${variable[1].slice(2)},var(--legacy-rgb-primary)),calc(var(--legacy-alpha-${variable[1].slice(2)},1)*${weight ? Number(weight[1]) / 100 : 0.5}))`
				: legacyValue(color || "transparent");
			node.type = "word";
			node.value = fallback;
			return false;
		}
	});
	return parsed.toString();
}

export function createLegacyCss(css) {
	const root = postcss.parse(css);
	const variables = new Set();
	root.walkDecls((decl) => {
		if (decl.prop.startsWith("--legacy-")) return;
		if (decl.prop.startsWith("--")) {
			const color = parseOklch(decl.value);
			if (color) {
				variables.add(decl.prop);
				decl.cloneBefore({ prop: `--legacy-source-${decl.prop.slice(2)}` });
				decl.cloneBefore({ prop: `--legacy-rgb-${decl.prop.slice(2)}`, value: color.rgb.join(",") });
				decl.cloneBefore({ prop: `--legacy-alpha-${decl.prop.slice(2)}`, value: String(color.alpha) });
			} else if (/^#[\da-f]{3,8}$/i.test(decl.value) || /^(white|black)$/.test(decl.value)) {
				const hex = decl.value === "white" ? "ffffff" : decl.value === "black" ? "000000" : decl.value.slice(1);
				const full = hex.length <= 4 ? hex.split("").map((c) => c + c).join("") : hex;
				decl.cloneBefore({ prop: `--legacy-rgb-${decl.prop.slice(2)}`, value: [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), 16)).join(",") });
				decl.cloneBefore({ prop: `--legacy-alpha-${decl.prop.slice(2)}`, value: full.length === 8 ? String(Number.parseInt(full.slice(6), 16) / 255) : "1" });
			} else {
				const rgba = decl.value.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/);
				const alias = decl.value.match(/^var\((--[\w-]+)\)$/);
				if (rgba) {
					decl.cloneBefore({ prop: `--legacy-rgb-${decl.prop.slice(2)}`, value: rgba.slice(1, 4).join(",") });
					decl.cloneBefore({ prop: `--legacy-alpha-${decl.prop.slice(2)}`, value: rgba[4] || "1" });
				} else if (alias) {
					decl.cloneBefore({ prop: `--legacy-rgb-${decl.prop.slice(2)}`, value: `var(--legacy-rgb-${alias[1].slice(2)})` });
					decl.cloneBefore({ prop: `--legacy-alpha-${decl.prop.slice(2)}`, value: `var(--legacy-alpha-${alias[1].slice(2)},1)` });
				}
			}
		}
		decl.value = legacyValue(decl.value);
	});
	return {
		css: lightningcss.transform({ filename: "legacy.css", code: Buffer.from(root.toString()), targets: { chrome: 109 << 16 }, minify: true }).code.toString(),
		variables: [...variables],
	};
}

export function installLegacyStyles(variables) {
	if (window.__legacyStylesInstalled) return;
	window.__legacyStylesInstalled = true;
	var root = document.documentElement;
	var signature = "";
	function updateColors(force) {
		var computed = getComputedStyle(root);
		var next = root.className + ":" + computed.getPropertyValue("--hue");
		if (!force && signature === next) return;
		signature = next;
		variables.forEach(function (name) {
			var source = computed.getPropertyValue("--legacy-source-" + name.slice(2)).trim();
			var match = source.match(/^oklch\(\s*([\d.e+-]+)(%?)\s+([\d.e+-]+)\s+([\d.e+-]+|none)(?:deg)?(?:\s*\/\s*([\d.e+-]+)(%?))?\s*\)$/i);
			if (!match) return;
			var rgb = oklchToRgb(Number(match[1]) / (match[2] ? 100 : 1), Number(match[3]), match[4] === "none" ? 0 : Number(match[4]));
			var alpha = match[5] === undefined ? 1 : Number(match[5]) / (match[6] ? 100 : 1);
			root.style.setProperty(name, "rgba(" + rgb.join(",") + "," + alpha + ")");
			root.style.setProperty("--legacy-rgb-" + name.slice(2), rgb.join(","));
			root.style.setProperty("--legacy-alpha-" + name.slice(2), String(alpha));
		});
	}
	function upgrade(link) {
		if (link.tagName !== "LINK" || link.rel !== "stylesheet") return;
		var url = new URL(link.href, location.href);
		if (url.origin !== location.origin || !url.pathname.startsWith("/_astro/") || !url.pathname.endsWith(".css") || url.pathname.endsWith(".legacy.css")) return;
		link.addEventListener("load", function () { updateColors(true); }, { once: true });
		url.pathname = url.pathname.replace(/\.css$/, ".legacy.css");
		link.href = url.href;
	}
	function scan(node) {
		if (node.nodeType !== 1) return;
		upgrade(node);
		node.querySelectorAll('link[rel="stylesheet"]').forEach(upgrade);
	}
	scan(root);
	new MutationObserver(function (records) {
		records.forEach(function (record) {
			if (record.type === "childList") record.addedNodes.forEach(scan);
			else if (record.target === root) updateColors(false);
			else upgrade(record.target);
		});
	}).observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["href", "class", "style"] });
	window.addEventListener("load", function () { updateColors(true); }, { once: true });
	updateColors(true);
}

export async function prepareLegacyBrowser(directory = "dist") {
	const dist = resolve(directory);
	const variables = new Set();
	const assets = resolve(dist, "_astro");
	const files = (await readdir(assets)).filter((name) => name.endsWith(".css") && !name.endsWith(".legacy.css"));
	for (const name of files) {
		const result = createLegacyCss(await readFile(resolve(assets, name), "utf8"));
		result.variables.forEach((variable) => variables.add(variable));
		await writeFile(resolve(assets, name.replace(/\.css$/, ".legacy.css")), result.css);
	}
	const runtime = `(function(){${oklchToRgb.toString()};(${installLegacyStyles.toString()})(${JSON.stringify([...variables])});})();`;
	const hash = createHash("sha256").update(runtime).digest("hex").slice(0, 12);
	const filename = `legacy-browser.${hash}.js`;
	await writeFile(resolve(assets, filename), runtime);
	const selector = `<script data-legacy-styles>(function(){if(window.CSS&&CSS.supports('color','oklch(.7 .1 240)')&&CSS.supports('color','color-mix(in srgb,red,blue)'))return;if(window.__legacyBrowserRequested)return;window.__legacyBrowserRequested=true;var s=document.createElement('script');s.src='/_astro/${filename}';document.head.appendChild(s);})();</script>`;
	async function walk(folder) {
		for (const entry of await readdir(folder, { withFileTypes: true })) {
			const file = resolve(folder, entry.name);
			if (entry.isDirectory()) await walk(file);
			else if (entry.name.endsWith(".html")) {
				const html = await readFile(file, "utf8");
				if (!html.includes("<head")) continue;
				const clean = html.replace(/<script data-legacy-styles>[\s\S]*?<\/script>/g, "");
				await writeFile(file, clean.replace(/<head\b[^>]*>/i, (head) => head + selector));
			}
		}
	}
	await walk(dist);
	return { stylesheets: files.length, variables: variables.size };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
	try {
		console.log("Legacy browser assets:", await prepareLegacyBrowser());
	} catch (error) {
		console.error("Legacy browser assets failed:", error.message);
		process.exitCode = 1;
	}
}
