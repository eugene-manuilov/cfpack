const AWS = require('aws-sdk');
const chalk = require('chalk');
const glob = require('glob');

const Task = require('../Task');

class Artifacts extends Task {

	constructor() {
		super();
		this.runNextArtifacts = this.runNextArtifacts.bind(this);
	}

	run(next) {
		const { stack } = this.options;
		const { artifacts } = stack || {};
		if (!artifacts) {
			return next(this.input);
		}

		this.list = (Array.isArray(artifacts) ? artifacts : [artifacts]).reverse();
		this.processArtifacts(this.list.pop())
			.then(this.runNextArtifacts)
			.then(() => {
				next(this.input);
			})
			.catch((err) => {
				this.log.error(err);
			});
	}

	runNextArtifacts() {
		const item = this.list.pop();
		if (item) {
			return this.processArtifacts(item).then(this.runNextArtifacts);
		}
	}

	processArtifacts(artifact) {
		const { bucket, files } = artifact;
		if (!bucket) {
			this.log.warning('S3 bucket is not defined, skipping artifacts uploading...');
			return Promise.resolve();
		}

		const keys = Object.keys(files);
		if (!keys.length) {
			this.log.warning(`No files are defined for ${chalk.bold(bucket)} bucket, skipping...`);
			return Promise.resolve();
		}

		this.log.message(`Uploading artifacts to ${chalk.bold(bucket)} bucket...`);

		return new Promise((resolve, reject) => {
			const promises = [];
			for (let i = 0, len = keys.length; i < len; i++) {
				const promise = this.processArtifact(bucket, keys[i], files[keys[i]]);
				if (promise) {
					promises.push(promise);
				}
			}

			Promise.all(promises)
				.then(() => {
					this.log.info('└─ Artifacts are uploaded...');
					resolve();
				})
				.catch(() => {
					reject();
				});
		});
	}

	processArtifact(bucket, location, options) {
		const path = typeof options === 'string' ? options : (options.path || '');
		if (!path) {
			return false;
		}

		return new Promise((resolve) => {
			glob(path, { absolute: true }, (err, files) => {
				if (err) {
					this.log.error(err);
				} else {
					// console.log(files);
				}

				const uri = chalk.bold(`s3://${bucket}/${location}`);
				this.log.info(`├─ Uploaded files to ${uri}`)

				resolve();
			});
		});
	}

}

module.exports = Artifacts;
