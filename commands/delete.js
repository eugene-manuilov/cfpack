const Runner = require('../src/Runner');
const DeleteTask = require('../src/tasks/Delete');

module.exports = function(args) {
	const runner = new Runner(args);
	const task = new DeleteTask();
	
	runner.loadConfig();
	runner.setupLogs();
	runner.chain([task]);
	runner.execute();
};
