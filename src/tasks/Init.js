const fs = require('fs');
const path = require('path');
const yargsInteractive = require('yargs-interactive');

const Task = require('../Task');

class Init extends Task {

	/* eslint-disable class-methods-use-this */
	run(next) {
		const defaults = {
			stackname: 'my-stack',
			stackRegion: 'us-east-1',
			entryFolder: 'cloudformation',
			outputFile: 'cloudformation.json',
		};

		const filename = Init.getConfigFilename();
		if (fs.existsSync(filename)) {
			const module = require(filename);
			defaults.stackname = module.stack.name;
			defaults.stackRegion = module.stack.region;
			defaults.entryFolder = module.entry;
			defaults.outputFile = module.output;
		}

		const options = {
			interactive: { default: true },
			stackName: {
				type: 'input',
				default: defaults.stackname,
				describe: 'Enter stack name',
			},
			stackRegion: {
				type: 'input',
				default: defaults.stackRegion,
				describe: 'Enter region',
			},
			entryFolder: {
				type: 'input',
				default: defaults.entryFolder,
				describe: 'Templates folder name',
			},
			outputFile: {
				type: 'input',
				default: defaults.outputFile,
				describe: 'File name of combined template',
			},
		};

		yargsInteractive()
			.usage('$0 <command> [args]')
			.interactive(options)
			.then((results) => {
				Init.saveConfig(results);
				next(results);
			});
	}
	/* eslint-enable */

	static getConfigFilename() {
		return path.resolve(process.cwd(), 'cfpack.config.js');
	}

	static saveConfig(results) {
		const filename = Init.getConfigFilename();
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
		// 				baseDir: 'local/files/',
		// 				include: '*.xml',
		// 				exclude: 'test.xml',
		// 				path: '**/*',
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
