import { resolve, join } from 'path';
import { promises as fs } from 'fs';

import { Command } from '@oclif/command';
import { prompt, ChoiceOptions } from 'inquirer';
import * as Mustache from 'mustache';

import { isNotEmpty } from '../utils';

class InitCommand extends Command {

	public static description = 'Initializes cfpack config in the current directory.';

	private static regions: ChoiceOptions[] =[
		{ name: 'US East (N. Virginia)', value: 'us-east-1' },
		{ name: 'US East (Ohio)', value: 'us-east-2' },
		{ name: 'US West (N. California)', value: 'us-west-1' },
		{ name: 'US West (Oregon)', value: 'us-west-2' },
		{ name: 'Africa (Cape Town)', value: 'af-south-1' },
		{ name: 'Asia Pacific (Hong Kong)', value: 'ap-east-1' },
		{ name: 'Asia Pacific (Mumbai)', value: 'ap-south-1' },
		{ name: 'Asia Pacific (Osaka-Local)', value: 'ap-northeast-3' },
		{ name: 'Asia Pacific (Seoul)', value: 'ap-northeast-2' },
		{ name: 'Asia Pacific (Singapore)', value: 'ap-southeast-1' },
		{ name: 'Asia Pacific (Sydney)', value: 'ap-southeast-2' },
		{ name: 'Asia Pacific (Tokyo)', value: 'ap-northeast-1' },
		{ name: 'Canada (Central)', value: 'ca-central-1' },
		{ name: 'China (Beijing)', value: 'cn-north-1' },
		{ name: 'China (Ningxia)', value: 'cn-northwest-1' },
		{ name: 'Europe (Frankfurt)', value: 'eu-central-1' },
		{ name: 'Europe (Ireland)', value: 'eu-west-1' },
		{ name: 'Europe (London)', value: 'eu-west-2' },
		{ name: 'Europe (Milan)', value: 'eu-south-1' },
		{ name: 'Europe (Paris)', value: 'eu-west-3' },
		{ name: 'Europe (Stockholm)', value: 'eu-north-1' },
		{ name: 'Middle East (Bahrain)', value: 'me-south-1' },
		{ name: 'South America (São Paulo)', value: 'sa-east-1' },
		{ name: 'AWS GovCloud (US-East)', value: 'us-gov-east-1' },
		{ name: 'AWS GovCloud (US)', value: 'us-gov-west-1' },
	];

	public async run(): Promise<void> {
		const anwsers = await prompt( [
			{
				name: 'stackName',
				message: 'Stack Name:',
				type: 'input',
				validate: isNotEmpty,
			},
			{
				name: 'stackRegion',
				message: 'Region:',
				type: 'list',
				choices: InitCommand.regions,
			},
			{
				name: 'entryFolder',
				message: 'Directory name for templates:',
				type: 'input',
				default: 'cloudformation',
				validate: isNotEmpty,
			},
			{
				name: 'outputFile',
				message: 'Output filename:',
				type: 'input',
				default: 'cloudformation.json',
				validate: isNotEmpty,
			},
			{
				name: 'capabilityIAM',
				message: 'Do you plan to manage IAM resources?',
				type: 'confirm',
				default: false,
			},
		] );

		// @ts-ignore
		Mustache.escape = JSON.stringify;

		const templateFilename = resolve( __dirname, '../templates/config.mustache' );
		const template = await fs.readFile( templateFilename, { encoding: 'utf-8' } );
		const config = Mustache.render( template, anwsers );

		await fs.writeFile( join( process.cwd(), 'cfpack.config.js' ), config );
	}

}

export default InitCommand;
