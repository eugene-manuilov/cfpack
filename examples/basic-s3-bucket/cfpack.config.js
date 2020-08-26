const { networkInterfaces } = require( 'os' );
const { createHash } = require( 'crypto' );

/**
 * The folder name where all CloudFormation templates are stored.
 *
 * @type {string}
 */
exports.entry = 'cloudformation';

/**
 * The filename for generated CloudFormation template.
 *
 * @type {string}
 */
exports.output = 'cloudformation.json';

/**
 * Whether to display extended output information during commands run.
 *
 * @type {boolean}
 */
exports.verbose = true;

/**
 * Whether to suppress all output.
 *
 * @type {boolean}
 */
exports.silent = false;

/**
 * Stack declaration object.
 *
 * @type {object}
 */
exports.stack = {};

/**
 * The stack name.
 *
 * @type {string}
 */
exports.stack.name = 'cfpack-basic-s3-bucket';

/**
 * The stack region name. It should be a valid region ID supported by AWS.
 *
 * @see https://aws.amazon.com/about-aws/global-infrastructure/#AWS_Global_Infrastructure_Map
 * @type {string}
 */
exports.stack.region = 'us-east-1';

/**
 * Additional parameters for the stack creation request.
 *
 * @see: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudFormation.html#createStack-property
 * @type {object}
 */
exports.stack.params = {
	Parameters: [
		{
			ParameterKey: 'BucketID',
			ParameterValue: `cfpack-s3-bucket-${ createHash( 'sha1' ).update( JSON.stringify( networkInterfaces() ) ).digest( 'hex' ) }`,
		},
	],
};

/**
 * Artifacts list to use for the stack. Artifacts are uploaded to a S3 bucket before stack is created or updated.
 *
 * @example
 * exports.stack.artifacts = [
 *   {
 *     bucket: 'my-s3-bucket',
 *     files: {
 *       'assets/images/': 'local/images/*.png'
 *       'assets/bundle.zip': {
 *         baseDir: 'local/files/',
 *         path: '*.js',
 *         compression: 'zip', // zip | none
 *       },
 *     },
 *   },
 * ];
 *
 * @type {Array}
 */
exports.stack.artifacts = [];
