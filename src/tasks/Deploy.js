const Task = require('../Task');

class DeployTask extends Task {

	run() {
		this.log('Deploy template file...');
	}

}

module.exports = DeployTask;
