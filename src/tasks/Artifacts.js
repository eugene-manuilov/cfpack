const fs = require('fs');
const path = require('path');

const AWS = require('aws-sdk');
const chalk = require('chalk');
const glob = require('glob');
const zip = require('node-native-zip');

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
				this.log.info('');
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
		const args = typeof options === 'string'
			? { path: options }
			: Object.assign({}, options);

		let baseDir = args.baseDir || '.';
		if (!path.isAbsolute(baseDir)) {
			baseDir = path.join(process.cwd(), baseDir);
		}

		console.log(options);

		let filepath =  args.path || '';
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
							this.compressZipAndUpload(baseDir, files)
								.then(resolve)
								.catch(resolve);
							break;
						default:
							const uri = chalk.bold(`s3://${bucket}/${location}`);
							this.log.info(`├─ Uploaded files to ${uri}`)
			
							resolve();
							break;
					}
				}
			});
		});
	}

	compressZipAndUpload(baseDir, files) {
		const filesMap = [];
		const archive = new zip();

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
			archive.addFiles(filesMap, (err) => {
				if (err) {
					this.log.warning(err);
				} else {
					const buff = archive.toBuffer();
				
					fs.writeFile("./test2.zip", buff, function () {
						resolve();
					});
				}
			});
		});
	}

}

module.exports = Artifacts;
