import { parseArgs } from 'util';
import { findDocs, removeMetadata } from './parse';
import { updateSidebar } from './sidebar';

export const run = async () => {
	const path = process.cwd();
	const files = await findDocs(path);
	await removeMetadata(files.featureNames, files.files);
	await updateSidebar();
};

run();
