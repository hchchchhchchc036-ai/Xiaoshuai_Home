export type AIToolCategory =
	| "chat"
	| "coding"
	| "image"
	| "audio"
	| "video"
	| "writing"
	| "search"
	| "other";

export type AIToolFrequency =
	| "daily"
	| "weekly"
	| "occasional"
	| "experimental";

export type LocaleString = Partial<
	Record<"en" | "zh_CN" | "zh_TW" | "ja", string>
>;

export function getLocaleString(value: LocaleString, lang: string): string {
	return value[lang as keyof LocaleString] ?? value["en"] ?? "";
}

export interface AITool {
	id: string;
	name: string;
	description: LocaleString;
	icon: string;
	category: AIToolCategory;
	frequency?: AIToolFrequency;
	url?: string;
	usage?: LocaleString;
	tags?: string[];
	color?: string;
}

// 使用场景来自用户说明；ChatGPT、Claude 优先，未提供的使用频率不展示。
export const aiToolsData: AITool[] = [
	{
		"id": "chatgpt",
		"name": "ChatGPT",
		"description": {
			"zh_CN": "用于项目开发，把想法梳理成实现步骤，辅助编写功能并解决开发问题。"
		},
		"icon": "simple-icons:openai",
		"category": "chat",
		"usage": {
			"zh_CN": "项目开发 · 优先使用"
		},
		"tags": [
			"项目开发",
			"实现协作"
		],
		"color": "#10A37F",
		"url": "https://chatgpt.com/"
	},
	{
		"id": "claude",
		"name": "Claude",
		"description": {
			"zh_CN": "用于制定项目计划和审查代码，梳理任务、检查实现并提出改进建议。"
		},
		"icon": "simple-icons:claude",
		"category": "chat",
		"usage": {
			"zh_CN": "项目计划 · 代码审查 · 优先使用"
		},
		"tags": [
			"项目计划",
			"代码审查"
		],
		"color": "#D97757",
		"url": "https://claude.ai/"
	},
	{
		"id": "deepseek",
		"name": "DeepSeek",
		"description": {
			"zh_CN": "用于学习技术知识和排查报错，帮助理解概念、分析问题并寻找解决思路。"
		},
		"icon": "simple-icons:deepseek",
		"category": "chat",
		"usage": {
			"zh_CN": "技术学习 · 排错"
		},
		"tags": [
			"学习辅助",
			"问题排查"
		],
		"color": "#4D6BFE",
		"url": "https://chat.deepseek.com/"
	},
	{
		"id": "glm",
		"name": "GLM（智谱清言）",
		"description": {
			"zh_CN": "用于技术学习和问题排查，辅助理解知识点、分析日志与整理解决方案。"
		},
		"icon": "material-symbols:school",
		"category": "chat",
		"usage": {
			"zh_CN": "技术学习 · 排错"
		},
		"tags": [
			"学习辅助",
			"问题排查"
		],
		"color": "#2563EB",
		"url": "https://chatglm.cn/"
	},
	{
		"id": "cursor",
		"name": "Cursor",
		"description": {
			"zh_CN": "在编程过程中辅助编写和修改代码，配合项目需求推进功能实现。"
		},
		"icon": "simple-icons:cursor",
		"category": "coding",
		"usage": {
			"zh_CN": "编程开发"
		},
		"tags": [
			"AI 编程",
			"功能开发"
		],
		"color": "#52525B",
		"url": "https://cursor.com/"
	},
	{
		"id": "trae",
		"name": "TRAE",
		"description": {
			"zh_CN": "用于日常编程，协助编写项目代码、实现功能和调整已有逻辑。"
		},
		"icon": "simple-icons:trae",
		"category": "coding",
		"usage": {
			"zh_CN": "编程开发"
		},
		"tags": [
			"AI 编程",
			"项目实践"
		],
		"color": "#10B981",
		"url": "https://www.trae.cn/"
	},
	{
		"id": "codebuddy",
		"name": "CodeBuddy",
		"description": {
			"zh_CN": "用于辅助编程，结合业务需求编写代码并推进项目开发。"
		},
		"icon": "simple-icons:codebuddy",
		"category": "coding",
		"usage": {
			"zh_CN": "编程开发"
		},
		"tags": [
			"AI 编程",
			"项目实践"
		],
		"color": "#0284C7",
		"url": "https://www.codebuddy.cn/"
	}
];
