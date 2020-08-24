import { uuid } from './uuid';

describe( 'uuid', () => {
	it( 'should return valid uuid string', () => {
		expect( uuid() ).toMatch( /\w{8}-\w{8}-\w{8}-\w{8}/ );
	} );

	it( 'should return a new uuid everytime', () => {
		const uuid1 = uuid();
		const uuid2 = uuid();
		expect( uuid1 ).not.toBe( uuid2 );
	} );
} );
