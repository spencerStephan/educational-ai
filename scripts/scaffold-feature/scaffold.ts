import fs from 'node:fs/promises';
import path from 'path';

export const scaffold = async (
	featureName: string,
	featurePath: string,
	regenerate: boolean,
	folders: string[] | undefined
) => {
	if (regenerate) {
		await fs.rm(path.join(featurePath, featureName), { recursive: true });
	}
	await createFolders(featureName, featurePath, folders);
};

export const checkIfFeatureExists = async (featureName: string, basePath: string) => {
	const featurePath = path.join(basePath, featureName);
	return fs
		.stat(featurePath)
		.then((stats) => stats.isDirectory())
		.catch(() => false);
};

export const createFolders = async (
	featureName: string,
	featurePath: string,
	additionalFolders?: string[]
) => {
	const folders = ['tests', 'components', 'docs', ...(additionalFolders || [])];
	const testFolders = ['unit', 'integration', 'e2e'];
	await fs.mkdir(path.join(featurePath, featureName));

	for (const folder of folders) {
		await fs.mkdir(path.join(featurePath, featureName, folder));
	}

	for (const folder of testFolders) {
		await fs.mkdir(path.join(featurePath, featureName, 'tests', folder));
	}
};
