import type { NavBarConfig } from "../types/config";
import { LinkPreset } from "../types/config";

export const navBarConfig: NavBarConfig = {
    links: [
        LinkPreset.Home, LinkPreset.Archive,
        { name: "我的", url: "#", icon: "material-symbols:person", children: [LinkPreset.Diary, LinkPreset.Albums, LinkPreset.Anime, { name: "我的设备", url: "/devices/", icon: "material-symbols:devices" }] },
        { name: "技术探索", url: "#", icon: "material-symbols:code", children: [LinkPreset.Projects, LinkPreset.Skills, LinkPreset.AITools, LinkPreset.Timeline] },
        { name: "关于小衰", url: "#", icon: "material-symbols:info", children: [LinkPreset.About, LinkPreset.Friends] },
        { name: "联系我", url: "#", icon: "material-symbols:link", children: [
            { name: "代码主页", url: "https://github.com/hchchchhchchc036-ai", external: true, icon: "fa7-brands:github" },
            { name: "哔哩哔哩", url: "https://space.bilibili.com/445289509", external: true, icon: "fa7-brands:bilibili" },
            { name: "邮箱", url: "mailto:3089445096@qq.com", external: true, icon: "material-symbols:mail" },
        ] },
    ],
};
