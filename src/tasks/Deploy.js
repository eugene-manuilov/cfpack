const AWS = require('aws-sdk');
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
		this.log.info(`└─ Stack doesn't exist. Creating a new one...`);

		const { stack } = this.options;
		const params = Object.assign({}, stack.params, { 
			StackName: stack.name,
			TemplateBody: JSON.stringify(this.inputArtifacts.template),
		});

		this.cloudformation.createStack(params, (err, data) => {
			if (err) {
				throw new Error(err);
			} else {
				this.log.message('Stack has been created...');
				this.log.info(JSON.stringify(data, '', 4));
			}
		});
	}

	updateStack() {
		this.info(`└─ Stack exists, updating...`);

		const { stack } = this.options;
		const params = Object.assign({}, stack.params, { 
			StackName: stack.name,
			TemplateBody: JSON.stringify(this.inputArtifacts.template),
		});

		this.cloudformation.updateStack(params, (err, data) => {
			if (err) {
				throw new Error(err);
			} else {
				this.log.message('Stack has been updated...');
				this.log.info(JSON.stringify(data, '', 4));
			}
		});
	}

}

module.exports = DeployTask;
