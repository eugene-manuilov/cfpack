import { magenta } from 'chalk';
import { Command, flags } from '@oclif/command';
import { CloudFormation } from 'aws-sdk';

import { BuildTask } from '../build';
import { ArtifactsTask } from '../artifacts';
import { Config } from '../config';
import { Logger } from '../logger';
import { uuid } from '../utils';
import { PollStackEvents } from '../poll-stack-events';

class DeployCommand extends Command {

	public static description = 'Assembles and deploys CloudFormation template.';

	public static flags = {
		config: flags.string( {
			description: 'Path to the config file.',
			default: 'cfpack.config.js',
			required: false,
		} ),
		verbose: flags.boolean( {
			description: 'Display extended details.',
			required: false,
		} ),
		silent: flags.boolean( {
			description: 'Prevent output from being displayed in stdout.',
			required: false,
		} ),
	};

	public async run(): Promise<void> {
		const { flags } = this.parse( DeployCommand );
		const config = Config.load( flags );

		const logger = new Logger( config.silent, config.verbose );
		logger.start();

		const builder = new BuildTask( config, logger );
		const { template } = await builder.run();

		await new Promise( ( resolve ) => {
			const artifacts = new ArtifactsTask( config, logger );
			artifacts.run( resolve );
		} );

		logger.message( 'Deploying template file...' );

		const { stack } = config;
		const {
			name: StackName = '',
			region = 'us-east-1',
			params: stackParams = {},
		} = stack;

		const cloudformation = new CloudFormation( {
			apiVersion: '2010-05-15',
			region,
		} );

		logger.info( `├─ Checking whether ${ StackName } stack exists...` );

		const params = {
			...stackParams,
			StackName,
			TemplateBody: template ? JSON.stringify( template ) : '',
			ClientRequestToken: uuid(),
		};

		const poller = new PollStackEvents( params.ClientRequestToken, cloudformation, logger );
		const stackInfo = await cloudformation.describeStacks( { StackName } ).promise().catch( () => undefined );
		if ( stackInfo ) {
			logger.info( '└─ Stack exists, updating...\n' );
			logger.message( 'Stack is updating...' );

			const response = await cloudformation.updateStack( params ).promise();
			const stackId = response.StackId || StackName;

			// @ts-ignore
			logger.info( `├─ RequestId: ${ magenta( response.ResponseMetadata.RequestId ) }` );
			logger.info( `└─ StackId: ${ magenta( stackId ) }\n` );

			poller.start();
			await cloudformation.waitFor( 'stackUpdateComplete', { StackName } ).promise();
			poller.stop();

			logger.message( 'Stack has been updated.' );
			logger.stop();
		} else {
			logger.info( '└─ Stack doesn\'t exist. Creating a new one...\n' );
			logger.message( 'Stack is creating...' );

			const response = await cloudformation.createStack( params ).promise();
			const stackId = response.StackId || StackName;

			// @ts-ignore
			logger.info( `├─ RequestId: ${ magenta( response.ResponseMetadata.RequestId ) }` );
			logger.info( `└─ StackId: ${ magenta( stackId ) }\n` );

			poller.start( stackId );
			await cloudformation.waitFor( 'stackCreateComplete', { StackName } ).promise();
			poller.stop();

			logger.message( 'Stack has been created.' );
			logger.stop();
		}
	}

}

export default DeployCommand;
