#!/usr/bin/env node

const yargs = require('yargs');

function dispatch(args) {
	require(`./commands/${args['_'].join('')}`)(args);
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
