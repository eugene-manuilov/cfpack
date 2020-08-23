import { Command, flags } from '@oclif/command';

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

	public async run(): Promise<void> {
		// const { args, flags } = this.parse( DeleteCommand );

		// const Runner = require('../src/Runner');
		// const DeleteTask = require('../src/tasks/Delete');

		// module.exports = (args) => {
		// 	const runner = new Runner(args);

		// 	runner.loadConfig();
		// 	runner.setupLogs();
		// 	runner.use(new DeleteTask());
		// 	runner.execute();
		// };
	}

}

export default DeleteCommand;
