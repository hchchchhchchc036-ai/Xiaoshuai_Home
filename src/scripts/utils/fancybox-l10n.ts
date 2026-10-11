/** Fancybox 语言加载，移植自上游 c06f0003 的本地化修复。 */
export type FancyboxL10n = Record<string, any>;

export function normalizeLangCode(lang: string | null | undefined): string | null {
	if (!lang) return null;
	const normalized = lang.trim().replace(/-/g, "_");
	const lower = normalized.toLowerCase();
	if (lower.startsWith("zh")) return "zh_CN";
	if (lower.startsWith("de")) return "de_DE";
	if (lower.startsWith("es")) return "es_ES";
	if (lower.startsWith("fr")) return "fr_FR";
	if (lower.startsWith("it")) return "it_IT";
	if (lower.startsWith("lv")) return "lv_LV";
	if (lower.startsWith("tr")) return "tr_TR";
	if (lower.startsWith("uk")) return "uk_UA";
	if (lower.startsWith("en")) return null;
	return normalized;
}

// 保留静态导入路径，让 Vite 将语言文件打包为生产环境可用的模块。
const l10nLoaders: Record<string, () => Promise<any>> = {
	zh_CN: () => import("@fancyapps/ui/dist/fancybox/l10n/zh_CN.js"),
	de_DE: () => import("@fancyapps/ui/dist/fancybox/l10n/de_DE.js"),
	es_ES: () => import("@fancyapps/ui/dist/fancybox/l10n/es_ES.js"),
	fr_FR: () => import("@fancyapps/ui/dist/fancybox/l10n/fr_FR.js"),
	it_IT: () => import("@fancyapps/ui/dist/fancybox/l10n/it_IT.js"),
	lv_LV: () => import("@fancyapps/ui/dist/fancybox/l10n/lv_LV.js"),
	tr_TR: () => import("@fancyapps/ui/dist/fancybox/l10n/tr_TR.js"),
	uk_UA: () => import("@fancyapps/ui/dist/fancybox/l10n/uk_UA.js"),
};

export async function loadFancyboxL10n(lang?: string): Promise<FancyboxL10n | null> {
	const targetLang = lang || (typeof document !== "undefined" ? document.documentElement.lang : "");
	const langCode = normalizeLangCode(targetLang);
	if (!langCode || !Object.hasOwn(l10nLoaders, langCode)) return null;
	try {
		const module = await l10nLoaders[langCode]();
		return module.default || module[langCode] || module;
	} catch {
		return null;
	}
}
