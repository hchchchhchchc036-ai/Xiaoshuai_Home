// Skill data configuration file
// Used to manage data for the skill display page

export interface Skill {
	id: string;
	name: string;
	description: string;
	icon: string; // Iconify icon name
	category: "frontend" | "backend" | "database" | "tools" | "other";
	level: "beginner" | "intermediate" | "advanced" | "expert";
	levelLabel?: string;
	experience?: {
		years: number;
		months: number;
	};
	projects?: string[]; // Related project IDs
	certifications?: string[];
	color?: string; // Skill card theme color
}

// 按用户优先级排序；不填写未提供的年限，补充项只描述开发工具或项目实践。
export const skillsData: Skill[] = [
	{
		"id": "java",
		"name": "Java",
		"description": "面向后端业务开发，使用集合、Stream API 等基础能力编写业务逻辑。",
		"category": "backend",
		"level": "advanced",
		"levelLabel": "可独立开发",
		"icon": "material-symbols:code",
		"color": "#3B82F6"
	},
	{
		"id": "spring-cloud",
		"name": "Spring Cloud",
		"description": "可以独立开展微服务项目开发，实践服务调用、网关与配置中心。",
		"category": "backend",
		"level": "advanced",
		"levelLabel": "可独立开发",
		"icon": "material-symbols:cloud",
		"color": "#3B82F6"
	},
	{
		"id": "spring-boot",
		"name": "Spring Boot",
		"description": "可以独立开发后端业务接口，完成应用配置和功能集成。",
		"category": "backend",
		"level": "advanced",
		"levelLabel": "可独立开发",
		"icon": "material-symbols:api",
		"color": "#3B82F6"
	},
	{
		"id": "python-agent",
		"name": "Python 智能体开发",
		"description": "使用 Python 开发智能体应用，结合大模型服务完成工具与业务集成。",
		"category": "backend",
		"level": "advanced",
		"levelLabel": "可开发智能体",
		"icon": "material-symbols:smart-toy",
		"color": "#8B5CF6"
	},
	{
		"id": "fastapi",
		"name": "FastAPI",
		"description": "在 AI 会议助手项目中使用 Python 和 FastAPI 提供媒体上传与分析接口。",
		"category": "backend",
		"level": "intermediate",
		"levelLabel": "项目实践",
		"icon": "material-symbols:bolt",
		"color": "#8B5CF6"
	},
	{
		"id": "agent",
		"name": "Agent",
		"description": "持续学习智能体的工具调用、任务编排与应用设计。",
		"category": "backend",
		"level": "beginner",
		"levelLabel": "学习中",
		"icon": "material-symbols:psychology",
		"color": "#8B5CF6"
	},
	{
		"id": "rag",
		"name": "RAG",
		"description": "学习检索增强生成，探索知识库检索与大模型回答的结合。",
		"category": "backend",
		"level": "beginner",
		"levelLabel": "学习中",
		"icon": "material-symbols:manage-search",
		"color": "#8B5CF6"
	},
	{
		"id": "redis",
		"name": "Redis",
		"description": "可以在后端项目中独立使用 Redis，实现缓存相关功能。",
		"category": "database",
		"level": "advanced",
		"levelLabel": "可独立开发",
		"icon": "material-symbols:cached",
		"color": "#059669"
	},
	{
		"id": "mysql",
		"name": "MySQL",
		"description": "可以独立完成业务数据库开发，编写 SQL 并实现数据查询与维护。",
		"category": "database",
		"level": "advanced",
		"levelLabel": "可独立开发",
		"icon": "material-symbols:storage",
		"color": "#059669"
	},
	{
		"id": "mybatis-plus",
		"name": "MyBatis-Plus",
		"description": "可以独立使用 MyBatis-Plus 完成数据访问、条件查询与分页。",
		"category": "backend",
		"level": "advanced",
		"levelLabel": "可独立开发",
		"icon": "material-symbols:table-chart",
		"color": "#3B82F6"
	},
	{
		"id": "ruoyi",
		"name": "若依",
		"description": "可以基于若依独立开发业务模块，结合既有权限体系完成后台功能。",
		"category": "backend",
		"level": "advanced",
		"levelLabel": "可独立开发",
		"icon": "material-symbols:dashboard",
		"color": "#3B82F6"
	},
	{
		"id": "docker",
		"name": "Docker",
		"description": "能够日常使用容器，完成应用运行与常见环境配置。",
		"category": "tools",
		"level": "intermediate",
		"levelLabel": "日常使用",
		"icon": "material-symbols:deployed-code",
		"color": "#64748B"
	},
	{
		"id": "nodejs",
		"name": "Node.js",
		"description": "能够部署并运行 Node.js 项目，配置应用启动环境。",
		"category": "tools",
		"level": "intermediate",
		"levelLabel": "可部署",
		"icon": "material-symbols:terminal",
		"color": "#64748B"
	},
	{
		"id": "nginx",
		"name": "Nginx",
		"description": "能够部署 Nginx，配置网站访问与应用入口。",
		"category": "tools",
		"level": "intermediate",
		"levelLabel": "可部署",
		"icon": "material-symbols:dns",
		"color": "#64748B"
	},
	{
		"id": "linux",
		"name": "Linux",
		"description": "掌握部分 Linux 基础，能够进行常见命令操作并学习服务管理。",
		"category": "tools",
		"level": "beginner",
		"levelLabel": "基础使用",
		"icon": "material-symbols:terminal",
		"color": "#64748B"
	},
	{
		"id": "git",
		"name": "Git",
		"description": "在项目实践中使用代码仓库管理源码，通过 GitHub 与 Gitee 展示作品。",
		"category": "tools",
		"level": "intermediate",
		"levelLabel": "开发工具",
		"icon": "material-symbols:commit",
		"color": "#64748B"
	},
	{
		"id": "maven",
		"name": "Maven",
		"description": "用于 Java 项目的依赖管理与构建，作为 Spring 生态开发工具链的一部分。",
		"category": "tools",
		"level": "intermediate",
		"levelLabel": "开发工具",
		"icon": "material-symbols:build",
		"color": "#64748B"
	},
	{
		"id": "rest-api",
		"name": "REST API",
		"description": "在 Java 后端项目中设计业务接口，衔接前端请求与数据处理。",
		"category": "backend",
		"level": "advanced",
		"levelLabel": "开发实践",
		"icon": "material-symbols:integration-instructions",
		"color": "#3B82F6"
	},
	{
		"id": "vue",
		"name": "Vue",
		"description": "正在学习组件化开发、页面交互与前后端接口联调。",
		"category": "frontend",
		"level": "beginner",
		"levelLabel": "学习中",
		"icon": "material-symbols:web",
		"color": "#10B981"
	},
	{
		"id": "ssm",
		"name": "SSM",
		"description": "正在学习 Spring、Spring MVC 与 MyBatis 的协作及项目整合。",
		"category": "backend",
		"level": "beginner",
		"levelLabel": "学习中",
		"icon": "material-symbols:layers",
		"color": "#3B82F6"
	},
	{
		"id": "rabbitmq",
		"name": "RabbitMQ",
		"description": "学习消息队列与异步处理，探索服务间消息传递。",
		"category": "backend",
		"level": "beginner",
		"levelLabel": "学习中",
		"icon": "material-symbols:forum",
		"color": "#3B82F6"
	},
	{
		"id": "elasticsearch",
		"name": "Elasticsearch",
		"description": "正在学习搜索引擎、索引与全文检索的基本使用。",
		"category": "database",
		"level": "beginner",
		"levelLabel": "学习中",
		"icon": "material-symbols:search",
		"color": "#059669"
	}
];
