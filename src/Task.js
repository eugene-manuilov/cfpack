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

	setLogger(log) {
		this.log = log;
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

}

module.exports = Task;
