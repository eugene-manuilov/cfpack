#!/usr/bin/env node

const path = require('path');
const yargs = require('yargs');

function dispatch(args) {
	const commandPath = path.resolve(__dirname, '../commands/', args['_'][0]);
	const command = require(commandPath);
	
	command(args);
}

yargs.options({
	config: {
		type: 'string',
		describe: 'Path to the config file.',
		default: 'cfpack.config.js',
	},
	verbose: {
		type: 'boolean',
		describe: 'Show more details',
	},
	silent: {
		type: 'boolean',
		describe: 'Prevent output from being displayed in stdout',
	}
});

yargs.command('build', 'Assembles templates into one CloudFormation template.', {}, dispatch);
yargs.command('deploy', 'Assembles and deploys CloudFormation template.', {}, dispatch);

yargs.demandCommand();
yargs.parse();
