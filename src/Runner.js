class Runner {

	constructor(args) {
		this.args = args;
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
