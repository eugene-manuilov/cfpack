/**
 * The class implements middleware pattern.
 */
export class Middleware {

	/**
	 * Adds a new middleware function to the chain.
	 *
	 * @access public
	 * @param {Function} fn The middleware function.
	 */
	public use( fn: Function ): void {
		const self = this;
		const prevGo = this.go;

		self.go = ( input: unknown, next: Function ) => {
			prevGo.call( self, input, ( output: unknown ) => {
				fn.call( self, output, next.bind( self ) );
			} );
		};
	}

	/**
	 * Starts execution of the middleware functions chain.
	 *
	 * @access public
	 * @param {unknown} input The input value.
	 * @param {Function} next The next function callback.
	 */
	public go( input: unknown, next: Function ): void {
		next( input );
	}

}
