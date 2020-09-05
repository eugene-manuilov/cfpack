import { tmpdir } from 'os';
import { isAbsolute, resolve, join, dirname } from 'path';
import {
	readFileSync,
	promises as fs
} from 'fs';

import { CloudFormation } from 'aws-sdk';
import { safeLoad, Schema } from 'js-yaml';
import { magenta } from 'chalk';

import { glob, createSchema } from './utils';
import { Logger } from './logger';
import { Config } from './config';
import { RunnerData } from './types';

export class BuildTask {

	private readonly intrinsicFunctionsSchema: Schema = createSchema();

	private files: string[] = [];

	private template: { [x: string]: {} } = {};

	private templateFile: string = '';

	public constructor(
		private readonly options: Config,
		private readonly log: Logger
	) {}

	public async run(): Promise<RunnerData> {
		const { entry: entryFolder = process.cwd(), config } = this.options;
		this.log.message( 'Build template file...' );
		this.log.info( `├─ Looking for templates in the ${ entryFolder } folder...` );

		const entryPath = isAbsolute( entryFolder )
			? entryFolder
			: resolve( dirname( config ), entryFolder );

		const entryPathStats = await fs.stat( entryPath ).catch( () => undefined );
		if ( !entryPathStats ) {
			this.log.error( 'The entry folder is not found.' );
			return {};
		}

		this.files = await glob( entryPath, '**/*.yaml', '**/*.yml', '**/*.json' );
		if ( this.files.length > 0 ) {
			this.log.info( `├─ Found ${ this.files.length } template(s)...` );
		} else {
			this.log.info( '└─ Found no templates in the folder...' );
			return {};
		}

		this.log.info( '├─ Processing found templates...' );
		this.processTemplates();

		this.log.info( '├─ Validating final template...' );
		await this.validateFinalTemplate();

		await this.saveFinalTemplate();
		this.log.info( `└─ Final template: ${ magenta( this.templateFile ) }\n` );

		return {
			template: this.template,
			templateFile: this.templateFile,
		};
	}

	public processTemplates(): void {
		const template: { [x: string]: string | Date | {} } = {};

		this.files.forEach( ( file ) => {
			try {
				const doc = this.processTemplate( file );

				Object.keys( doc ).forEach( ( key: string ) => {
					const group: string | { [x: string]: unknown } | Date = doc[key];

					if ( group instanceof Date ) {
						const [ dateString ] = group.toISOString().split( 'T' );
						template[key] = dateString;
					} else if ( typeof group === 'object' ) {
						template[key] = { ...( template[key] || {} ), ...group };
					} else {
						template[key] = group;
					}
				} );

				this.log.info( `├─ Processed ${ file } template...` );
			} catch ( e ) {
				this.log.info( `├─ Error processing ${ file } template: ${ e.toString().split( '\n' ).join( '\n│  ' ) }` );
			}
		} );

		this.template = template;
	}

	public processTemplate( file: string ): { [x: string]: string | Date | {} } {
		const content = readFileSync( file, { encoding: 'utf8' } );
		return content.trim().charAt( 0 ) === '{'
			? JSON.parse( content )
			: safeLoad( content, { schema: this.intrinsicFunctionsSchema } );
	}

	public async validateFinalTemplate(): Promise<void> {
		try {
			const { stack } = this.options;
			const body = JSON.stringify( this.template, undefined, 4 );
			const cloudformation = new CloudFormation( {
				apiVersion: '2010-05-15',
				region: stack ? stack.region : 'us-east-1',
			} );

			await cloudformation.validateTemplate( { TemplateBody: body } ).promise();
		} catch ( err ) {
			this.log.error( `├─ ${ err.message }`, false );
			this.log.error( `└─ RequestId: ${ magenta( err.requestId ) }`, false );
			this.log.stop();
			process.exit( 1 );
		}
	}

	public async saveFinalTemplate(): Promise<void> {
		let {
			config = '',
			output: filename,
		} = this.options || {};

		if ( !filename ) {
			const prefix = join( tmpdir(), 'cfpack-' );
			const folder = await fs.mkdtemp( prefix );
			filename = join( folder, 'template.json' );
		}

		this.templateFile = isAbsolute( filename )
			? filename
			: resolve( dirname( config ), filename );

		await fs.writeFile(
			this.templateFile,
			JSON.stringify( this.template, undefined, 4 ),
			{ encoding: 'utf8' }
		);
	}

}
