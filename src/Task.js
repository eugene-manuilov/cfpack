const crypto = require('crypto');

class Task {

	constructor() {
		const token = [];
		for (let i = 0; i < 4; i++) {
			token.push(crypto.randomBytes(4).toString('hex'));
		}

		this.taskUUID = token.join('-');
		this.input = {};
		this.output = {};
		this.options = {};
	}

	setOptions(options) {
		this.options = options;
	}

	setLogger(log) {
		this.log = log;
	}

	setData(input) {
		this.input = input;
	}

	/* eslint-disable class-methods-use-this */
	run() {
		throw new Error('The run method is not implemented.');
	}
	/* eslint-enable */

}

module.exports = Task;
