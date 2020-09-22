import { join } from 'path';

import * as globby from 'globby';

/**
 * Finds files in a directory using glob patterns.
 *
 * @param {string} cwd The current working directory.
 * @param {string[]} patterns The array of glob patterns to search against cwd.
 * @returns {Proimse<string[]>} A promise instance that when resolved returns an array of found files.
 */
export function glob( cwd: string, ...patterns: string[] ): Promise<string[]> {
	const globPatterns = patterns.length > 0
		? patterns.map( ( pattern ) => join( cwd, pattern ) )
		: cwd;

	return globby( globPatterns, { absolute: true } );
}
