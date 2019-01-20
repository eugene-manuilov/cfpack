const chalk = require('chalk');
const ora = require('ora');

class Logger {

	constructor(silent, verbose) {
		this.silent = silent;
		this.verbose = verbose;

		this.ora = ora({
			spinner: 'line',
			hideCursor: true,
		});
	}

	start() {
		if (!this.silent) {
			this.ora.start();
		}
	}

	stop() {
		if (this.ora.isSpinning) {
			this.ora.stop();
		}
	}

	_sayIf(message, condition) {
		if (condition) {
			this.stop();
			process.stdout.write(`${message}\n`);
			this.start();
		}
	}

	message(message) {
		this._sayIf(chalk.green(message), !this.silent);
	}

	info(message) {
		this._sayIf(chalk.white(message), !this.silent && this.verbose);
	}

	warning(message) {
		this._sayIf(chalk.yellow(message), !this.silent && this.verbose);
	}

	error(message, exit = true) {
		this.stop();
		process.stderr.write(chalk.red(`${message}\n`));
		if (exit) {
			process.exit(1);
		}
	}

}

module.exports = Logger;
