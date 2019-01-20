const fs = require('fs');
const path = require('path');
const yargsInteractive = require('yargs-interactive');

const Task = require('../Task');

class Init extends Task {

	run() {
		const options = {
			interactive: { default: true },
			stackName: {
				type: 'input',
				default: 'my-stack',
				describe: 'Enter stack name',
			},
			stackRegion: {
				type: 'input',
				default: 'us-east-1',
				describe: 'Enter region',
			},
			entryFolder: {
				type: 'input',
				default: 'cloudformation',
				describe: 'Templates folder name',
			},
			outputFile: {
				type: 'input',
				default: 'cloudformation.json',
				describe: 'File name of combined template',
			},
		};

		yargsInteractive()
			.usage('$0 <command> [args]')
			.interactive(options)
			.then(Init.saveConfig);
	}

	static saveConfig(results) {
		const filename = path.resolve(process.cwd(), 'cfpack.config.js');
		const stream = fs.createWriteStream(filename, { encoding: 'utf8' });

		stream.write(`module.exports = {
	entry: ${JSON.stringify(results.entryFolder)}, // folder with templates
	output: ${JSON.stringify(results.outputFile)}, // resulting template file
	verbose: true, // whether or not to display additional details
	silent: false, // whether or not to prevent output from being displayed in stdout
	stack: {
		name: ${JSON.stringify(results.stackName)}, // stack name
		region: ${JSON.stringify(results.stackRegion)}, // stack region
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
			// 	},
			// ],
		},

		/* uncomment if you need to upload artifacts before creating/updating your stack */
		// artifacts: [
		// 	{
		// 		bucket: 's3-bucket-name',
		// 		files: {
		// 			'location/one/': 'local/files/**/*',
		// 			'location/two.zip': {
		// 				include: '*.xml',
		// 				exclude: 'test.xml',
		// 				path: 'local/files/**/*',
		// 				compression: 'zip', // zip | tar.gz | none
		// 			},
		// 		},
		// 	},
		// ],
	},
};
`);
		stream.close();
	}

}

module.exports = Init;
