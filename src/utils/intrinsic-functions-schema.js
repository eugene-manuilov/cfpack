const yaml = require('js-yaml');

module.exports = yaml.Schema.create([
	new yaml.Type('!Base64', {
		kind: 'scalar',
		construct: data => ({ 'Fn::Base64': data }),
	}),
	new yaml.Type('!Cidr', {
		kind: 'sequence',
		construct: data => ({ 'Fn::Cidr': data }),
	}),
	new yaml.Type('!FindInMap', {
		kind: 'sequence',
		construct: data => ({ 'Fn::FindInMap': data }),
	}),
	new yaml.Type('!GetAtt', {
		kind: 'scalar',
		construct: data => ({ 'Fn::GetAtt': data }),
	}),
	new yaml.Type('!GetAZs', {
		kind: 'scalar',
		construct: data => ({ 'Fn::GetAZs': data }),
	}),
	new yaml.Type('!ImportValue', {
		kind: 'scalar',
		construct: data => ({ 'Fn::ImportValue': data }),
	}),
	new yaml.Type('!Join', {
		kind: 'sequence',
		construct: data => ({ 'Fn::Join': data }),
	}),
	new yaml.Type('!Select', {
		kind: 'sequence',
		construct: data => ({ 'Fn::Select': data }),
	}),
	new yaml.Type('!Split', {
		kind: 'scalar',
		construct: data => ({ 'Fn::Split': data }),
	}),
	new yaml.Type('!Sub', {
		kind: 'scalar',
		construct: data => ({ 'Fn::Sub': data }),
	}),
	new yaml.Type('!Transform', {
		kind: 'mapping',
		construct: data => ({ 'Fn::Transform': data }),
	}),
	new yaml.Type('!Ref', {
		kind: 'scalar',
		construct: data => ({ 'Ref': data }),
	}),
]);
