import fs from "fs/promises";
import path from "path";

const WIKI_ROOT = "educational-ai.wiki";
const SKIP_FILES = new Set(["_Sidebar.md", "_Footer.md", "Home.md"]);

const PAGE_ORDER = ["public-wiki", "feature-requirements", "ux-ui-design", "technical-requirements", "security-requirements"];

const PAGE_LABELS: Record<string, string> = {
	"public-wiki": "Public Wiki",
	"feature-requirements": "Feature Requirements",
	"ux-ui-design": "UX/UI Design",
	"technical-requirements": "Technical Requirements",
	"security-requirements": "Security Requirements"
};

const WORD_LABELS: Record<string, string> = {
	ux: "UX",
	ui: "UI"
};

const wikiBaseFromRemote = (remote: string) => {
	const cleaned = remote.trim().replace(/\.git$/, "");
	const ssh = cleaned.match(/^git@github\.com:(.+)$/);
	const https = cleaned.match(/^https:\/\/github\.com\/(.+)$/);
	const repo = (ssh?.[1] ?? https?.[1] ?? "").replace(/\.wiki$/, "");
	if (!repo) throw new Error(`Cannot derive wiki URL from ${remote}`);
	return `https://github.com/${repo}/wiki`;
};

const readWikiBaseUrl = async () => {
	const config = await fs.readFile(path.join(WIKI_ROOT, ".git/config"), "utf8");
	const remote = config.match(/\[remote "origin"\][^[]*?url = (.+)/)?.[1]?.trim();
	if (!remote) throw new Error("Wiki origin remote is missing");
	return wikiBaseFromRemote(remote);
};

const pageUrl = (wikiBase: string, pageName: string) => `${wikiBase}/${encodeURIComponent(pageName)}`;

const markdownLink = (label: string, url: string) => `[${label}](${url})`;

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const htmlLink = (label: string, url: string) => `<a href="${escapeHtml(url)}">${escapeHtml(label)}</a>`;

const labelFromSlug = (slug: string) => {
	const known = PAGE_LABELS[slug];
	if (known) return known;

	const words = slug
		.split("-")
		.filter(Boolean)
		.map((word) => WORD_LABELS[word] ?? `${word.charAt(0).toUpperCase()}${word.slice(1)}`);
	const joined: string[] = [];

	for (const word of words) {
		if (word === "UI" && joined.at(-1) === "UX") {
			joined[joined.length - 1] = "UX/UI";
			continue;
		}
		joined.push(word);
	}

	return joined.join(" ");
};

const pageRank = (filename: string) => {
	const index = PAGE_ORDER.indexOf(filename.replace(/\.md$/i, ""));
	return index === -1 ? PAGE_ORDER.length : index;
};

const readFeatureNames = async () => {
	const entries = await fs.readdir(path.resolve("src/lib/features"), { withFileTypes: true }).catch((error: { code?: string }) => {
		if (error.code === "ENOENT") return [];
		throw error;
	});
	return entries
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort((a, b) => b.length - a.length || a.localeCompare(b));
};

export async function updateSidebar() {
	const wikiBase = await readWikiBaseUrl();
	const featureNames = await readFeatureNames();
	const entries = await fs.readdir(WIKI_ROOT, { withFileTypes: true });
	const pages = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".md") && !SKIP_FILES.has(entry.name)).map((entry) => entry.name);
	const grouped = new Map<string, string[]>();
	const loose: string[] = [];

	for (const fileName of pages) {
		const feature = featureNames.find((name) => fileName.startsWith(`${name}-`));
		if (!feature) {
			loose.push(fileName);
			continue;
		}
		grouped.set(feature, [...(grouped.get(feature) ?? []), fileName]);
	}

	const lines = [markdownLink("Educational AI", pageUrl(wikiBase, "Home")), ""];
	const loosePages = loose.sort((a, b) => pageRank(a) - pageRank(b) || a.localeCompare(b));

	for (const fileName of loosePages) {
		const slug = fileName.replace(/\.md$/i, "");
		lines.push(`- ${markdownLink(labelFromSlug(slug), pageUrl(wikiBase, slug))}`);
	}
	if (loosePages.length > 0) lines.push("");

	for (const feature of [...featureNames].sort((a, b) => a.localeCompare(b))) {
		const files = grouped.get(feature);
		if (!files?.length) continue;
		files.sort((a, b) => pageRank(a.slice(feature.length + 1)) - pageRank(b.slice(feature.length + 1)) || a.localeCompare(b));
		lines.push("<details>", `<summary>${escapeHtml(labelFromSlug(feature))}</summary>`, "<p>", "");
		for (const fileName of files) {
			const pageSlug = fileName.slice(feature.length + 1).replace(/\.md$/i, "");
			lines.push(htmlLink(labelFromSlug(pageSlug), pageUrl(wikiBase, fileName.replace(/\.md$/i, ""))), "");
		}
		lines.push("</p>", "</details>", "");
	}

	await fs.writeFile(path.join(WIKI_ROOT, "_Sidebar.md"), `${lines.join("\n").trimEnd()}\n`);
}
