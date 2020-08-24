import { randomBytes } from 'crypto';

export function uuid(): string {
	const token = [];

	for ( let i = 0; i < 4; i++ ) {
		token.push( randomBytes( 4 ).toString( 'hex' ) );
	}

	return token.join( '-' );
}
