// Project data configuration file
// Used to manage data for the project display page

export interface Project {
	id: string;
	title: string;
	description: string;
	image: string;
	category: "web" | "mobile" | "desktop" | "other";
	techStack: string[];
	status?: "completed" | "in-progress" | "planned";
	liveDemo?: string;
	sourceCode?: string;
	visitUrl?: string;
	startDate?: string;
	endDate?: string;
	featured?: boolean;
	tags?: string[];
	showImage?: boolean;
}

// 介绍依据各仓库 README；状态与起始日期尚未确认，暂不展示。
export const projectsData: Project[] = [
	{
		id: "520-confession",
		title: "520 表白网站",
		description: "使用 HTML、CSS 和 JavaScript 构建的互动表白网页。输入双方姓名即可生成专属内容，通过开场动画、相识统计、表白清单与玫瑰花田串联三屏体验，搭配花瓣、庆祝动画和背景音乐，无需后端即可运行。",
		image: "",
		category: "web",
		techStack: ["HTML", "CSS", "JavaScript"],
		sourceCode: "https://gitee.com/xiaoshuai456/5201314",
	},
	{
		id: "ai-meeting-assistant",
		title: "AI 会议助手",
		description: "面向音视频会议记录的智能整理工具。前端提供语音输入、摄像头情绪感知和媒体文件上传；后端通过 FastAPI、Whisper 与 MoviePy 完成语音转录及视频音频提取，生成会议摘要、大纲、待办和关键词，支持导出 Markdown 与图片。",
		image: "",
		category: "web",
		techStack: ["Python", "FastAPI", "Whisper", "MoviePy"],
		sourceCode: "https://gitee.com/xiaoshuai456/trae-project",
	},
	{
		id: "deepseek-harness",
		title: "DeepSeek Harness 桌面版",
		description: "基于本地服务与 Electron 的 Windows AI 编程助手。内置视觉识别、工作区文件索引、增强侧边栏、自动化调度和 UI 生成五个插件，提供代码编辑器与终端；安装后可直接启动，配置 DeepSeek API Key 即可使用，并支持本地服务异常自动重启。",
		image: "/images/projects/deepseek-harness.png",
		category: "desktop",
		techStack: ["Electron", "DeepSeek API", "Modlens", "插件系统"],
		sourceCode: "https://gitee.com/xiaoshuai456/deepseekharness",
		featured: true,
	},
];

// Get project statistics
export const getProjectStats = () => {
	const total = projectsData.length;
	const completed = projectsData.filter((p) => p.status === "completed").length;
	const inProgress = projectsData.filter(
		(p) => p.status === "in-progress",
	).length;
	const planned = projectsData.filter((p) => p.status === "planned").length;

	return {
		total,
		byStatus: {
			completed,
			inProgress,
			planned,
		},
	};
};

// Get projects by category
export const getProjectsByCategory = (category?: string) => {
	if (!category || category === "all") {
		return projectsData;
	}
	return projectsData.filter((p) => p.category === category);
};

// Get featured projects
export const getFeaturedProjects = () => {
	return projectsData.filter((p) => p.featured);
};

// Get all tech stacks
export const getAllTechStack = () => {
	const techSet = new Set<string>();
	projectsData.forEach((project) => {
		project.techStack.forEach((tech) => {
			techSet.add(tech);
		});
	});
	return Array.from(techSet).sort();
};
