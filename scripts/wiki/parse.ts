import fs from "node:fs/promises";
import path from "path";

export async function findDocs(basePath: string): Promise<{ featureNames: string[]; files: string[] }> {
	const files: string[] = [];
	const featurePath = `${basePath}/src/lib/features`;
	const featureNames = await fs.readdir(featurePath, { recursive: false });
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
		const title = content.split("## Metadata")[0].trim();
		const feature = featureNames.filter((feature) => fileName.includes(feature)).sort((a, b) => b.length - a.length)[0];
		const metadata = content.split("## Metadata")[1];
		const rest = metadata.split("##").slice(1).join("##");
		if (feature) {
			files.push({
				href: `${feature}-${path.basename(fileName)}`,
				title: title,
				content: rest ? `${title}\n\n##${rest}` : ""
			});
		}
	}
	for (const feature of featureNames) {
		const featureDir = path.join("educational-ai.wiki", feature);
		const stats = await fs.stat(featureDir).catch(() => null);
		if (stats?.isDirectory()) await fs.rm(featureDir, { recursive: true });
	}
	for (const file of files) {
		const filePath = path.join("educational-ai.wiki", file.href);
		await fs.mkdir(path.dirname(filePath), { recursive: true });
		await fs.writeFile(filePath, file.content, {
			encoding: "utf8"
		});
	}
}
