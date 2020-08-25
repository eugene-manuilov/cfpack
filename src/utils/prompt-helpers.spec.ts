import { isNotEmpty, ERROR_REQUIRED } from './prompt-helpers';

describe( 'isNotEmpty', () => {
	it( 'should return TRUE if provided string is not empty', () => {
		expect( isNotEmpty( 'test' ) ).toBe( true );
	} );

	it( 'should return ERROR_REQUIRED error message if provided string is empty', () => {
		expect( isNotEmpty( '' ) ).toBe( ERROR_REQUIRED );
	} );
} );
