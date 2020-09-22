import { resolve } from 'path';
import { promises as fs } from 'fs';

import { Hook } from '@oclif/config';
import { yellow, yellowBright } from 'chalk';
import * as checkForUpdate from 'update-check';

const hook: Hook<'init'> = async () => {
	try {
		const pkg = await fs.readFile( resolve( __dirname, '../../package.json' ), { encoding: 'utf-8' } );
		const pkgJson = JSON.parse( pkg );

		// @ts-ignore
		const update = await checkForUpdate( pkgJson );
		if ( update ) {
			process.stderr.write( yellow( `cfpack.js version ${ update.latest } is now available. Please, run ${ yellowBright.bold( 'npm i -g cfpack.js' ) } to update!\n` ) );
		}
	} catch ( err ) {
		global.console.log( err );
		// do nothing
	}
};

export default hook;
