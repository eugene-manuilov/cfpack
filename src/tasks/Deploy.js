const crypto = require('crypto');

const AWS = require('aws-sdk');
const chalk = require('chalk');

const Task = require('../Task');

class DeployTask extends Task {

	static generateClientRequestToken() {
		const token = [];
		for (let i = 0; i < 4; i++) {
			token.push(crypto.randomBytes(4).toString('hex'));
		}

		return token.join('-');
	}

	static getDateTime(timestamp) {
		const date = new Date(timestamp);

		const hour = date.getHours().toString().padStart(2, '0');
		const min  = date.getMinutes().toString().padStart(2, '0');
		const sec  = date.getSeconds().toString().padStart(2, '0');

		return `${hour}:${min}:${sec}`;
	}

	run() {
		this.clientRequestToken = DeployTask.generateClientRequestToken();
		this.events = {};

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

	getStackParams() {
		const { stack } = this.options;
		return Object.assign({}, stack.params, {
			StackName: stack.name,
			TemplateBody: JSON.stringify(this.inputArtifacts.template),
			ClientRequestToken: this.clientRequestToken,
		});
	}

	createStack() {
		this.log.info(`└─ Stack doesn't exist. Creating a new one...\n`);

		const params = this.getStackParams();
		const callback = this.getStackRequestCallback('Stack is creating...');

		this.cloudformation.createStack(params, callback);
		this.cloudformation.waitFor('stackCreateComplete', { StackName: params.StackName }, () => {
			clearInterval(this.pollInterval);
			this.log.message('Stack has been created.');
		});
	}

	updateStack() {
		this.log.info(`└─ Stack exists, updating...\n`);

		const params = this.getStackParams();
		const callback = this.getStackRequestCallback('Stack is updating...');

		this.cloudformation.updateStack(params, callback);
		this.cloudformation.waitFor('stackUpdateComplete', { StackName: params.StackName }, () => {
			clearInterval(this.pollInterval);
			this.log.message('Stack has been updated...');
		});
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
				this.log.info(`└─ StackId: ${chalk.magenta(data.StackId)}\n`);

				this.log.info(chalk.white.bold('Event Logs:'));
				this.pollInterval = setInterval(this.pollStackEvents.bind(this), 5000);
			}
		};
	}

	pollStackEvents() {
		const { stack } = this.options;
		this.cloudformation.describeStackEvents({ StackName: stack.name }, (err, data) => {
			if (!err) {
				data.StackEvents.reverse().forEach(this.displayEvent.bind(this));
			}
		});
	}

	displayEvent(event) {
		const { EventId, ClientRequestToken, Timestamp, LogicalResourceId, ResourceStatus, ResourceStatusReason } = event;

		if (ClientRequestToken === this.clientRequestToken && !this.events[EventId]) {
			this.events[EventId] = true;

			let status = (ResourceStatus || '').padEnd(50, ' ');
			switch (ResourceStatus) {
				case 'CREATE_COMPLETE':
				case 'UPDATE_COMPLETE':
				case 'UPDATE_ROLLBACK_COMPLETE':
					status = chalk.green.bold(status);
					break;
				case 'CREATE_FAILED':
				case 'UPDATE_FAILED':
				case 'UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS':
				case 'UPDATE_ROLLBACK_IN_PROGRESS':
					status = chalk.red.bold(status);
					break;
				default:
					status = chalk.gray.bold(status);
					break;
			}

			const message = [
				`[${DeployTask.getDateTime(Timestamp)}]`,
				(LogicalResourceId || '').padEnd(25, ' '),
				status,
				ResourceStatusReason || chalk.gray('—'),
			];

			this.log.info(message.join(' '));
		}
	}

}

module.exports = DeployTask;
