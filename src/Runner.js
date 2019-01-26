const path = require('path');
const chalk = require('chalk');

const Logger = require('./Logger');
const Middleware = require('./Middleware');

class Runner {

	constructor(args) {
		this.args = args;
		this.middleware = new Middleware();
	}

	loadConfig() {
		const { args } = this;
		const configPath = path.isAbsolute(args.config)
			? args.config
			: path.resolve(process.cwd(), args.config);

		try {
			const config = require(configPath);
			this.args = Object.assign({}, config, args);
		} catch (e) {
			process.stderr.write(chalk.red('Config file hasn\'t been found.\n'));
			process.exit(1);
		}
	}

	setupLogs(start = true) {
		this.log = new Logger(this.args.silent, this.args.verbose);
		if (start) {
			this.log.start();
		}
	}

	use(task) {
		this.middleware.use((data, next) => {
			task.setOptions(this.args);
			task.setLogger(this.log);
			task.setData(data);

			task.run(next);
		});

		return this;
	}

	execute() {
		this.middleware.go({}, () => {
			if (this.log) {
				this.log.stop();
			}
		});
	}

}

module.exports = Runner;
