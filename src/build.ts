import { tmpdir } from 'os';
import { isAbsolute, resolve, join, dirname } from 'path';
import {
	existsSync,
	readdirSync,
	statSync,
	readFileSync,
	mkdtempSync,
	writeFileSync
} from 'fs';

import { CloudFormation } from 'aws-sdk';
import { safeLoad, Schema } from 'js-yaml';
import { magenta } from 'chalk';

import { createSchema } from './utils';
import { Logger } from './logger';
import { Config } from './config';

export class BuildTask {

	private readonly intrinsicFunctionsSchema: Schema = createSchema();

	private files: string[] = [];

	private template: { [x: string]: {} } = {};

	private templateFile: string = '';

	public constructor(
		private readonly options: Config,
		private readonly log: Logger
	) {}

	public run( next: Function ): void {
		if ( this.log ) {
			const { entry: entryFolder } = this.options || {};
			this.log.message( 'Build template file...' );
			this.log.info( `├─ Looking for templates in the ${ entryFolder } folder...` );
		}

		this.findTemplates();

		if ( this.files.length === 0 ) {
			return;
		}

		if ( this.log ) {
			this.log.info( '├─ Processing found templates...' );
		}

		this.processTemplates();

		if ( this.log ) {
			this.log.info( '├─ Validating final template...' );
		}

		this.validateFinalTemplate( () => {
			this.saveFinalTemplate();

			if ( this.log ) {
				this.log.info( `└─ Final template: ${ magenta( this.templateFile ) }\n` );
			}

			next( {
				template: this.template,
				file: this.templateFile,
			} );
		} );
	}

	public findTemplates(): void {
		const {
			entry = '',
			config = '',
		} = this.options || {};

		const entryPath = isAbsolute( entry )
			? entry
			: resolve( dirname( config ), entry );

		if ( !existsSync( entryPath ) && this.log ) {
			this.log.error( 'The entry folder is not found.' );
		}

		const files = this.walkTemplates( entryPath, [] );
		if ( this.log ) {
			if ( files.length > 0 ) {
				this.log.info( `├─ Found ${ files.length } template(s)...` );
			} else {
				this.log.info( '└─ Found no templates in the folder...' );
			}
		}

		this.files = files;
	}

	public walkTemplates( dir: string, list: string[] ): string[] {
		let newlist = [ ...list ];

		readdirSync( dir ).forEach( ( file ) => {
			const filename = join( dir, file );
			if ( statSync( filename ).isDirectory() ) {
				newlist = [ ...newlist, ...this.walkTemplates( filename, list ) ];
			} else {
				newlist.push( filename );
			}
		} );

		return newlist;
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

				if ( this.log ) {
					this.log.info( `├─ Processed ${ file } template...` );
				}
			} catch ( e ) {
				if ( this.log ) {
					this.log.info( `├─ Error processing ${ file } template: ${ e.toString().split( '\n' ).join( '\n│  ' ) }` );
				}
			}
		} );

		this.template = template;
	}

	public processTemplate( file: string ): { [x: string]: string | Date | {} } {
		const content = readFileSync( file, 'utf8' );
		return content.trim().charAt( 0 ) === '{'
			? JSON.parse( content )
			: safeLoad( content, { schema: this.intrinsicFunctionsSchema } );
	}

	public validateFinalTemplate( callback: Function ): void {
		const { stack } = this.options || {};
		const cloudformation = new CloudFormation( {
			apiVersion: '2010-05-15',
			region: stack ? stack.region : 'us-east-1',
		} );

		cloudformation.validateTemplate( { TemplateBody: JSON.stringify( this.template, undefined, 4 ) }, ( err ) => {
			if ( err ) {
				if ( this.log ) {
					this.log.error( `├─ ${ err.message }`, false );
					this.log.error( `└─ RequestId: ${ magenta( err.requestId ) }`, false );
					this.log.stop();
				}
				process.exit( 1 );
			} else {
				callback();
			}
		} );
	}

	public saveFinalTemplate(): void {
		let {
			config = '',
			output: filename,
		} = this.options || {};

		if ( !filename ) {
			const prefix = join( tmpdir(), 'cfpack-' );
			const folder = mkdtempSync( prefix );
			filename = join( folder, 'template.json' );
		}

		filename = isAbsolute( filename )
			? filename
			: resolve( dirname( config ), filename );

		const data = JSON.stringify( this.template, undefined, 4 );
		writeFileSync( filename, data, { encoding: 'utf8' } );
		this.templateFile = filename;
	}

}
