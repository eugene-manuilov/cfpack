import { Command, flags } from '@oclif/command';

import { Runner } from '../runner';
import { DeleteTask } from '../tasks/delete';

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
			default: false,
			required: false,
		} ),
		silent: flags.boolean( {
			description: 'Prevent output from being displayed in stdout.',
			default: false,
			required: false,
		} ),
	};

	public run(): Promise<void> {
		return new Promise( ( resolve ) => {
			const { flags } = this.parse( DeleteCommand );
			const runner = new Runner( flags );

			runner.loadConfig();
			runner.setupLogs();
			runner.use( new DeleteTask() );

			runner.execute( resolve );
		} );
	}

}

export default DeleteCommand;
