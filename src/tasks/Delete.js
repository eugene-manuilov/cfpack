const AWS = require('aws-sdk');
const chalk = require('chalk');

const Task = require('../Task');

class DeleteTask extends Task {

	run() {
		this.log.message('Deleting stack...');

		const { stack } = this.options;
		const params = { StackName: stack.name };

		this.cloudformation = new AWS.CloudFormation({
			apiVersion: '2010-05-15',
			region: stack.region,
		});

		this.log.info(`├─ Checking whether ${stack.name} stack exists...`);
		this.cloudformation.describeStacks(params, (err) => {
			if (err) {
				this.log.error(`└─ ${err.code}: ${err.message}`);
			} else {
				this.deleteStack();
			}
		});
	}

	deleteStack() {
		const { stack } = this.options;
		const params = { StackName: stack.name };

		this.cloudformation.deleteStack(params, (err, data) => {
			if (err) {
				this.log.error(`${err.code}: ${err.message}`);
			} else {
				this.log.info('├─ Stack has been deleted...');
				this.log.info(`└─ RequestId: ${chalk.magenta(data.ResponseMetadata.RequestId)}`);
			}
		});
	}

}

module.exports = DeleteTask;
