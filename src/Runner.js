const path = require('path');

class Runner {

	constructor(args) {
		const configPath = path.isAbsolute(args.config)
			? args.config
			: path.resolve(process.cwd(), args.config);

		const config = require(configPath);
		this.args = Object.assign({}, config, args);

		this.tasks = [];
	}

	chain(tasks) {
		this.tasks = tasks;
	}

	execute() {
		this.tasks.reduce(this.executeTask.bind(this), {});
	}

	executeTask(artifacts, task) {
		task.setOptions(this.args);
		task.setInputArtifacts(artifacts);
		task.run();
		return task.getOutputArtifacts();
	}

}

module.exports = Runner;
