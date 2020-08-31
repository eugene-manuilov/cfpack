import { isAbsolute, resolve } from 'path';

import { RunnerContext, Stack } from './types';

/**
 * The class responsible for configuration managment.
 */
export class Config {

	/**
	 * Constructor.
	 *
	 * @since 2.0.0
	 *
	 * @param {RunnerContext} data The config data.
	 */
	public constructor( private readonly data: RunnerContext ) {}

	/**
	 * Loads a config file using initial configuration options provided using CLI args and returns a new config instance.
	 *
	 * @since 2.0.0
	 * @throws {Error} When config file can't be found.
	 *
	 * @static
	 * @access public
	 * @param {RunnerContext} data The initial configuration.
	 * @returns {Config} A new instance of the Config class.
	 */
	public static load( data: RunnerContext ): Config {
		try {
			const configPath = isAbsolute( data.config )
				? data.config
				: resolve( process.cwd(), data.config );

			const config = require( configPath );
			return new Config( { ...config, ...data } );
		} catch ( e ) {
			// do nothing.
		}

		throw new Error( 'Config file hasn\'t been found.' );
	}

	public get silent(): boolean {
		return !!this.data.silent;
	}

	public get verbose(): boolean {
		return !!this.data.verbose;
	}

	public get stack(): Stack {
		if ( this.data.stack ) {
			return this.data.stack;
		}

		return {} as Stack;
	}

	public get entry(): string {
		return this.data.entry || '';
	}

	public get output(): string {
		return this.data.output || '';
	}

}
