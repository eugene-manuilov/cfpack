const Runner = require('../src/Runner');
const DeleteTask = require('../src/tasks/Delete');

module.exports = (args) => {
	const runner = new Runner(args);

	runner.loadConfig();
	runner.setupLogs();
	runner.use(new DeleteTask());
	runner.execute();
};
