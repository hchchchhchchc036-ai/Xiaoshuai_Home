import type { FullscreenWallpaperConfig } from "../types/config";

export const fullscreenWallpaperConfig: FullscreenWallpaperConfig = {
	enable: true,
	src: {
		desktop: [
			"/images/personal/background-1-ai.webp",
			"/images/personal/background-2-ai.webp",
			"/images/personal/background-3-ai.webp",
			"/images/personal/background-4-ai.webp",
		],
		mobile: [
			"/images/personal/background-1-ai.webp",
			"/images/personal/background-2-ai.webp",
			"/images/personal/background-3-ai.webp",
			"/images/personal/background-4-ai.webp",
		],
	},
	position: "center",
	carousel: {
		enable: true,
		interval: 5,
	},
	zIndex: -1,
	opacity: 0.8,
	blur: 1,
	switchable: true,
	overlay: {
		opacity: 0.8, // 壁纸不透明度，0-1
		blur: 1.5, // 背景模糊半径（px）
		cardOpacity: 0.8, // 卡片不透明度，0-1
		switchable: {
			opacity: true,
			blur: true,
			cardOpacity: true,
		},
	},
	fullscreen: {
		switchable: {
			opacity: true,
			blur: true,
		},
	},
};
