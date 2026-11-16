import fs from "node:fs/promises";
import path from "path";
import { validate } from "./validate";

const WIKI_ROOT = "educational-ai.wiki";
const GENERATED_DOCS = ["feature-requirements.md", "security-requirements.md", "ux-ui-design.md", "public-wiki.md", "technical-requirements.md"];

const isGeneratedWikiPage = (fileName: string) => GENERATED_DOCS.some((doc) => fileName.endsWith(`-${doc}`));

export async function findDocs(basePath: string): Promise<{ featureNames: string[]; files: string[] }> {
	const files: string[] = [];
	const featurePath = `${basePath}/src/lib/features`;
	const featureStat = await fs.stat(featurePath).catch(() => null);
	if (!featureStat?.isDirectory()) return { featureNames: [], files: [] };

	const entries = await fs.readdir(featurePath, { withFileTypes: true });
	const featureNames = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
	const features = await fs.readdir(featurePath, { recursive: true });
	for (const feature of features) {
		const currentFeaturePath = `${featurePath}/${feature}`;
		if (await fs.stat(currentFeaturePath).then((stats) => stats.isDirectory())) {
			if (feature.includes("docs")) {
				const docs = await fs.readdir(currentFeaturePath);
				for (const doc of docs) {
					files.push(`${currentFeaturePath}/${doc}`);
				}
			}
		}
	}
	return {
		featureNames: featureNames,
		files: files
	};
}

export async function removeMetadata(featureNames: string[], fileNames: string[]) {
	const files: {
		href: string;
		title: string;
		content: string;
	}[] = [];

	for (const fileName of fileNames) {
		const content = await fs.readFile(fileName, "utf8");
		const validation = await validate(content);
		if (validation.error) {
			console.error(`${fileName}: ${validation.message}`);
			continue;
		}
		const title = content.split("## Metadata")[0].trim();
		const feature = featureNames.filter((feature) => fileName.includes(feature)).sort((a, b) => b.length - a.length)[0];
		const metadata = content.split("## Metadata")[1];
		const rest = metadata.split("##").slice(1).join("##");
		const published = rest ? `${title}\n\n##${rest}` : "";
		if (feature) {
			files.push({
				href: `${feature}-${path.basename(fileName)}`,
				title: title,
				content: published
			});
		}
	}
	const keep = new Set(files.map((file) => file.href));
	const wikiEntries = await fs.readdir(WIKI_ROOT, { withFileTypes: true }).catch(() => []);
	for (const entry of wikiEntries) {
		const entryPath = path.join(WIKI_ROOT, entry.name);
		if (entry.isDirectory() && entry.name !== ".git") {
			await fs.rm(entryPath, { recursive: true });
			continue;
		}
		if (entry.isFile() && isGeneratedWikiPage(entry.name) && !keep.has(entry.name)) await fs.unlink(entryPath);
	}
	for (const file of files) {
		const filePath = path.join(WIKI_ROOT, file.href);
		await fs.mkdir(path.dirname(filePath), { recursive: true });
		await fs.writeFile(filePath, file.content, {
			encoding: "utf8"
		});
	}
}
