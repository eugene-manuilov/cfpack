const yaml = require('js-yaml');

const types = [];
const schema = {
	scalar: [
		'Base64',
		'GetAtt',
		'GetAZs',
		'ImportValue',
		'Split',
		'Sub',
		'Ref',
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
		const fn = name === 'Ref' ? name : 'Fn::' + name;
		const type = new yaml.Type('!' + name, { kind, construct: data => ({ [fn]: data }) });

		types.push(type);
	});
});

module.exports = yaml.Schema.create(types);
