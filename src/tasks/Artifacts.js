const fs = require('fs');
const path = require('path');

const AWS = require('aws-sdk');
const chalk = require('chalk');
const glob = require('glob');
const Zip = require('node-native-zip');

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
			next(this.input);
			return;
		}

		this.s3 = new AWS.S3({
			apiVersion: '2006-03-01',
			region: stack.region,
		});

		this.list = (Array.isArray(artifacts) ? artifacts : [artifacts]).reverse();
		this.processArtifacts(this.list.pop())
			.then(this.runNextArtifacts)
			.then(() => {
				this.log.info('');
				next(this.input);
			})
			.catch((err) => {
				this.log.error(err);
			});
	}

	runNextArtifacts() {
		const item = this.list.pop();
		return item
			? this.processArtifacts(item).then(this.runNextArtifacts)
			: null;
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
		const args = typeof options === 'string'
			? { path: options }
			: Object.assign({}, options);

		let baseDir = args.baseDir || '.';
		if (!path.isAbsolute(baseDir)) {
			baseDir = path.join(process.cwd(), baseDir);
		}

		let filepath = args.path || '';
		if (!filepath) {
			return false;
		}

		if (args.baseDir) {
			filepath = path.join(args.baseDir, filepath);
		}

		return new Promise((resolve) => {
			glob(filepath, { absolute: true, stat: true }, (err, files) => {
				if (err) {
					this.log.error(err);
				} else {
					switch (args.compression) {
						case 'zip':
							this.compressZipAndUpload(bucket, location, baseDir, files)
								.then(resolve)
								.catch(resolve);
							break;
						default:
							this.log.info(`├─ Uploaded files to ${chalk.bold(`s3://${bucket}/${location}`)}`);
							resolve();
							break;
					}
				}
			});
		});
	}

	compressZipAndUpload(bucket, location, baseDir, files) {
		const filesMap = [];
		const archive = new Zip();

		files.forEach((file) => {
			if (!fs.statSync(file).isDirectory()) {
				filesMap.push({
					name: file.substring(baseDir.length),
					path: file,
				});
			}
		});

		if (!filesMap.length) {
			return Promise.resolve();
		}

		return new Promise((resolve) => {
			archive.addFiles(filesMap, (archiveError) => {
				if (archiveError) {
					this.log.warning(archiveError);
				} else {
					const params = {
						Bucket: bucket,
						Key: location,
						Body: archive.toBuffer(),
					};

					this.s3.putObject(params, (putError) => {
						if (putError) {
							this.log.warning(`├─ ${putError}`);
						} else {
							const uri = chalk.bold(`s3://${bucket}/${location}`);
							this.log.info(`├─ Uploaded files to ${uri}`);
						}

						resolve();
					});
				}
			});
		});
	}

}

module.exports = Artifacts;
