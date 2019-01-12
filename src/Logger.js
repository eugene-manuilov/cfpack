const chalk = require('chalk');

class Logger {

	constructor(silent, verbose) {
		this.silent = silent;
		this.verbose = verbose;
	}

	message(message) {
		if (!this.silent) {
			process.stdout.write(chalk.green(`${message}\n`));
		}
	}

	info(message) {
		if (!this.silent && this.verbose) {
			process.stdout.write(chalk.white(`${message}\n`));
		}
	}

	warning(message) {
		if (!this.silent && this.verbose) {
			process.stdout.write(chalk.yellow(`${message}\n`));
		}
	}

	error(message, exit = true) {
		process.stderr.write(chalk.red(`${message}\n`));
		if (exit) {
			process.exit(1);
		}
	}

}

module.exports = Logger;
