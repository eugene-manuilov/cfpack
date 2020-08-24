import { Command, flags } from '@oclif/command';

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

	public async run(): Promise<void> {
		// const { args, flags } = this.parse( ArtifactsCommand );

		// const Runner = require('../src/Runner');
		// const ArtifactsTask = require('../src/tasks/Artifacts');

		// module.exports = (args) => {
		// 	const runner = new Runner(args);

		// 	runner.loadConfig();
		// 	runner.setupLogs();
		// 	runner.use(new ArtifactsTask());
		// 	runner.execute();
		// };
	}

}

export default ArtifactsCommand;
