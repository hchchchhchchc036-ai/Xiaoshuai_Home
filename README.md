# 小衰的小屋 · 2.0

基于 [Mizuki](https://github.com/matsuzaka-yuki/Mizuki) 定制的中文个人博客，记录 Java、Python 与 Agent 开发，分享项目、学习和生活。

<img src="public/images/personal/avatar.jpg" width="96" alt="小衰的头像">

[访问网站](https://xiaoshuai666.com/) · [Gitee 仓库](https://gitee.com/xiaoshuai456/personal-blog) · [GitHub 仓库](https://github.com/hchchchhchchc036-ai/-)

## 网站功能

1. 中文界面、个人头像与背景轮播，支持明暗主题和桌面、手机布局。
2. Markdown / MDX 文章、分类标签、目录、全文搜索，以及 RSS / Atom 订阅。
3. 项目作品、技术栈、常用 AI 工具和倒序成长时间线。
4. 日记、追番、个人设备、友链与相册入口；追番保留人工核对的进度覆盖。
5. 本地音乐播放器、Live2D 看板姬、响应式图片与图片灯箱。

相册内容待后续补充。**2.0 是个人网站版本**，与 `package.json` 中的模板版本号独立。

## 技术栈

Astro 7、Svelte 5、TypeScript、Tailwind CSS 4、Swup、Pagefind、Expressive Code 和 Fancybox。采用静态构建，输出目录为 `dist/`。

## 本地运行

环境要求：Node.js **22.12.0 或更高版本**，pnpm **11.5.3**。本项目已在 Node.js 22.20.0 下验证。

```bash
git clone https://gitee.com/xiaoshuai456/personal-blog.git xiaoshuai-blog
cd xiaoshuai-blog
pnpm install --frozen-lockfile
```

在项目根目录新建 `.env`，使用本仓库的本地文章：

```dotenv
ENABLE_CONTENT_SYNC=false
```

```bash
pnpm dev
```

开发地址：<http://localhost:3000/>。全文搜索索引在生产构建时生成；检查完整搜索体验请先构建再预览。

## 检查与构建

| 命令 | 用途 |
| --- | --- |
| `pnpm check` | Astro 组件与类型检查 |
| `pnpm type-check` | TypeScript 检查 |
| `pnpm test` | 回归与加密测试 |
| `pnpm build` | 同步追番、构建页面、生成搜索索引并检查样式、字体和个人化内容 |
| `pnpm preview` | 预览 `dist/` 中的生产网站 |

构建需要联网读取公开 B 站追番列表。`src/data/bilibili-data.json` 为生成文件，不提交 Git；截图核对的进度保存在 `src/data/bilibili-overrides.json`。当前使用公开数据，无需 B 站登录凭证。

## 内容与配置

| 位置 | 内容 |
| --- | --- |
| `src/content/posts/` | 博客文章 |
| `src/content/spec/` | 关于、友链等说明内容 |
| `src/config/` | 网站信息、导航、头像、背景、音乐与页脚配置 |
| `src/data/` | 项目、技能、AI 工具、时间线、日记、设备和友链数据 |
| `public/images/`、`public/assets/music/` | 图片和音乐；图片处理镜像保存在 `src/assets/public/` |

添加文章：`pnpm new-post -- <文件名>`。替换个人图片后执行 `pnpm prepare-images` 更新图片镜像，再构建网站。

复用本项目时，需要调整个人资料、链接、域名、备案和内容。构建中的 `scripts/check-personalization.mjs` 会校验小衰的个人信息，也需同步调整。

## 宝塔部署

1. 在本地运行 `pnpm build`，确认构建和检查通过。
2. 在宝塔创建或打开绑定域名的 Nginx 静态网站，更新已有网站前备份原文件。
3. 将 `dist/` **里面的文件**上传到网站根目录，确保根目录直接包含 `index.html`。
4. 默认首页设为 `index.html`，保留生成的页面目录，无需将所有请求重写到首页。
5. 配置域名解析和 HTTPS，检查首页、文章、搜索、音乐及备案链接。

服务器无需安装 Node.js，也无需开放 3000 端口。详细说明见 [宝塔部署指南](BAOTA-DEPLOY.zh.md)。

## 浏览器兼容

现代浏览器继续使用原始 CSS 和 JS。生产构建额外生成旧浏览器样式；不支持 `oklch()` 或 `color-mix()` 的浏览器才会加载兼容资源。兼容分支转换主题色、同步明暗主题和主题色调整，并为 Chrome 109 降低 CSS 语法要求。

部分高级渐变和相对颜色效果在兼容分支简化。已验证兼容资源选择、音乐播放、主题切换、文章导航与移动布局；由于未取得原 Win7 电脑和真实 Chrome 109 测试环境，真机效果仍需复验。

## Git 提交范围

`.gitignore` 排除依赖、构建产物、缓存、真实环境变量、私钥、日志、部署 ZIP、模板备份和本地审查材料。源码、测试、依赖锁文件、环境变量示例与网站使用的图片、音乐保留在仓库中。

## 来源与许可

基于 [Mizuki](https://github.com/matsuzaka-yuki/Mizuki)，并参考 [LyraVoid/Mizuki](https://github.com/LyraVoid/Mizuki) 的模板更新。

代码遵循 [Apache License 2.0](LICENSE)。项目保留 [第三方许可声明](THIRD_PARTY_NOTICES.md) 与 [MIT 许可文本](LICENSE.MIT)。

第三方图片、音乐和模型的权利归各自作者所有；代码许可证不代表这些素材已获得再分发授权。
