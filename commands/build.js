const Runner = require('../src/Runner');
const BuildTask = require('../src/tasks/Build');

module.exports = function(args) {
	const runner = new Runner(args);
	
	runner.chain([
		new BuildTask(),
	]);

	runner.execute();
};
