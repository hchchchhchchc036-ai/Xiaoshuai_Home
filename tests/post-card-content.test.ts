import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const ENCRYPTED_POST_HOME_CONTENT = "受保护的文章";
const module = { exports: {} };
vm.runInNewContext(ts.transpileModule(
	readFileSync(new URL("../src/utils/post-card-content.ts", import.meta.url), "utf8"),
	{ compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText, {
	exports: module.exports,
	require: (name) => {
		if (name === "@/i18n/i18nKey") return { __esModule: true, default: { postEncryptedMessage: "protected" } };
		if (name === "@/i18n/translation") return { i18n: (key) => {
			assert.equal(key, "protected");
			return ENCRYPTED_POST_HOME_CONTENT;
		} };
		throw new Error(`Unexpected import: ${name}`);
	},
});
const { getPostHomeContent, getPostPublicDescription } = module.exports;

describe("getPostHomeContent", () => {
	it("hides post content by default when a password is set", () => {
		const content = getPostHomeContent(
			{
				description: "private summary",
				password: "secret",
			},
			"private excerpt",
		);

		assert.equal(content, ENCRYPTED_POST_HOME_CONTENT);
	});

	it("shows content for password protected posts when hiding is disabled", () => {
		const content = getPostHomeContent(
			{
				description: "public summary",
				hideHomeContent: false,
				password: "secret",
			},
			"public excerpt",
		);

		assert.equal(content, "public summary");
	});

	it("shows content by default when no password is set", () => {
		const content = getPostHomeContent(
			{
				description: "",
			},
			"plain excerpt",
		);

		assert.equal(content, "plain excerpt");
	});

	it("hides content when hiding is explicitly enabled without a password", () => {
		const content = getPostHomeContent(
			{
				description: "hidden summary",
				hideHomeContent: true,
			},
			"hidden excerpt",
		);

		assert.equal(content, ENCRYPTED_POST_HOME_CONTENT);
	});
});

describe("getPostPublicDescription", () => {
	it("hides public descriptions by default when a password is set", () => {
		const description = getPostPublicDescription(
			{
				description: "private summary",
				password: "secret",
			},
			"fallback title",
		);

		assert.equal(description, ENCRYPTED_POST_HOME_CONTENT);
	});

	it("hides public descriptions when hiding is explicitly enabled", () => {
		const description = getPostPublicDescription(
			{
				description: "hidden summary",
				hideHomeContent: true,
			},
			"fallback title",
		);

		assert.equal(description, ENCRYPTED_POST_HOME_CONTENT);
	});

	it("keeps normal fallback behavior when hiding is disabled", () => {
		const description = getPostPublicDescription(
			{
				description: "",
				hideHomeContent: false,
				password: "secret",
			},
			"fallback title",
		);

		assert.equal(description, "fallback title");
	});
});
