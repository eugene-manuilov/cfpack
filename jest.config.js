exports.testEnvironment = 'node';

exports.testMatch = [
	'<rootDir>/src/**/*.spec.ts',
];

exports.transform = {
	'^.+\\.ts$': 'ts-jest',
};

exports.verbose = true;
