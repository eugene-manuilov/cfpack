const AWS = require('aws-sdk');
const chalk = require('chalk');

const ApiTask = require('../ApiTask');

class DeployTask extends ApiTask {

	run(next) {
		this.log.message('Deploying template file...');

		if (this.options.s3Bucket) {
			this.uploadTemplate(this.runWithTemplate.bind(this), next);
		} else {
			this.runWithTemplate(next);
		}
	}

	runWithTemplate(next) {
		const {
			stack
		} = this.options;
		this.cloudformation = new AWS.CloudFormation({
			apiVersion: '2010-05-15',
			region: stack.region,
		});

		this.log.info(`├─ Checking whether ${stack.name} stack exists...`);
		this.cloudformation.describeStacks({
			StackName: stack.name
		}, (err) => {
			if (err) {
				this.createStack(next);
			} else {
				this.updateStack(next);
			}
		});
	}

	uploadTemplate(callback, next) {
		this.log.info('├─ Uploading template to S3...');
		const s3 = new AWS.S3();
		var done = false;
		this.s3Key = Math.random().toString(16).substr(2, 8) + ".json";

		s3.upload({
			Body: JSON.stringify(this.input.template),
			Bucket: this.options.s3Bucket,
			Key: this.s3Key
		}, function (err, data) {
			if (err) {
				this.log.message('Unable to upload to S3, falling back to inline');
				this.s3Key = '';
			} else {

			}
			callback(next)
		}.bind(this));
	}

	getStackParams() {
		const {
			stack
		} = this.options;
		if (this.s3Key) {
			stack.params.TemplateURL = "https://s3.amazonaws.com/" + this.options.s3Bucket + "/" + this.s3Key;
		} else {
			stack.params.TemplateBody = JSON.stringify(this.input.template);
		}
		return {
			...stack.params,
			StackName: stack.name,
			ClientRequestToken: this.taskUUID,
		};
	}

	createStack(next) {
		this.log.info('└─ Stack doesn\'t exist. Creating a new one...\n');

		const params = this.getStackParams();
		const callback = this.getStackRequestCallback('Stack is creating...', () => {
			this.cloudformation.waitFor('stackCreateComplete', {
				StackName: params.StackName
			}, () => {
				this.stopPollingEvents();
				this.log.message('Stack has been created.');
				next();
			});
		});

		this.cloudformation.createStack(params, callback);
	}

	updateStack(next) {
		this.log.info('└─ Stack exists, updating...\n');

		const params = this.getStackParams();
		const callback = this.getStackRequestCallback('Stack is updating...', () => {
			this.cloudformation.waitFor('stackUpdateComplete', {
				StackName: params.StackName
			}, () => {
				this.stopPollingEvents();
				this.log.message('Stack has been updated.');
				next();
			});
		});

		this.cloudformation.updateStack(params, callback);
	}

	getStackRequestCallback(message, callback) {
		return (err, data) => {
			if (err) {
				this.log.error(`${err.code}: ${err.message}`, false);
				this.log.info(`└─ RequestId: ${chalk.magenta(err.requestId)}`);
				this.log.stop();
				process.exit(err.code === 'ValidationError' ? 0 : 1);
			} else {
				this.log.message(message);
				this.log.info(`├─ RequestId: ${chalk.magenta(data.ResponseMetadata.RequestId)}`);
				this.log.info(`└─ StackId: ${chalk.magenta(data.StackId)}\n`);

				this.startPollingEvents();
				callback();
			}
		};
	}

}

module.exports = DeployTask;