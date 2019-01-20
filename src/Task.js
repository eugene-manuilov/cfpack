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

	run(next) {
		throw new Error('The run method is not implemented.');
	}

}

module.exports = Task;
