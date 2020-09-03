import { Command, flags } from '@oclif/command';

import { ArtifactsTask } from '../artifacts';
import { Config } from '../config';
import { Logger } from '../logger';

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
			const config = Config.load( flags );
			const logger = new Logger( config.silent, config.verbose );

			const artifacts = new ArtifactsTask( config, logger );
			artifacts.run( resolve );
		} );
	}

}

export default ArtifactsCommand;
