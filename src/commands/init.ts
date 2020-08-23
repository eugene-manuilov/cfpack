import { Command, flags } from '@oclif/command';

class InitCommand extends Command {

	public static description = 'Initializes cfpack config in the current directory.';

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

	public async run(): Promise<void> {
		// const { args, flags } = this.parse( InitCommand );

		// const Runner = require('../src/Runner');
		// const InitTask = require('../src/tasks/Init');

		// module.exports = (args) => {
		// 	const runner = new Runner(args);

		// 	runner.use(new InitTask());
		// 	runner.execute();
		// };
	}

}

export default InitCommand;
