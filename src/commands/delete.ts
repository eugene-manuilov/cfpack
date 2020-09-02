import { Command, flags } from '@oclif/command';
import { magenta } from 'chalk';
import { CloudFormation } from 'aws-sdk';
import { StackId } from 'aws-sdk/clients/cloudformation';

import { Logger } from '../logger';
import { Config } from '../config';
import { PollStackEvents } from '../poll-stack-events';
import { uuid } from '../utils';

class DeleteCommand extends Command {

	public static description = 'Deletes a CloudFormation stack.';

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
		const { flags } = this.parse( DeleteCommand );

		const config = Config.load( flags );
		const logger = new Logger( config.silent, config.verbose );

		logger.message( 'Deleting stack...' );

		const { stack } = config;
		const { name: stackName, region } = stack || {};
		const cloudformation = new CloudFormation( {
			apiVersion: '2010-05-15',
			region: region || 'us-east-1',
		} );

		logger.info( `├─ Checking whether ${ stackName } stack exists...` );

		try {
			const describeReponse = await cloudformation.describeStacks( { StackName: stackName } ).promise();
			const stackId: StackId = describeReponse && Array.isArray( describeReponse.Stacks ) && describeReponse.Stacks.length > 0
				? describeReponse.Stacks[0].StackId || stackName
				: stackName;

			const deleteRequest = {
				StackName: stackName || '',
				ClientRequestToken: uuid(),
			};

			const poller = new PollStackEvents( deleteRequest.ClientRequestToken, cloudformation, logger );
			const data: {} = await cloudformation.deleteStack( deleteRequest ).promise();

			const { ResponseMetadata } = data as { [x: string]: { [y: string]: string } };
			logger.info( '├─ Stack is deleting...' );
			logger.info( `├─ RequestId: ${ magenta( ResponseMetadata.RequestId ) }` );
			logger.info( `└─ StackId: ${ magenta( stackId ) }\n` );

			poller.start( stackId );
			await cloudformation.waitFor( 'stackDeleteComplete', { StackName: stackId } ).promise();
			poller.stop();

			logger.message( 'Stack has been deleted.' );
			logger.stop();
		} catch ( err ) {
			logger.stop();
			logger.error( `└─ ${ err.code }: ${ err.message }` );
			process.exit( 1 );
		}
	}

}

export default DeleteCommand;
