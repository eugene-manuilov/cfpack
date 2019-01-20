const Task = require('../Task');

class Artifacts extends Task {

	run(next) {
		next(this.inputArtifacts);
	}

}

module.exports = Artifacts;
