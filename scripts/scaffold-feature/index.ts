import { cwd } from 'process';
import { parseArgs } from 'util';
import { generateDoc } from './generate-doc';
import { checkIfFeatureExists, scaffold } from './scaffold';

const { values, positionals } = parseArgs({
	args: Bun.argv,
	options: {
		regenerate: {
			short: 'r',
			type: 'boolean',
			default: false
		},
		folders: {
			short: 'f',
			type: 'string',
			multiple: true
		}
	},
	strict: true,
	allowPositionals: true
});

const run = async () => {
	const { regenerate, folders } = values;
	const path = cwd();
	const featureName = positionals[2];
	if (!featureName) {
		console.error('Feature name is required');
		process.exit(1);
	}
	if (positionals.length > 3) {
		console.error('Too many arguments');
		process.exit(1);
	}
	const prompts = {
		regenerate: {
			exists: 'Feature already exists. Are you sure you want to regenerate it? (y/n) ',
			notExists: 'Feature does not exist. Do you want to create it? (y/n) '
		},
		create: {
			exists: 'Feature already exists. Do you want to overwrite it? (y/n) ',
			notExists: 'Feature does not exist. Do you want to create it? (y/n) '
		}
	};
	const featurePath = `${path}/src/lib/features`;
	const featureExists = await checkIfFeatureExists(featureName, featurePath);

	const prompt = async (prompt: string) => {
		process.stdout.write(prompt);

		for await (const line of console) {
			if (line.toLowerCase() === 'y' || line.toLowerCase() === 'yes') {
				return true;
			} else if (line.toLowerCase() === 'n' || line.toLowerCase() === 'no') {
				return false;
			}
		}
	};

	if (regenerate && featureExists) {
		const answer = await prompt(prompts.regenerate.exists);
		if (answer) {
			await scaffold(featureName, featurePath, true, folders);
			await generateDoc(featureName, featurePath);
			process.exit(0);
		}
	} else if (regenerate && !featureExists) {
		const answer = await prompt(prompts.regenerate.notExists);
		if (answer) {
			await scaffold(featureName, featurePath, false, folders);
			await generateDoc(featureName, featurePath);
			process.exit(0);
		}
	} else if (!regenerate && !featureExists) {
		const answer = await prompt(prompts.create.notExists);
		if (answer) {
			await scaffold(featureName, featurePath, false, folders);
			await generateDoc(featureName, featurePath);
			process.exit(0);
		}
	} else if (!regenerate && featureExists) {
		const answer = await prompt(prompts.create.exists);
		if (answer) {
			await scaffold(featureName, featurePath, true, folders);
			await generateDoc(featureName, featurePath);
			process.exit(0);
		}
	}
};

run();
