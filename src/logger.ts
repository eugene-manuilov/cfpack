import { green, yellow, white, red } from 'chalk';
import * as ora from 'ora';

export class Logger {

	private readonly ora: ora.Ora = ora( {
		spinner: 'dots',
		color: 'white',
		hideCursor: true,
	} );

	public constructor(
		private readonly silent?: boolean,
		private readonly verbose?: boolean
	) {}

	public start(): void {
		if ( !this.silent ) {
			this.ora.start();
		}
	}

	public stop(): void {
		if ( this.ora.isSpinning ) {
			this.ora.stop();
		}
	}

	public sayIf( message: string, condition?: boolean ): void {
		if ( condition ) {
			this.stop();
			process.stdout.write( `${ message }\n` );
			this.start();
		}
	}

	public message( message: string ): void {
		this.sayIf( green( message ), !this.silent );
	}

	public info( message: string ): void {
		this.sayIf( white( message ), !this.silent && this.verbose );
	}

	public warning( message: string ): void {
		this.sayIf( yellow( message ), !this.silent && this.verbose );
	}

	public error( message: string, exit = true ): void {
		this.stop();
		process.stderr.write( red( `${ message }\n` ) );
		if ( exit ) {
			process.exit( 1 );
		}
	}

}
