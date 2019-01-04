#!/usr/bin/env node

const yargs = require('yargs');

function dispatch(args) {
	require(`./commands/${args['_'].join('')}`)(args);
}

yargs.command('deploy', 'Assembles and deploys CloudFormation template.', {}, dispatch);

yargs.demandCommand();
yargs.parse();
