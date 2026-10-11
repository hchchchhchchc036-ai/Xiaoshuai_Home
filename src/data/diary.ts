// 日记数据配置
// 用于管理日记页面的数据

export interface DiaryItem {
	id: number;
	content: string;
	date: string;
	images?: string[];
	location?: string;
	mood?: string;
	tags?: string[];
}

// 小屋日记
const diaryData: DiaryItem[] = [
	{
		id: 1,
		date: "2026-10-12T00:00:00+08:00",
		content: "今天继续搭建「小衰的小屋」。从 Mizuki 模板出发，把页面换成中文，整理了自己的文章、项目、技术栈和成长时间线。背景图放大后有些模糊，又用 AI 做了一轮清晰度增强。追番页也遇到了一个小坑：B 站公开接口把番剧都归到「在看」，却没有返回观看进度，最后对照自己的截图补齐了 13 部番剧，分成已看完 7 部、在看 6 部。今天还把背景音乐换成宇多田光的《One Last Kiss》，填上手机、电脑和服务器，给页脚加上备案号。一个个占位内容换成自己的东西，小屋终于越来越像我的个人网站了。接下来继续打磨界面，也把学习 Java、Python 和 Agent 的过程慢慢记录下来。",
		mood: "充实",
		tags: ["建站记录", "个人博客", "开发日常"],
	},
];

// 获取日记列表（按时间倒序）
export const getDiaryList = (limit?: number) => {
	const sortedData = [...diaryData].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	);

	if (limit && limit > 0) {
		return sortedData.slice(0, limit);
	}

	return sortedData;
};

// 获取所有标签
export const getAllTags = () => {
	const tags = new Set<string>();
	for (const item of diaryData) {
		if (item.tags) {
			for (const tag of item.tags) {
				tags.add(tag);
			}
		}
	}
	return Array.from(tags).sort();
};
