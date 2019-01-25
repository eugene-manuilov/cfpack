class Middleware {

	use(fn) {
		const self = this;
		self.go = (stack => (input, next) => {
			stack.call(self, input, (output) => {
				fn.call(self, output, next.bind(self));
			});
		})(self.go);
	}

	/* eslint-disable class-methods-use-this */
	go(input, next) {
		next(input);
	}
	/* eslint-enable */

}

module.exports = Middleware;
