export async function validate(content: string): Promise<{
	error: boolean;
	message: string;
}> {
	for (const line of content.split('\n')) {
		if (line.includes('{{') && line.includes('}}')) {
			return {
				error: true,
				message: 'Line contains {{ or }}'
			};
		}
	}
	return {
		error: false,
		message: ''
	};
}
