import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const read = (file) => readFileSync(new URL(file, root), "utf8");

for (const page of ["", "about/", "projects/", "skills/", "timeline/", "friends/", "devices/", "ai-tools/", "diary/", "albums/", "anime/", "archive/", "rss/", "atom/"]) {
	const html = read(`dist/${page}index.html`);
	assert.match(html, /<html\b[^>]*lang="zh-CN"/);
	assert.match(html, /小衰的小屋/);
	assert.doesNotMatch(html, /まつざか|わたしの部屋|One demo website|Welcome to Mizuki/);
	assert.doesNotMatch(html, /View all posts|Desktop banner image|Mobile banner image/);
}

const home = read("dist/index.html");
assert.ok(home.includes("https://github.com/hchchchhchchc036-ai"));
assert.ok(home.includes("mailto:3089445096@qq.com"));
assert.ok(home.includes("https://space.bilibili.com/445289509"));
assert.ok(home.includes("欢迎来到小衰的小屋"));
assert.ok(read("dist/rss.xml").includes("https://xiaoshuai666.com/"));
assert.ok(existsSync(fileURLToPath(new URL("dist/pagefind/pagefind.js", root))));

const friends = read("dist/friends/index.html");
assert.ok(friends.includes("秋晓桃の神秘小窝"));
assert.ok(friends.includes("https://qiuxiaotao.com/"));
assert.ok(friends.includes("/images/friends/qiuxiaotao.png"));
assert.ok(existsSync(fileURLToPath(new URL("dist/images/friends/qiuxiaotao.png", root))));
const emptyFriends = friends.match(/<div\b(?=[^>]*id="no-results")[^>]*>/)?.[0];
assert.ok(emptyFriends);
assert.match(emptyFriends, /class="[^"]*\bhidden\b/);

const devices = read("dist/devices/index.html");
for (const name of ["vivo X100 Pro", "戴尔 G15 5510", "阿里云服务器", "2 核 CPU / 2 GB 内存"]) {
	assert.ok(devices.includes(name));
}
assert.ok(read("dist/diary/index.html").includes("今天继续搭建「小衰的小屋」"));
assert.ok(home.includes("皖ICP备2026005708号"));
assert.ok(home.includes("https://beian.miit.gov.cn/"));
const timeline = read("dist/timeline/index.html");
assert.equal((timeline.match(/class="timeline-entry\b/g) ?? []).length, 7);
assert.ok(timeline.includes("安徽省职业院校技能大赛三等奖"));
for (const month of ["2020年5月", "2021年9月", "2025年6月", "2025年12月", "2026年1月", "2026年4月", "2026年9月"]) {
	assert.ok(timeline.includes(month), `timeline: ${month}`);
}
assert.ok(!timeline.includes("0 个月"));
const skills = read("dist/skills/index.html");
assert.equal((skills.match(/class="skill-card\b/g) ?? []).length, 22);
for (const name of ["Java", "Spring Cloud", "Spring Boot", "Python 智能体开发", "MySQL", "Redis", "Agent", "RAG"]) {
	assert.ok(skills.includes(name));
}
assert.ok(skills.includes("可独立开发"));
assert.ok(skills.includes("学习中"));
const aiTools = read("dist/ai-tools/index.html");
assert.equal((aiTools.match(/class="ai-tool-card\b/g) ?? []).length, 7);
for (const name of ["ChatGPT", "Claude", "DeepSeek", "GLM（智谱清言）", "Cursor", "TRAE", "CodeBuddy"]) {
	assert.ok(aiTools.includes(name));
}
assert.ok(aiTools.indexOf("ChatGPT") < aiTools.indexOf("Claude"));
assert.ok(aiTools.indexOf("Claude") < aiTools.indexOf("DeepSeek"));
const projects = read("dist/projects/index.html");
for (const repo of ["5201314", "trae-project", "deepseekharness"]) {
	assert.ok(projects.includes(`https://gitee.com/xiaoshuai456/${repo}`));
}
assert.ok(projects.includes("/images/projects/deepseek-harness.png"));
assert.ok(existsSync(fileURLToPath(new URL("dist/images/projects/deepseek-harness.png", root))));
assert.match(read("src/config/musicConfig.ts"), /enable: true/);
assert.match(read("src/config/pioConfig.ts"), /models: \["\/pio\/models\/NOIR\/noir\.model3\.json"\]/);
console.log("Verified Chinese pages, personal links, empty states, feeds, search, and retained mascot.");
