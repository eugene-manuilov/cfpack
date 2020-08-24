import { isAbsolute, resolve } from 'path';

import { red } from 'chalk';

import { Middleware } from './middleware';
import { Logger } from './logger';
import { Task } from './task';
import { RunnerContext } from './runner-context.type';
import { RunnerData } from './runner-data.type';

export class Runner {

	private readonly middleware: Middleware = new Middleware();
	private log?: Logger;

	public constructor( private args: RunnerContext ) {}

	public loadConfig(): void {
		const { args } = this;

		if ( !args.config ) {
			process.stderr.write( red( 'Config file hasn\'t been found.\n' ) );
			process.exit( 1 );
		}

		const configPath = isAbsolute( args.config )
			? args.config
			: resolve( process.cwd(), args.config );

		try {
			const config = require( configPath );
			this.args = { ...config, ...args };
		} catch ( e ) {
			process.stderr.write( red( 'Config file hasn\'t been found.\n' ) );
			process.exit( 1 );
		}
	}

	public setupLogs( start = true ): void {
		this.log = new Logger( this.args.silent, this.args.verbose );
		if ( start ) {
			this.log.start();
		}
	}

	public use( task: Task ): void {
		this.middleware.use( ( data: RunnerData, next: Function ) => {
			if ( this.args ) {
				task.setOptions( this.args );
			}

			if ( this.log ) {
				task.setLogger( this.log );
			}

			task.setData( data );

			task.run( next );
		} );
	}

	public execute( cb: Function ): void {
		this.middleware.go( {}, () => {
			if ( this.log ) {
				this.log.stop();
			}

			cb();
		} );
	}

}
