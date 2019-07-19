module.exports = {
	entry: "templates",
	output: "cloudformation.json",
	verbose: true,
	silent: false,
	stack: {
		name: "appsync-with-lambdas",
		region: "us-east-1",
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
		// 				path: '**/*',
		// 				compression: 'zip', // zip | none
		// 			},
		// 		},
		// 	},
		// ],
	},
};
