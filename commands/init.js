const Runner = require('../src/Runner');
const InitTask = require('../src/tasks/Init');

module.exports = function(args) {
	const runner = new Runner(args);
	const task = new InitTask();
	
	runner.chain([task]);
	runner.execute();
};
