import { Command, flags } from '@oclif/command';

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
		// const { args, flags } = this.parse( BuildCommand );

		// const Runner = require('../src/Runner');
		// const BuildTask = require('../src/tasks/Build');

		// module.exports = (args) => {
		// 	const runner = new Runner(args);

		// 	runner.loadConfig();
		// 	runner.setupLogs();
		// 	runner.use(new BuildTask());
		// 	runner.execute();
		// };
	}

}

export default BuildCommand;
