const path = require('path');
const BuildTask = require('../../src/tasks/Build');

describe('BuildTask', () => {
	const templates = [
		'and.yml',
		'equals.yml',
		'if.yml',
		'not.yml',
		'or.yml',
		'base64.yml',
		'cidr.yml',
		'find-in-map.yml',
	];

	test.each(templates)('::processTemplate --> {%s}', (template) => {
		const task = new BuildTask();
		const filename = path.resolve(__dirname, '../templates/functions/', template);
		const result = task.processTemplate(filename);
		expect(task.lastError).toBeFalsy();
		expect(JSON.stringify(result, '', 2)).toMatchSnapshot();
	});
});
