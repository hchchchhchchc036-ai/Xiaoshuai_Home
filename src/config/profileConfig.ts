import type { ProfileConfig } from "../types/config";

export const profileConfig: ProfileConfig = {
    avatar: "/images/personal/avatar.jpg",
    name: "小衰",
    bio: "全栈开发工程师 · Java / Python · 智能体开发",
    typewriter: { enable: true, speed: 80 },
    links: [
        { name: "代码主页", icon: "fa7-brands:github", url: "https://github.com/hchchchhchchc036-ai" },
        { name: "码云仓库", icon: "simple-icons:gitee", url: "https://gitee.com/xiaoshuai456/projects" },
        { name: "邮箱", icon: "material-symbols:mail", url: "mailto:3089445096@qq.com" },
        { name: "哔哩哔哩", icon: "fa7-brands:bilibili", url: "https://space.bilibili.com/445289509" },
    ],
};
