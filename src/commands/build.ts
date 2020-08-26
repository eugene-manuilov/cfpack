import { Command, flags } from '@oclif/command';

import { Runner } from '../runner';
import { BuildTask } from '../tasks/build';

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
			const runner = new Runner( flags );

			runner.loadConfig();
			runner.setupLogs();
			runner.use( new BuildTask() );

			runner.execute( resolve );
		} );
	}

}

export default BuildCommand;
