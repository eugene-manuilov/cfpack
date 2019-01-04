const Runner = require('../src/Runner');
const BuildTask = require('../src/tasks/Build');
const DeployTask = require('../src/tasks/Deploy');

module.exports = function(args) {
	const runner = new Runner(args);
	
	runner.chain([
		new BuildTask(),
		new DeployTask(),
	]);

	runner.execute();
};