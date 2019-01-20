const AWS = require('aws-sdk');
const chalk = require('chalk');

const ApiTask = require('../ApiTask');

class DeployTask extends ApiTask {

	run(next) {
		this.log.message('Deploying template file...');

		const { stack } = this.options;
		this.cloudformation = new AWS.CloudFormation({
			apiVersion: '2010-05-15',
			region: stack.region,
		});

		this.log.info(`├─ Checking whether ${stack.name} stack exists...`);
		this.cloudformation.describeStacks({ StackName: stack.name }, (err) => {
			if (err) {
				this.createStack(next);
			} else {
				this.updateStack(next);
			}
		});
	}

	getStackParams() {
		const { stack } = this.options;
		return Object.assign({}, stack.params, {
			StackName: stack.name,
			TemplateBody: JSON.stringify(this.input.template),
			ClientRequestToken: this.taskUUID,
		});
	}

	createStack(next) {
		this.log.info(`└─ Stack doesn't exist. Creating a new one...\n`);

		const params = this.getStackParams();
		const callback = this.getStackRequestCallback('Stack is creating...', () => {
			this.cloudformation.waitFor('stackCreateComplete', { StackName: params.StackName }, () => {
				this.stopPollingEvents();
				this.log.message('Stack has been created.');
				next();
			});
		});

		this.cloudformation.createStack(params, callback);
	}

	updateStack(next) {
		this.log.info(`└─ Stack exists, updating...\n`);

		const params = this.getStackParams();
		const callback = this.getStackRequestCallback('Stack is updating...', () => {
			this.cloudformation.waitFor('stackUpdateComplete', { StackName: params.StackName }, () => {
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
				process.exit(1);
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
