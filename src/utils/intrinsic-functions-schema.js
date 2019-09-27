const yaml = require('js-yaml');

const types = [];

const specialTypes = {
	Ref: 'Ref',
	Condition: 'Condition',
};

const schema = {
	scalar: [
		'Base64',
		'GetAtt',
		'GetAZs',
		'ImportValue',
		'Split',
		'Sub',
		'Ref',
		'Condition',
	],
	sequence: [
		'Cidr',
		'FindInMap',
		'Join',
		'Select',
		'And',
		'Equals',
		'If',
		'Not',
		'Or',
	],
	mapping: [
		'Transform',
	],
};

Object.keys(schema).forEach((kind) => {
	schema[kind].forEach((name) => {
		const fn = specialTypes[name] || `Fn::${name}`;
		const type = new yaml.Type(`!${name}`, { kind, construct: (data) => ({ [fn]: data }) });

		types.push(type);
	});
});

module.exports = yaml.Schema.create(types);
