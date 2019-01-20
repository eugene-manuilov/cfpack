const glob = require('glob');
const Task = require('../Task');

class Artifacts extends Task {

	run(next) {
		const { stack } = this.options;
		const { artifacts } = stack || {};
		if (artifacts) {
			const process = this.processArtifacts.bind(this);
			(Array.isArray(artifacts) ? artifacts : [artifacts]).forEach(process);
		}

		next(this.input);
	}

	processArtifacts(artifact) {
		const { bucket, files } = artifact;
		if (!bucket) {
			this.log.warning('S3 bucket is not defined, skipping artifacts uploading...');
			return;
		}

		const keys = Object.keys(files);
		if (!keys.length) {
			this.log.warning('No files are defined, skipping artifacts uploading...');
			return;
		}

		keys.forEach((key) => {
			this.processArtifact(bucket, key, files[key]);
		});
	}

	processArtifact(bucket, location, options) {
		const path = typeof options === 'string' ? options : (options.path || '');
		if (!path) {
			return;
		}

		glob(path, (err, files) => {
			if (err) {
				this.log.error(err);
			}
		});
	}

}

module.exports = Artifacts;
