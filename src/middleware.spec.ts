import { Middleware } from './middleware';

describe( 'Middleware', () => {
	it( 'should call functions chain', () => {
		const middleware = new Middleware();
		const cb = ( _: unknown, next: Function ) => { next(); };
		const func1 = jest.fn( cb );
		const func2 = jest.fn( cb );

		middleware.use( func1 );
		middleware.use( func2 );

		middleware.go( 1, () => {} );

		expect( func1 ).toHaveBeenCalledTimes( 1 );
		expect( func2 ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should break functions chain if a function does not call next function', () => {
		const middleware = new Middleware();
		const func1 = jest.fn();
		const func2 = jest.fn();

		middleware.use( func1 );
		middleware.use( func2 );

		middleware.go( 1, () => {} );

		expect( func1 ).toHaveBeenCalledTimes( 1 );
		expect( func2 ).not.toHaveBeenCalledTimes( 1 );
	} );

	it( 'should properly pass data', () => {
		const middleware = new Middleware();
		const cb = ( input: { value: number }, next: Function ) => {
			input.value++;
			next( input );
		};

		const func1 = jest.fn( cb );
		const func2 = jest.fn( cb );

		middleware.use( func1 );
		middleware.use( func2 );

		const data = { value: 0 };
		middleware.go( data, () => {} );

		expect( data.value ).toBe( 2 );
	} );
} );
