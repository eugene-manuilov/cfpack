const Runner = require('../src/Runner');
const BuildTask = require('../src/tasks/Build');

module.exports = function(args) {
	const runner = new Runner(args);
	const build = new BuildTask();
	
	runner.loadConfig();
	runner.setupLogs();
	runner.chain([build]);
	runner.execute();
};
