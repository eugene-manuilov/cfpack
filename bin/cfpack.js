#!/usr/bin/env node

const { EOL } = require('os');
const path = require('path');

const yargs = require('yargs');
const chalk = require('chalk');
const checkForUpdate = require('update-check');

const pkg = require('../package.json');

function dispatch(args) {
	const commandPath = path.resolve(__dirname, '../commands/', args._[0]);
	const command = require(commandPath);

	command(args);
}

async function checkUpdates() {
	try {
		const update = await checkForUpdate(pkg);
		if (update) {
			process.stderr.write(chalk.yellow(`cfpack.js version ${update.latest} is now available. Please run ${chalk.bold('"npm i -g cfpack.js"')} to update!`) + EOL);
		}
	} catch (err) {
		process.stderr.write(chalk.yellow('Failed to automatically check for updates. Please ensure cfpack.js is up to date.') + EOL);
	}
}

async function bootstrap() {
	await checkUpdates();

	yargs.completion('completion', (current, argv) => {
		const commands = ['init', 'build', 'deploy', 'artifacts', 'delete', 'completion'];
		const filter = (command) => command.substring(0, current.length) === current;

		return argv._.length <= 2 ? commands.filter(filter) : [];
	});

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
		},
	});

	yargs.scriptName('cfpack');
	yargs.usage('Usage: cfpack <command>');

	yargs.command(
		'init',
		'Initializes cfpack config in the current directory.',
		{},
		dispatch,
	);

	yargs.command(
		'build',
		'Assembles templates into one CloudFormation template.',
		(innerYargs) => {
			innerYargs.option('no-validate', {
				describe: 'Skip template validation process',
				type: 'boolean',
			});
		},
		dispatch,
	);

	yargs.command(
		'deploy',
		'Assembles and deploys CloudFormation template.',
		(innerYargs) => {
			innerYargs.option('no-validate', {
				describe: 'Skip template validation process',
				type: 'boolean',
			});
		},
		dispatch,
	);

	yargs.command(
		'artifacts',
		'Uploads artifacts to s3 buckets.',
		{},
		dispatch,
	);

	yargs.command(
		'delete',
		'Deletes CloudFormation stack.',
		{},
		dispatch,
	);

	yargs.demandCommand();
	yargs.parse();
}

bootstrap();
