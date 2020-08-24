import { resolve } from 'path';

import { BuildTask } from './build';

describe( 'BuildTask', () => {
	test.each( [
		'and.yml',
		'equals.yml',
		'if.yml',
		'not.yml',
		'or.yml',
		'base64.yml',
		'cidr.yml',
		'find-in-map.yml',
		'get-att.yml',
		'get-azs.yml',
		'import-value.yml',
		'join.yml',
		'select.yml',
		'split.yml',
		'transform.yml',
		'ref.yml',
		// @todo: add template to test !Sub function
	] )( '::processTemplate --> {%s}', ( template ) => {
		const task = new BuildTask();
		const filename = resolve( __dirname, '__fixtures__', template );

		let result;

		expect( () => { result = task.processTemplate( filename ); } ).not.toThrow();
		expect( JSON.stringify( result, undefined, 2 ) ).toMatchSnapshot();
	} );
} );
