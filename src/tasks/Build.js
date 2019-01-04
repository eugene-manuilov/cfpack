const Task = require('../Task');

class BuildTask extends Task {

	run() {
		this.log('Build template file...');
	}

}

module.exports = BuildTask;
