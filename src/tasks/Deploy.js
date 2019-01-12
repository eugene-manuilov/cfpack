const AWS = require('aws-sdk');
const chalk = require('chalk');

const Task = require('../Task');

class DeployTask extends Task {

	run() {
		this.log.message('Deploying template file...');

		const { stack } = this.options;
		this.cloudformation = new AWS.CloudFormation({
			apiVersion: '2010-05-15',
			region: stack.region,
		});

		this.log.info(`├─ Checking whether ${stack.name} stack exists...`);
		this.cloudformation.describeStacks({ StackName: stack.name }, (err) => {
			if (err) {
				this.createStack();
			} else {
				this.updateStack();
			}
		});
	}

	createStack() {
		this.log.info(`└─ Stack doesn't exist. Creating a new one...\n`);

		const { stack } = this.options;
		const params = Object.assign({}, stack.params, { 
			StackName: stack.name,
			TemplateBody: JSON.stringify(this.inputArtifacts.template),
		});

		this.cloudformation.createStack(params, this.getStackRequestCallback('Stack has been created...'));
	}

	updateStack() {
		this.log.info(`└─ Stack exists, updating...\n`);

		const { stack } = this.options;
		const params = Object.assign({}, stack.params, { 
			StackName: stack.name,
			TemplateBody: JSON.stringify(this.inputArtifacts.template),
		});

		this.cloudformation.updateStack(params, this.getStackRequestCallback('Stack has been updated...'));
	}

	getStackRequestCallback(message) {
		return (err, data) => {
			if (err) {
				this.log.error(`${err.code}: ${err.message}`, false);
				this.log.info(`└─ RequestId: ${chalk.magenta(err.requestId)}`);
				process.exit(1);
			} else {
				this.log.message(message);
				this.log.info(`├─ RequestId: ${chalk.magenta(data.ResponseMetadata.RequestId)}`);
				this.log.info(`└─ StackId: ${chalk.magenta(data.StackId)}`);
			}
		};
	}

}

module.exports = DeployTask;
