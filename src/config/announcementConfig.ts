import type { AnnouncementConfig } from "../types/config";

// 公告栏配置
export const announcementConfig: AnnouncementConfig = {
	title: "", // 公告标题，填空使用i18n字符串Key.announcement
	content: "欢迎来到小衰的小屋！这里记录我的技术实践与生活。", // 公告内容
	closable: true, // 允许用户关闭公告
	link: {
		enable: true, // 启用链接
		text: "认识小衰", // 链接文本
		url: "/about/", // 链接 URL
		external: false, // 内部链接
	},
};
