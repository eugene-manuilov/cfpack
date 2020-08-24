import { Command, flags } from '@oclif/command';

import { Runner } from '../runner';
import { ArtifactsTask } from '../tasks/artifacts';

class ArtifactsCommand extends Command {

	public static description = 'Uploads artifacts to s3 buckets.';

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

	public run(): Promise<void> {
		return new Promise( ( resolve ) => {
			const { flags } = this.parse( ArtifactsCommand );
			const runner = new Runner( flags );

			runner.loadConfig();
			runner.setupLogs();
			runner.use( new ArtifactsTask() );

			runner.execute( resolve );
		} );
	}

}

export default ArtifactsCommand;
