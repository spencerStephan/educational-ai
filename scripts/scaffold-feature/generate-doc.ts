import fs from 'node:fs/promises';
import path from 'node:path';
import { generateId } from './shared';

const TEMPLATE_FOLDER = './templates/documentation';

const FEATURE_REQUIREMENTS_TEMPLATE = `${TEMPLATE_FOLDER}/feature-requirements-document.md`;

const SECURITY_REQUIREMENTS_TEMPLATE = `${TEMPLATE_FOLDER}/security-requirements-document.md`;

const DESIGN_DOCUMENT_TEMPLATE = `${TEMPLATE_FOLDER}/ux-ui-design-document.md`;

const PUBLIC_WIKI_TEMPLATE = `${TEMPLATE_FOLDER}/public-wiki.md`;

const TECHNICAL_REQUIREMENTS_TEMPLATE = `${TEMPLATE_FOLDER}/technical-requirements-document.md`;

const DOC_FOLDER = 'docs';
const FILE_NAME = [
	'feature-requirements',
	'security-requirements',
	'ux-ui-design',
	'public-wiki',
	'technical-requirements'
];

export const generateDoc = async (featureName: string, featurePath: string) => {
	const id = generateId();

	const featureRequirementsDoc = await fs.readFile(FEATURE_REQUIREMENTS_TEMPLATE, 'utf8');
	const securityRequirementsDoc = await fs.readFile(SECURITY_REQUIREMENTS_TEMPLATE, 'utf8');
	const designDoc = await fs.readFile(DESIGN_DOCUMENT_TEMPLATE, 'utf8');
	const publicWikiDoc = await fs.readFile(PUBLIC_WIKI_TEMPLATE, 'utf8');
	const technicalRequirementsDoc = await fs.readFile(TECHNICAL_REQUIREMENTS_TEMPLATE, 'utf8');

	for (let index = 0; index < FILE_NAME.length; index++) {
		const doc = [
			featureRequirementsDoc,
			securityRequirementsDoc,
			designDoc,
			publicWikiDoc,
			technicalRequirementsDoc
		][index];
		let docContent = doc.replace(
			'[Feature Name]',
			featureName
				.split('-')
				.join(' ')
				.split(' ')
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(' ')
		);
		docContent = docContent.replace('{{id}}', id);
		await fs.writeFile(
			path.join(featurePath, featureName, DOC_FOLDER, `${FILE_NAME[index]}.md`),
			docContent
		);
	}
};
