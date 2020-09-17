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
		'get-att.yml',
		'get-azs.yml',
		'import-value.yml',
		'join.yml',
		'select.yml',
		'split.yml',
		'sub.yml',
		'transform.yml',
		'ref.yml',
		// @todo: add template to test !Sub function
	];

	test.each(templates)('::processTemplate --> {%s}', (template) => {
		const task = new BuildTask();
		const filename = path.resolve(__dirname, '../templates/functions/', template);
		const result = task.processTemplate(filename);
		expect(task.lastError).toBeFalsy();
		expect(JSON.stringify(result, '', 2)).toMatchSnapshot();
	});
});
