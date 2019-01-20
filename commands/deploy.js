const Runner = require('../src/Runner');
const BuildTask = require('../src/tasks/Build');
const DeployTask = require('../src/tasks/Deploy');

module.exports = function(args) {
	const runner = new Runner(args);

	const build = new BuildTask();
	const deploy = new DeployTask();
	
	runner.loadConfig();
	runner.setupLogs();
	runner.chain([build, deploy]);

	runner.execute();
};
