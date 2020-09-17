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
		'Split',
		'Sub',
	],
	mapping: [
		'Transform',
	],
};

const constructs = {
	GetAtt(data) {
		const parts = data.split('.');
		return {
			'Fn::GetAtt': [
				parts[0],
				parts.slice(1).join('.'),
			],
		};
	},
};

Object.keys(schema).forEach((kind) => {
	schema[kind].forEach((name) => {
		const fn = specialTypes[name] || `Fn::${name}`;
		const params = {
			kind,
			construct: constructs[name] || ((data) => ({ [fn]: data })),
		};

		const type = new yaml.Type(`!${name}`, params);
		types.push(type);
	});
});

module.exports = yaml.Schema.create(types);
