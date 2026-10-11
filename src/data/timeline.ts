import type { TimelineItem } from "../components/features/timeline/types";

// 用户提供的单月里程碑，按发生时间排列，不推测具体日期或持续时长。
export const timelineData: TimelineItem[] = [
	{
		"id": "programming-interest",
		"title": "对编程产生兴趣",
		"description": "开始对编程产生兴趣，开启探索代码与软件开发的旅程。",
		"type": "education",
		"startDate": "2020-05",
		"endDate": "2020-05",
		"skills": [
			"编程启蒙"
		]
	},
	{
		"id": "learn-java",
		"title": "开始学习 Java",
		"description": "开始学习 Java，逐步进入后端开发与 Spring 生态。",
		"type": "education",
		"startDate": "2021-09",
		"endDate": "2021-09",
		"skills": [
			"Java"
		]
	},
	{
		"id": "high-school-graduation",
		"title": "高中毕业",
		"description": "完成高中阶段学习，迎来新的学习与成长阶段。",
		"type": "education",
		"startDate": "2025-06",
		"endDate": "2025-06"
	},
	{
		"id": "first-independent-project",
		"title": "独立完成项目",
		"description": "独立完成项目，将学到的开发知识应用到完整的项目实践中。",
		"type": "project",
		"startDate": "2025-12",
		"endDate": "2025-12",
		"skills": [
			"项目实践"
		]
	},
	{
		"id": "anhui-skills-award",
		"title": "获得安徽省职业院校技能大赛三等奖",
		"description": "在安徽省职业院校技能大赛中获得三等奖。",
		"type": "achievement",
		"startDate": "2026-01",
		"endDate": "2026-01",
		"featured": true,
		"color": "#D97706"
	},
	{
		"id": "start-agent-development",
		"title": "开始开发 Agent",
		"description": "开始开展智能体开发，探索 AI 与软件开发的结合。",
		"type": "project",
		"startDate": "2026-04",
		"endDate": "2026-04",
		"skills": [
			"Agent",
			"Python"
		]
	},
	{
		"id": "agent-java-integration",
		"title": "独立完成 Agent 与传统 Java 的结合",
		"description": "独立完成智能体与传统 Java 应用的结合，推进 AI 能力在业务系统中的应用。",
		"type": "project",
		"startDate": "2026-09",
		"endDate": "2026-09",
		"skills": [
			"Agent",
			"Java"
		]
	}
];
