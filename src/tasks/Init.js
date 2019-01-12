const fs = require('fs');
const path = require('path');

const Task = require('../Task');

class Init extends Task {

	run() {
		const filename = path.resolve(process.cwd(), 'cfpack.config.js');
		const stream = fs.createWriteStream(filename, { encoding: 'utf8' });

		stream.write(`module.exports = {
	entry: "cloudformation", // folder with templates
	output: "cloudformation.json", // resulting template file
	verbose: true, // whether or not to display additional details
	silent: false, // whether or not to prevent output from being displayed in stdout
	stack: {
		name: "my-stack", // stack name
		region: "us-east-1", // stack region
		params: {
			/**
			 * Extra parameters that can be used by API
			 * @see: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudFormation.html#createStack-property
			 */

			/* uncomment if your CloudFormation template creates IAM roles */
			// Capabilities: ['CAPABILITY_IAM'],

			/* uncomment if your CloudFormation require parameters */
			// Parameters: [
			// 	{
			// 		ParameterKey: 'my-parameter',
			// 		ParameterValue: 'my-value',
			// 	}
			// ]
		}
	}
};
`);
		stream.close();
	}

}

module.exports = Init;
