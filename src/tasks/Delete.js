const AWS = require('aws-sdk');
const chalk = require('chalk');

const ApiTask = require('../ApiTask');

class DeleteTask extends ApiTask {

	run(next) {
		this.log.message('Deleting stack...');

		const { stack } = this.options;
		const params = { StackName: stack.name };

		this.cloudformation = new AWS.CloudFormation({
			apiVersion: '2010-05-15',
			region: stack.region,
		});

		this.log.info(`├─ Checking whether ${stack.name} stack exists...`);
		this.cloudformation.describeStacks(params, (err, data) => {
			if (err) {
				this.log.error(`└─ ${err.code}: ${err.message}`);
				next();
			} else {
				this.stackId = data.Stacks[0].StackId;
				this.deleteStack(next);
			}
		});
	}

	deleteStack(next) {
		const { stack } = this.options;
		const params = {
			StackName: stack.name,
			ClientRequestToken: this.taskUUID,
		};

		this.cloudformation.deleteStack(params, (err, data) => {
			if (err) {
				this.log.error(`${err.code}: ${err.message}`);
				next();
			} else {
				this.log.info('├─ Stack is deleting...');
				this.log.info(`└─ RequestId: ${chalk.magenta(data.ResponseMetadata.RequestId)}\n`);

				this.startPollingEvents(this.stackId);
				this.cloudformation.waitFor('stackDeleteComplete', { StackName: this.stackId }, () => {
					this.stopPollingEvents();
					this.log.message('Stack has been deleted.');
					next();
				});
			}
		});
	}

}

module.exports = DeleteTask;
