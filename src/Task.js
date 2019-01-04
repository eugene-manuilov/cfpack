const chalk = require('chalk');

class Task {

	constructor() {
		this.inputArtifacts = {};
		this.outputArtifacts = {};
		this.options = {};
	}

	setOptions(options) {
		this.options = options;
	}

	setInputArtifacts(artifacts) {
		this.inputArtifacts = artifacts;
	}

	getOutputArtifacts() {
		return this.outputArtifacts;
	}

	run() {
		throw new Error('The run method is not implemented.');
	}

	log(message) {
		if (!this.options.silent) {
			process.stdout.write(chalk.green(`${message}\n`));
		}
	}

	info(message) {
		if (!this.options.silent && this.options.verbose) {
			process.stdout.write(chalk.white(`${message}\n`));
		}
	}

}

module.exports = Task;
