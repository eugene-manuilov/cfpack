exports.testEnvironment = 'node';

exports.testMatch = [
	'<rootDir>/__tests__/**/[^_]*.js',
	'<rootDir>/src/**/*.spec.ts',
];

exports.transform = {
	'^.+\\.ts$': 'ts-jest',
};

exports.verbose = true;
