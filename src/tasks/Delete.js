const AWS = require('aws-sdk');
const Task = require('../Task');

class DeleteTask extends Task {

	run() {
		this.log.message('Deleting stack...');

		const { stack } = this.options;
		const params = { StackName: stack.name };

		const cloudformation = new AWS.CloudFormation({
			apiVersion: '2010-05-15',
			region: stack.region,
		});

		this.log.info(`├─ Checking whether ${stack.name} stack exists...`);
		cloudformation.describeStacks(params, (err) => {
			if (err) {
				this.log.error('└─ Stack doesn\'t exist...');
			} else {
				cloudformation.deleteStack(params, (err, data) => {
					if (err) {
						this.log.error(err);
					} else {
						this.log.message('└─ Stack has been deleted...');
					}
				});
			}
		});
	}

}

module.exports = DeleteTask;
