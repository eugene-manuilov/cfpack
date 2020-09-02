import { Command, flags } from '@oclif/command';

import { BuildTask } from '../tasks/build';
import { Config } from '../config';
import { Logger } from '../logger';

class BuildCommand extends Command {

	public static description = 'Assembles templates into one CloudFormation template.';

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
			const { flags } = this.parse( BuildCommand );
			const config = Config.load( flags );
			const logger = new Logger( config.silent, config.verbose );

			const builder = new BuildTask();
			builder.setLogger( logger );
			builder.setOptions( config );
			builder.run( resolve );
		} );
	}

}

export default BuildCommand;
