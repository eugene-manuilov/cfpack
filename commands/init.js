const Runner = require('../src/Runner');
const InitTask = require('../src/tasks/Init');

module.exports = (args) => {
	const runner = new Runner(args);

	runner.use(new InitTask());
	runner.execute();
};
