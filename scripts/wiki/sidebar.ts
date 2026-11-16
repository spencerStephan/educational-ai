import fs from "fs/promises";
import path from "path";

const WIKI_ROOT = "educational-ai.wiki";
const SKIP_DIRS = new Set([".git"]);
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

const pageUrl = (wikiBase: string, target: string) => {
	const pathName = target
		.replace(/^\//, "")
		.split("/")
		.map((segment) => encodeURIComponent(segment))
		.join("/");
	return `${wikiBase}/${pathName}`;
};

const markdownLink = (label: string, url: string) => `[${label}](${url})`;

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

type PageLink = {
	label: string;
	target: string;
};

type Section = {
	name: string;
	pages: PageLink[];
	children: Section[];
};

const readSection = async (directory: string, name: string, targetPrefix: string): Promise<Section> => {
	const entries = await fs.readdir(directory, { withFileTypes: true });
	const files = entries
		.filter((entry) => entry.isFile() && entry.name.endsWith(".md") && !SKIP_FILES.has(entry.name))
		.sort((a, b) => pageRank(a.name) - pageRank(b.name) || a.name.localeCompare(b.name));
	const directories = entries.filter((entry) => entry.isDirectory() && !SKIP_DIRS.has(entry.name)).sort((a, b) => a.name.localeCompare(b.name));

	const children: Section[] = [];
	for (const directoryEntry of directories) {
		children.push(await readSection(path.join(directory, directoryEntry.name), directoryEntry.name, `${targetPrefix}${directoryEntry.name}/`));
	}

	return {
		name,
		pages: files.map((file) => {
			const slug = file.name.replace(/\.md$/i, "");
			return {
				label: labelFromSlug(slug),
				target: `${targetPrefix}${slug}`
			};
		}),
		children
	};
};

const sectionHasPages = (section: Section): boolean => section.pages.length > 0 || section.children.some(sectionHasPages);

const renderSection = (section: Section, ancestors: string[], wikiBase: string): string[] => {
	const lines: string[] = [];
	const title = [...ancestors, labelFromSlug(section.name)].join(" / ");

	if (section.pages.length > 0) {
		lines.push(`**${title}**`, "");
		for (const page of section.pages) {
			lines.push(`- ${markdownLink(page.label, pageUrl(wikiBase, page.target))}`);
		}
		lines.push("");
	}

	for (const child of section.children) {
		if (!sectionHasPages(child)) continue;
		lines.push(...renderSection(child, [...ancestors, labelFromSlug(section.name)], wikiBase));
	}

	return lines;
};

export async function updateSidebar() {
	const entries = await fs.readdir(WIKI_ROOT, { withFileTypes: true });
	const rootPages = entries
		.filter((entry) => entry.isFile() && entry.name.endsWith(".md") && !SKIP_FILES.has(entry.name))
		.sort((a, b) => pageRank(a.name) - pageRank(b.name) || a.name.localeCompare(b.name));
	const folders = entries.filter((entry) => entry.isDirectory() && !SKIP_DIRS.has(entry.name)).sort((a, b) => a.name.localeCompare(b.name));

	const wikiBase = await readWikiBaseUrl();
	const lines = [markdownLink("Educational AI", pageUrl(wikiBase, "Home")), ""];

	for (const page of rootPages) {
		const slug = page.name.replace(/\.md$/i, "");
		lines.push(`- ${markdownLink(labelFromSlug(slug), pageUrl(wikiBase, slug))}`);
	}
	if (rootPages.length > 0) lines.push("");

	for (const folder of folders) {
		const section = await readSection(path.join(WIKI_ROOT, folder.name), folder.name, `/${folder.name}/`);
		if (!sectionHasPages(section)) continue;
		lines.push(...renderSection(section, [], wikiBase));
	}

	await fs.writeFile(path.join(WIKI_ROOT, "_Sidebar.md"), `${lines.join("\n").trimEnd()}\n`);
}
