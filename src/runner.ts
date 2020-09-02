import { Middleware } from './middleware';
import { Logger } from './logger';
import { Task } from './task';
import { RunnerContext, RunnerData } from './types';
import { Config } from './config';

export class Runner {

	private readonly middleware: Middleware = new Middleware();
	private log?: Logger;
	private config?: Config;

	public constructor( private args: RunnerContext ) {}

	public loadConfig(): void {
		const { args } = this;
		this.config = Config.load( args );
	}

	public setupLogs( start = true ): void {
		this.log = new Logger( this.args.silent, this.args.verbose );
		if ( start ) {
			this.log.start();
		}
	}

	public use( task: Task ): void {
		this.middleware.use( ( data: RunnerData, next: Function ) => {
			if ( this.config ) {
				task.setOptions( this.config );
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
