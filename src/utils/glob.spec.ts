import { tmpdir } from 'os';

import { glob } from './glob';

describe( 'glob', () => {
	const globby = require( 'globby' );

	afterEach( () => {
		globby.mockReset();
	} );

	it( 'should use cwd as a glob pattern if no patters are provided', async () => {
		const directory = tmpdir();

		await glob( directory );

		expect( globby ).toHaveBeenCalledTimes( 1 );
		expect( globby ).toHaveBeenCalledWith( directory, { absolute: true } );
	} );

	it( 'should compose file patterns passed via args', async () => {
		const directory = '/tmp';

		await glob( directory, '**/*.yaml', '*.json' );

		expect( globby ).toHaveBeenCalledTimes( 1 );
		expect( globby ).toHaveBeenCalledWith(
			[ '/tmp/**/*.yaml', '/tmp/*.json' ],
			{ absolute: true }
		);
	} );
} );
