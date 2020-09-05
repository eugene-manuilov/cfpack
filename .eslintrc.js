exports.env = {
	es2020: true,
	node: true,
	jest: true,
};

exports.extends = [
	'airbnb-base',
	'plugin:import/errors',
	'plugin:import/warnings',
];

exports.plugins = [
	'import',
];

exports.rules = {
	'no-plusplus': 0,
	'no-tabs': 0,
	indent: [2, 'tab', { SwitchCase: 1 }],
	'padded-blocks': [2, { classes: 'always' }],
	'global-require': 0,
	'import/no-dynamic-require': 0,
};
